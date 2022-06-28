########################################################################################################################
   #####################################################################################################################
#-----------------------------------------------------------------------------------------------------------------------
   #--------------------------------------------------------------------------------------------------------------------

require "benchmark"
require "faraday"
require "json"
require "pp"
require "yaml"
require "json-schema"

$\ = "\n"                       # appended to output of all print() calls
CONFIG_FILE = "autotest.yaml"   # default config file name
CHARSET = ( "A".."Z" ).to_a + ( "a".."z" ).to_a + ( "0".."9" ).to_a + %w[ _ + - ]   # for random URL's and query params

########################################################################################################################
# return a string of length "len" with characters taken randomly from CHARSET

def randString( len )
   a = Array.new( len ) {
      CHARSET.sample
   }

   a.join
end

#-----------------------------------------------------------------------------------------------------------------------
# given array "a", return 10, 50, 90 percentiles along with sorted "a"

def percentiles( a )
   lenF  = a.length.to_f
   idx10 = ( 0.1 * lenF ).round - 1
   idx10 = 0 if idx10 < 0
   idx50 = ( 0.5 * lenF ).round - 1
   idx90 = ( 0.9 * lenF ).round - 1
   aSort = a.sort
   [ aSort[ idx10 ], aSort[ idx50 ], aSort[ idx90 ], aSort ]   # returns [ nil, nil, nil, [ ] ] if a is empty
end

#-----------------------------------------------------------------------------------------------------------------------
# given an array of valid query values, return either a randomly selected valid value or a random invalid value

def genQuery( paramA )             # TODO: also return invalid flag
   if rand( 1..100 ) <= 70         # return valid query param 70% of the time; TODO: make this configurable?
      paramA.sample
   else                            # else return invalid query param
      randString( rand( 1..8 ) )   # TODO: make length configurable?
   end
end

########################################################################################################################
# state machine to model lifecycle of alerts; used by alert endpoint lambdas
class Alert
   #--------------------------------------------------------------------------------------------------------------------
   def initialize( )
      @state = :create
   end
   #--------------------------------------------------------------------------------------------------------------------
   def next( )
      case @state
         when :create
            @state = :send
            "/create_alert"
         when :send
            @state = :delete
            "/register_user"
         when :delete
            @state = :end
            "/delete_alert"
         else raise( "invalid alert state: #{ @state }" )
      end
   end
   #--------------------------------------------------------------------------------------------------------------------
end

########################################################################################################################

config = YAML.load_file( CONFIG_FILE )      # this can throw an exception
# check for required fields in config yaml
%w[ serverAddr serverPort requestCount interArrival symbols exchanges ].each { | param |
   raise( "config yaml must have #{ param } field" ) if ! config.has_key?( param )
}
# validate and process config fields
config[ "log" ] = false if ! config.has_key?( "log" )   # logging disabled by default
min, max = config[ "interArrival" ]
raise( "interArrival minimum greater than maximum" ) if min > max
min /= 1000.0   # interarrival times in yaml are in milliseconds; rand() (below) expects seconds
max /= 1000.0

