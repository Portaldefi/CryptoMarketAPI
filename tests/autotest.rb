########################################################################################################################
   #####################################################################################################################
#-----------------------------------------------------------------------------------------------------------------------
   #--------------------------------------------------------------------------------------------------------------------

require "pp"
require "yaml"
require "json"
require "faraday"
require "benchmark"
require "facets/math/median"
require "facets/math/percentile"

$\ = "\n"            # appended to output of all print() calls

########################################################################################################################

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

CONFIG_FILE = "autotest.yaml"                           # default config file name
config = YAML.load_file( CONFIG_FILE )                  # this can throw an exception
# check for required fields in config yaml
%w[ serverAddr serverPort requestCount interarrival symbols exchanges ].each { | param |
   raise( "config yaml must have #{ param } field" ) if ! config.has_key?( param )
}

min, max = config[ "interarrival" ]
raise( "interarrival minimum greater than maximum" ) if min > max
min /= 1000.0   # interarrival times in yaml are in milliseconds; rand() (below) expects seconds
max /= 1000.0

alerts = [ ]              # stores currently active alerts used by the alert endpoint lambda below

# the lambda's below return [ protocol, url, query, requestBody, expectedResponseBody ]
# protocol is one of: :get, :put, :post, :delete, :ws (websocket)
# url may include query params and is appended to serverAddr:serverPort strings specified in yaml
# requestBody not used for GET
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
       [ :get, "/exchange/list", "", nil, response ] },

   ->{ response = "response"
       exchange = config[ "exchanges" ].sample   # TODO: also check comma-separated list
       [ :get, "/exchange/pairs", "?ex=#{ exchange }", nil, response ] },

   ->{ response = "response"
       symbol   = config[ "symbols" ].sample
       exchange = config[ "exchanges" ].sample
       [ :get, "/exchange/ticker", "?ex=#{ exchange }&sym=#{ symbol }", nil, response ] },

   ->{ response = "response"
       [ :get, "/exchange/top_coin", "", nil, response ] },

   ->{ response = "response"
       [ :get, "/exchange/error_codes", "", nil, response ] },

   ->{ response = "response"
       [ :get, "/exchange/kraken_withdraw_fees", "", nil, response ] },
]

#-----------------------------------------------------------------------------------------------------------------------
# TODO: faraday does not support websockets
urlBase = "%s:%s" % [ config[ "serverAddr" ], config[ "serverPort" ] ]
http = Faraday.new( urlBase )                          # returns Faraday::Connection instance

# use the following to enable logging
# http = Faraday.new( urlBase ) { | f |                  # returns Faraday::Connection instance
#    f.response( :logger, nil, { headers: true, bodies: true, log_level: :debug } )
# }

latencies = { }   # endpoint => [ latencyOfEachAccess ]

1.upto( config[ "requestCount" ] ) {
   protocol, url, query, req, expectedResp = endpoints.sample.call   # randomly pick lambda from endpoint array
   response = nil                        # so this variable is visible outside the Benchmark blocks below

   time = case protocol
      when :get
         #printf( "\n%s\nget %s\n", "-" * 40, urlBase + url )
         Benchmark.measure {             # returns Benchmark::Tms instance
            response = http.get( url + query )   # returns Faraday::Response instance
         }
         .total                          # returns system + user time in seconds as Float
      when :put
         raise( "PUT not implemented" )
      when :post
         raise( "POST not implemented" )
      when :delete
         raise( "DELETE not implemented" )
      when :ws
         raise( "websockets not implemented" )
      else
         raise( "invalid protocol: #{ protocol }" )
   end

   time *= 1000.0   # convert to milliseconds

   if latencies.has_key?( url )
      latencies[ url ] << time
   else
      latencies[ url ] = [ time ]
   end

   # if response != expectedResp   # TODO: use json schema to validate response body?
   #    # received response did not match expected response
   # end

   sleep( rand( min..max ) )
}

allA = [ ]
printf( "%32s  %8s  %8s  %8s  %8s\n", "endpoint", "count", "10% tile", "median", "90% tile" )

latencies.each { | url, latencyA |
   latencyA = latencyA.sort
   len      = latencyA.length
   printf( "%32s  %8d", url, len )
   lenF     = len.to_f
   index90  = ( 0.9 * len ).round
   index90  = len - 1 if index90 > len - 1
   printf( "  %8.3f  %8.3f  %8.3f\n", latencyA[ ( 0.1 * lenF ).round  ], latencyA[ ( 0.5 * lenF ).round ], latencyA[ index90 ] )
   allA += latencyA
}

allA    = allA.sort
len     = allA.length
printf( "%32s  %8d", "total", len )
lenF    = len.to_f
index90 = ( 0.9 * len ).round
index90 = len - 1 if index90 > len - 1
printf( "  %8.3f  %8.3f  %8.3f\n", allA[ ( 0.1 * lenF ).round  ], allA[ ( 0.5 * lenF ).round ], allA[ index90 ] )

#-----------------------------------------------------------------------------------------------------------------------
