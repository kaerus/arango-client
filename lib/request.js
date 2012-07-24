var extend = require('node.extend')
  , util = require('util')
  , EventEmitter = require('events').EventEmitter;

module.exports = function(connection){
  var self = this;
  
  EventEmitter.call(this);
  
  function Request(options,path,data,callback) {  
    var request = this, buf = ""
      , json = data ? JSON.stringify(data) : null
      , params = extend({
        "path" : path,
        "headers" : {
          "Content-Type": "application/json",
          "Content-Length": data ? json.length : 0
        }
      },options, connection.config.server)
      , req = connection.transport.request(params,function(res) {
        res.on('data',function(data){
          buf += data;
        }).on('end',function(){
          request.result = JSON.parse(buf); 
          if( res.statusCode > 199 && res.statusCode < 300) {
            if(callback) callback(request.result);
          } else {
            request.emit('error',request.result);
          }
        });
      });
    
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

    /* catch and forward errors */  
    /* TODO: implement better error handling */
    req.on('error',function(err){
      request.emit('error',err);
    });
        
    if(data) req.write(json);
    req.end();
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
    "delete": function(path,data,callback) {
      return new Request({"method":"DELETE"},path,data,callback);
    }
  }
};

