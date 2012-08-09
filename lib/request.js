var util = require('util')
  , EventEmitter = require('events').EventEmitter;

module.exports = function(db){   
  /*
   * Sends a http/https request using the provided db.transport.
   * Invokes callback(err,res) when done or emits 'result','error' 
   * events if no callback has been provided.
   * Provides: 
   *  filter(options,callback) for attribute result filtering.
   */
  function Request(options,path,data,callback) { 
    EventEmitter.call(this);
    var request = this, buf = "" 
    , json = (data && !data.length) ? JSON.stringify(data) : null
    , params = db.extend(true,{
      "path" : path,
      "headers" : {
        "Content-Type": "application/json",
        "Content-Length": json ? json.length : (data && data.length ? data.length : 0)
      }
    },options, db.config.server)
    , req = db.transport.request(params,function(res) {
        res.on('data',function(data){
          buf += data;
        }).on('end',function(){ 
          request.headers = res.headers;
          if(buf.length > 0) {
            try{
              request.result = JSON.parse(buf);
            } catch(e) {
              request.data = buf;
            } 
          } 
          if(request.result)
            handle_result(request.result.error,res.statusCode,request.result.errorMessage);
          else {  
            if(res.error === undefined) res.error = true;
            handle_result(res.error,res.statusCode,res.message);
          }  
        });
      }).on('error',function(e){    
        handle_result(true,e.code,e.message);
      });
      
    function handle_result(error,code,message) {
      request.error = {code:code,message:message};
      if(callback) { 
        callback(error && code,error ? message : request.result || request.data, request.headers);
      }  
      else {
        if(!error) request.emit('result',request.result || request.data, request.headers);
        else request.emit('error',request.error);
      }
    }
    
    /* json or buffered data */
    if(data) req.write(json ? json : data);
    req.end();
    
    /* log errors to console */
    request.on('error', function(e){
      console.log("error(%s): ", e.code, e.message);
    });
    
    /*
     * Filters attributes from the result set and returns matched objects
     * Request.filter(string "name" || array ["names"])
     */
    request.filter = function(options,callback) {
      var result = {}, fa = [];
      
      if( typeof options === "string" ) fa = options.split(/[\s,]+/);
      else if( typeof options === "array" ) fa = options;
      else fa = Array.prototype.slice.call(options);
      
      fa.forEach(function(f){
        if(request.result[f]) result[f] = request.result[f]; 
      });
      request.result = result;
      if(callback) callback(request.result);
    };  
                                  
  }
  util.inherits(Request, EventEmitter);
  
  /* Request factories */
  return {  
    "post": function(path,data,callback) {
      return new Request({"method":"POST"},path,data,callback);
    },
    "get": function(path,callback) {
      return new Request({}, path, null, callback );
    }, 
    "put": function(path,data,callback) {
      return new Request({"method":"PUT"},path,data,callback);
    },
    "delete": function(path,callback) {
      return new Request({"method":"DELETE"},path,null,callback);
    },
    "patch": function(path,data,callback) {
      return new Request({"method":"PATCH"},path,data,callback);
    },
    "head": function(path,callback) {
      return new Request({"method":"HEAD"},path,null,callback);
    },
    "raw": function(options,path,data,callback) {
      return new Request(options,path,data,callback);
    }
  }
};

