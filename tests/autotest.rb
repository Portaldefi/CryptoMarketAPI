########################################################################################################################
   #####################################################################################################################
#-----------------------------------------------------------------------------------------------------------------------
   #--------------------------------------------------------------------------------------------------------------------

require "benchmark"
require "faraday"
require "json"
require "pp"
require "yaml"

$\ = "\n"                       # appended to output of all print() calls
CONFIG_FILE = "autotest.yaml"   # default config file name
CHARSET = ( "A".."Z" ).to_a + ( "a".."z" ).to_a + ( "0".."9" ).to_a + %w[ _ +  - ]   # for random URL's and query params

########################################################################################################################
# generate a random string of length "len" with characters taken from CHARSET
def randString( len )
   a = Array.new( len ) {
      CHARSET.sample
   }

   a.join
end

#-----------------------------------------------------------------------------------------------------------------------

def percentiles( a )
   aSort = a.sort
   lenF  = a.length.to_f
   idx10 = ( 0.1 * lenF ).round - 1
   idx10 = 0 if idx10 < 0
   idx50 = ( 0.5 * lenF ).round - 1
   idx90 = ( 0.9 * lenF ).round - 1
   [ aSort[ idx10 ], aSort[ idx50 ], aSort[ idx90 ], aSort ]
end

#-----------------------------------------------------------------------------------------------------------------------

def genQuery( paramA )
   if rand( 1..100 ) <= 70   # return valid query param 70% of the time; TODO: make this configurable?
      paramA.sample
   else                      # else return invalid query param
      randString( rand( 1..8 ) )
   end
end

########################################################################################################################
# state machine to model lifecycle of alerts
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

min, max = config[ "interArrival" ]
raise( "interArrival minimum greater than maximum" ) if min > max
min /= 1000.0   # interarrival times in yaml are in milliseconds; rand() (below) expects seconds
max /= 1000.0

alerts = [ ]              # stores currently active Alert instances used by the alert endpoint lambda below

# the lambda's below return [ protocol, url, query, requestBody, expectedResponseBody, invalid ]
# protocol is one of: :get, :put, :post, :delete, :ws (websocket)
# query string appended to url string; requestBody not used for GET
# invalid is true or false and indicates validity of url (not query params)
# lambda's can access config parameters via the "config" variable defined above
endpoints = [
	# ->{ request  = "request"
	#     response = "response"
   #     id       = "id"
   #     devId    = "devId"
   #     price    = "price"
	#     [ :get, "/create_alert?#{ id }&#{ devId }&#{ price }", request, response ] },   # ?id,dev_id,coin,price

	# ->{ request  = "request"
	#     response = "response"
   #     id       = "id"
	#     [ :get, "/delete_alert?#{ id }", request, response ] },   # ?id

	# ->{ request  = "request"
	#     response = "response"
   #     devId    = "devId"
   #     token    = "token"
   #     platform = "platform"
	#     [ :get, "/register_user?#{ devId }&#{ token }&#{ platform }", request, response ] }    # ?dev_id,token,platform

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
   #     response = "response"
      #  [ :get, url, request, response ] },

   ->{ response = "response"   # TODO: consider verifying response json with json-schema (or equivalent)
       [ :get, "/exchange/list", "", nil, response, false ] },

   ->{ response = "response"
       exchange = genQuery( config[ "exchanges" ] )   # TODO: also check comma-separated list
       [ :get, "/exchange/pairs", "?ex=#{ exchange }", nil, response, false ] },

   ->{ response = "response"
       symbol   = genQuery( config[ "symbols"   ] )
       exchange = genQuery( config[ "exchanges" ] )
       [ :get, "/exchange/ticker", "?ex=#{ exchange }&sym=#{ symbol }", nil, response, false ] },

   ->{ response = "response"
       [ :get, "/exchange/top_coin", "", nil, response, false ] },

   ->{ response = "response"
       [ :get, "/exchange/error_codes", "", nil, response, false ] },

   ->{ response = "response"
       [ :get, "/exchange/kraken_withdraw_fees", "", nil, response, false ] },

   ->{ method = %i[ get put post delete ].sample    # generate an invalid access

       url = ""
       rand( 1..3 ).times {   # never generates "/" nor queries; TODO: make number of url components configurable?
          url << "/" + randString( rand( 1..8 ) )   # TODO: make character count range configurable?
       }

       request  = randString( rand( 0..100 ) )      # random request body; not needed for get or delete
       response = "error"                           # TODO: regex or json schema to match error response
       [ method, url, "", request, response, true ] }
]

#-----------------------------------------------------------------------------------------------------------------------
# TODO: faraday does not support websockets
urlBase = "%s:%s" % [ config[ "serverAddr" ], config[ "serverPort" ] ]
http = Faraday.new( urlBase )                    # returns Faraday::Connection instance

# use the following to enable logging
# http = Faraday.new( urlBase ) { | f |
#    f.response( :logger, nil, { headers: true, bodies: true, log_level: :debug } )
# }

# latencies for each method x url (not including query string); [method][url] => [ latencyOfEachAccess+ ]
latencies = Hash.new { | h, key |
   h[ key ] = Hash.new { | h2, key2 |
      h2[ key2 ] = [ ]
   }
}

1.upto( config[ "requestCount" ] ) {
   protocol, url, query, req, expectedResp, invalid = endpoints.sample.call   # call random lambda from endpoint array
   response = nil                                # make this variable visible outside the Benchmark blocks below
   #printf( "\n%s\n%s %s\n", "-" * 40, protocol, url + query )

   time = case protocol
      when :get
         Benchmark.measure {                     # returns Benchmark::Tms instance
            response = http.get( url + query )   # returns Faraday::Response instance
         }
         .total                                  # returns system + user time in seconds as Float
      when :put
         Benchmark.measure {
            response = http.put( url + query, req )
         }
         .total
      when :post
         Benchmark.measure {
            response = http.post( url + query, req )
         }
         .total
      when :delete
         Benchmark.measure {
            response = http.delete( url + query )
         }
         .total
      when :ws
         raise( "websockets not implemented" )
      else
         raise( "invalid protocol: #{ protocol }" )
   end

   url = "invalid" if invalid
   latencies[ protocol ][ url ] << time * 1000.0   # convert time to milliseconds

   # if response != expectedResp   # TODO: use json schema to validate response body?
   #    # received response did not match expected response
   # end

   sleep( rand( min..max ) )   # interarrival time
}

# print latency distribution for each: method x endpoint; method (all endpoints); and all requests
allA = [ ]

latencies.each { | method, endpointH |
   printf( "\n%s\n%s\n", "-" * 80, method )
   printf( "%32s  %8s  %8s  %8s  %8s\n", "endpoint", "count", "10% tile", "median", "90% tile" )
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