# contains json schemas used to validate response bodies of each named endpoint
# these are separate so they're not re-created on each lambda activation and so they can be validated once at start
schemas = {

   "/exchange/list" => {
      type: "array",
      items: {
         type: "object",
         properties: {
            exchange: { type: "string" },
            id:       { type: "string" },
            icon:     { type: "string" },
            keys:     { type: "string" }
         },
         required: %w[ exchange id icon keys ],
         additionalProperties: false
      }
   },

   "/exchange/pairs" => {
      type: "array",
      items: {
         type: "object",
         properties: {
            exchange: {
               type: "array",
               items: {
                  type: "object",
                  properties: {
                     id:     { type: "string"  },
                     sym:    { type: "string"  },
                     bVol:   { type: "number"  },
                     qVol:   { type: "number"  },
                     price:  { type: "number"  },   # does not appear in all responses
                     active: { type: "boolean" }
                  },
                  required: %w[ id sym bVol qVol active ],
                  additionalProperties: false
               }
            },
            icon:   { type: "string" },
            name:   { type: "string" },
            base:   { type: "string" },
            quote:  { type: "string" },
            symbol: { type: "string" },
            change: { type: "number" },
            last:   { type: "number" },
            id:     { type: "string" },
            quote_icon: { type: "string" },
            quote_name: { type: "string" }         },
         required: %w[ exchange icon name base quote quote_icon quote_name symbol change last id ],
         additionalProperties: false
      }
   },

   "/exchange/top_coin" => {
      type: "array",
      items: {
         type: "object",
         properties: {
            change: { type: "number" },
            icon:   { type: "string" },
            last:   { type: "number" },
            name:   { type: "string" }
         },
         required: %w[ change icon last name ],
         additionalProperties: false
      }
   },

   "/exchange/error_codes" => {
      type: "object",
      patternProperties: {
         ".+": {          # accept a non-empty string containing any characters
            type: "array",
            items: {
               type: "object",
               properties: {
                  code: { type: "string" },
                  msg:  { type: "string" }
               },
               required: %w[ code msg ],
               additionalProperties: false
            }
         }
      }
   },

   "/exchange/kraken_withdraw_fees" => {
      type: "array",
      items: {
         type: "object",
         properties: {
            CurrencyLong: { type: "string"  },
            Currency:     { type: "string"  },
            TxFee:        { type: "number"  },
            CoinType:     { type: "string"  },
            IsActive:     { type: "boolean" },
            IsRestricted: { type: "boolean" },
            BaseAddress:  { type: "string"  },
            MinConfirmation: { type: "number" }
         },
         required: %w[ CurrencyLong Currency TxFee CoinType MinConfirmation IsActive IsRestricted BaseAddress ],
         additionalProperties: false
      }
   },

   "invalid" => {       # on invalid accesses server returns html, not json
      type: "object",
      properties: {
         status: { type: "string" },
         msg:    { type: "string" }
      },
      required: %w[ status msg ],
      additionalProperties: false
   }
}

# validate all json schemas
metaSchema = JSON::Validator.validator_for_name( "draft4" ).metaschema

schemas.each { | endpoint, schema |
   print( "invalid schema for '#{ endpoint }'" ) if ! JSON::Validator.validate( metaSchema, schema )
}

alerts = [ ]    # stores currently active Alert instances used by the alert endpoint lambda below

# the lambda's below return [ protocol, url, query, requestBody, invalid ]
# protocol is one of: :get, :put, :post, :delete, :ws (websocket)
# query string should be appended to url string; requestBody not used for GET
# invalid is boolean that indicates validity of url (not query params)
# TODO: need to indicate case of valid url and invalid queries so invalid response schema is used
# if necessary lambda's can access config parameters via the "config" variable defined above
endpoints = [
	# ->{ id    = "id"
   #     devId = "devId"
   #     price = "price"
	#     [ :get, "/create_alert", "?#{ id }&#{ devId }&#{ price }", nil, false ] },

	# ->{ id = "id"
	#     [ :get, "/delete_alert", "?#{ id }", nil, false ] },

	# ->{ request  = "request"
   #     devId    = "devId"
   #     token    = "token"
   #     platform = "platform"
	#     [ :get, "/register_user?#{ devId }&#{ token }&#{ platform }", request, response ] }

   # ->{ if rand() > alerts.length   # this condition could be causing execution of else when array is empty
   #    # probability of new alerts decreases with number of existing alerts
   #        alert = Alert.new
   #        alerts << alert
   #        url = alert.next
   #     else
   #        alert = alerts.sample
   #        url = alert.next
   #        alerts.delete( alert ) if url == "delete notification"   # remove notification if its lifecycle is complete
   #     end   # also need ability to return random endpoint not following state machine

   #     request  = "request"
   #  [ :get, url, nil, false ] },

   ->{ exchange = genQuery( config[ "exchanges" ] )   # TODO: also check comma-separated list
       [ :get, "/exchange/pairs", "?ex=#{ exchange }", nil, false ] },

   # ->{ symbol   = genQuery( config[ "symbols"   ] )   # TODO: returns 404; controller exists but is not connected to an endpoint
   #     exchange = genQuery( config[ "exchanges" ] )
   #     [ :get, "/exchange/ticker", "?ex=#{ exchange }&sym=#{ symbol }", nil, false ] },

   ->{ [ :get, "/exchange/list",                 "", nil, false ] },
   ->{ [ :get, "/exchange/top_coin",             "", nil, false ] },
   ->{ [ :get, "/exchange/error_codes",          "", nil, false ] },
   ->{ [ :get, "/exchange/kraken_withdraw_fees", "", nil, false ] },

   # ->{ method = %i[ get put post delete ].sample    # generate an invalid access; server returns html, not json
   #     url = ""
   #     rand( 1..3 ).times {   # never generates "/" nor queries; TODO: make number of url components configurable?
   #        url << "/" + randString( rand( 1..8 ) )   # TODO: make character count range configurable?
   #     }
   #     request  = randString( rand( 0..100 ) )      # random request body; not needed for get or delete
   #     [ method, url, "", request, true ] }
]

