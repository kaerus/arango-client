var extend = require('node.extend')
  , util = require('util')
  , EventEmitter = require('events').EventEmitter;

module.exports = function(db){  
  EventEmitter.call(this);
  
  /*
   * Sends a http/https request using the provided db.transport.
   * Emits 'result' with result data when no callback 
   * has been provided and 'error' on errors. 
   * Errors are not normalized in any way, only forwarded.
   */
  function Request(options,path,data,callback) {  
    var request = this, buf = ""
    , json = data ? JSON.stringify(data) : null
    , params = extend(true,{
      "path" : path,
      "headers" : {
        "Content-Type": "application/json",
        "Content-Length": data ? json.length : 0
      }
    },options, db.config.server)
    , req = db.transport.request(params,function(res) {
        res.on('data',function(data){
          buf += data;
        }).on('end',function(){ 
          if(buf.length > 0)  request.result = JSON.parse(buf);
          if( !res.error && res.statusCode > 199 && res.statusCode < 305 ) {
            if(callback) callback(request.result);
            else request.emit('result',request.result);
          } 
          else {
            request.emit('error',request.result || res.statusCode);
          }
        });
      }).on('error',function(err){
        request.emit('error',err);
      });
    if(data) req.write(json);
    req.end();
    
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
      return request;
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