#-----------------------------------------------------------------------------------------------------------------------
# TODO: faraday does not support websockets
urlBase = "%s:%s" % [ config[ "serverAddr" ], config[ "serverPort" ] ]
#http = Faraday.new( urlBase )                    # returns Faraday::Connection instance

http = Faraday.new( urlBase ) { | f |
   f.response( :logger, nil, { headers: true, bodies: true, log_level: :debug } ) if config[ "log" ] == true
}

# latencies for each method x url (not including query string); [method][url] => [ latencyOfEachAccess+ ]
latencies = Hash.new { | h, key |
   h[ key ] = Hash.new { | h2, key2 |
      h2[ key2 ] = [ ]
   }
}

1.upto( config[ "requestCount" ] ) {
   protocol, endpoint, query, req, invalid = endpoints.sample.call   # call random lambda from endpoint array
   url = endpoint + query
   response = nil                                # make this variable visible outside the Benchmark blocks below

   time = case protocol
      when :get
         Benchmark.measure {             # returns Benchmark::Tms instance
            response = http.get( url )   # returns Faraday::Response instance
         }.total                         # from Benchmark::Tms instance, returns system + user time in seconds as Float
      when :put    then Benchmark.measure {  response = http.put( url, req )   }.total
      when :post   then Benchmark.measure {  response = http.post( url, req )  }.total
      when :delete then Benchmark.measure {  response = http.delete( url )     }.total
      when :ws     then raise( "websockets not implemented" )
      else raise( "invalid protocol: #{ protocol }" )
   end

   endpoint = "invalid" if invalid       # group latencies for all invalid endpoints into a single bin
   latencies[ protocol ][ endpoint ] << 1000.0 * time                           # convert time to milliseconds
   chk = JSON::Validator.fully_validate( schemas[ endpoint ], response.body )   # returns an array of errors

   if ! chk.empty?
      print( "\nresponse to #{ url } did not match schema" )
      pp( chk )
      print( "\n" )
   end

   sleep( rand( min..max ) )   # interarrival time
}

# print latency distribution for each: method x endpoint; method (all endpoints); and all requests
allA = [ ]

latencies.each { | method, endpointH |
   printf( "\n%s\n%s\n", "-" * 80, method )
   printf( "%32s  %8s  %8s  %8s  %8s\n", "endpoint", "count", "10%tile", "median", "90%tile" )
   allMethodA = [ ]

   endpointH.each { | url, latencyA |
      pcnt10, pcnt50, pcnt90, sortA = percentiles( latencyA )
      printf( "%32s  %8d  %8.3f  %8.3f  %8.3f\n", url, latencyA.length, pcnt10, pcnt50, pcnt90 )
      allMethodA += sortA
   }

   pcnt10, pcnt50, pcnt90, _ = percentiles( allMethodA )
   printf( "%32s  %8d  %8.3f  %8.3f  %8.3f\n", "total", allMethodA.length, pcnt10, pcnt50, pcnt90 )
   allA += allMethodA
}

pcnt10, pcnt50, pcnt90, _ = percentiles( allA )
printf( "\n\n%32s  %8d  %8.3f  %8.3f  %8.3f\n", "grand total", allA.length, pcnt10, pcnt50, pcnt90 )

#-----------------------------------------------------------------------------------------------------------------------
