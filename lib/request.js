if (typeof define !== 'function') { var define = require('amdefine')(module) }
define(function (require) {

  var Emitter = require('./emitter');

  function AjaxError(err) {
    this.name = "Ajax";
    this.code = err[0];
    this.message = err[1];
  }

  AjaxError.prototype = new Error();
  AjaxError.ERR = {
    'OK':           [0,'ok'],
    'UNSUPPORTED':  [1000,'Ajax is not supported'],
    'TIMEDOUT':     [1001,'operation timed out'],
    'UNIMPLEMENTED':[1002,'feature is unimplemented']
  };

  return function(db){  

    var xhr, xp, host, port, transport = {};
    if(window && typeof window.XMLHttpRequest !== 'undefined' ) {
      xhr = 'XMLHttpRequest';
    } else if(typeof window.ActiveXObject !== 'undefined') {
      xhr = 'ActiveXObject';
      var ver = ['Msxml2.XMLHTTP.6.0','Msxml2.XMLHTTP.3.0','Microsoft.XMLHTTP'];
      for (var i = 0, l = ver.length; i < l; i++) {
         try {
            new window.ActiveXObject(ver[i]);
            xp = ver[i];
            break;
        } catch (e) {}
      }      
    } else {
      try{
          throw new AjaxError(AjaxError.ERR['UNIMPLEMENTED']);
          //xhr = require('./nodejs');
      } catch(e){
         throw new AjaxError(AjaxError.ERR['UNSUPPORTED']);
       }   
    }
  
    /* Uniformed Xhr constructor */
    var Xhr = (function(x,p) {
        if(typeof x === 'object')
            return function(){return x;};
        else if(p) 
          return window[x].apply(this,p); 
        else 
          return window[x];    
    }(xhr,xp));
    
    function Ajax(params,callback) {
      var ajax = this, res, data;
      ajax.xhr = new Xhr;
      ajax.buffer = []; 

      /* timeout handler */
      ajax.xhr.timeout = 5000;
      ajax.xhr.ontimeout = function(err) {
        var err = new AjaxError(AjaxError.ERR['TIMEDOUT']);
        if(ajax._events['error'])
          ajax.emit('error',err);
        else
          throw err;
      };
        
      /* response object */
      function Response(callback) {
        /* response data buffer */
        this.data = [];
        /* size of data */
        this.data.size = 0;
         if(callback) this.on('response',callback);
      }

      Response.prototype = new Emitter();

      Response.prototype.write = function(data) {
        this.data.push(data);
        /* emit only if we have listeners */
        if(this._events['data'])
          this.emit('data',this.data[this.data.length-1]);
        this.data.size += data.length;
      }; 

      Response.prototype.writeChunk = function(data) {
        if(data.length > this.data.size)
          this.write(data.slice(res.data.size));     
      }
      
      if(!res) res = new Response(callback);
      res.emit('response',res);

      /* readyState handler */
      ajax.xhr.onreadystatechange = function(){
        switch(ajax.xhr.readyState) {
          case 4:
            console.log("Ajax Response",ajax.xhr);
            if(!res.statusCode)
                res.statusCode = ajax.xhr.status;
            if(!res.headers) 
                res.headers = ajax.parseHeaders();
            res.writeChunk(ajax.xhr.responseText);       
            res.emit('end');
            break;
          case 3:
            if (!res.statusCode) {
                res.statusCode = ajax.xhr.status;
                res.headers = ajax.parseHeaders();
                res.emit('ready');
            }
            res.writeChunk(ajax.xhr.responseText);
            break;
          case 2:
            if(ajax.xhr.status) {
              res.statusCode = ajax.xhr.status;
              res.headers = ajax.parseHeaders();
              res.emit('ready');
            }
            break;
          case 1: 
            break; 
        }
      };
        var url = params.protocol + "//" + params.hostname + ":" + params.port + params.path;
        /* prepare async request */
        console.log("Ajax Request %s %s",params.method,url);
        ajax.xhr.open(params.method,url,true);
        /* set request headers */
        /* TODO: filter out 'unsecure' headers */
        Object.keys(params.headers).forEach(function(header){
          ajax.xhr.setRequestHeader(header,params.headers[header]);
        });
    }
    Ajax.prototype = new Emitter();

    Ajax.prototype.write = function(data) {
      this.buffer.push(data);
    };

    Ajax.prototype.end = function(data) {
      this.xhr.send(this.buffer.length > 0 ? this.buffer : null);
    };

    Ajax.prototype.parseHeaders = function() {
      var headers = {}, key, value, i
        , h = this.xhr.getAllResponseHeaders();
      h.toLowerCase().split('\n').forEach(function(header){
        i = header.indexOf(':');
        key = header.slice(0,i).replace(/^[\s]+|[\s]+$/g,'');
        value = header.slice(i+1,header.length).replace(/^[\s]+|[\s]+$/g,'');
        if(key && key.length) headers[key] = value;
      });
      return headers;
    }

/* ------------------------------------------------------------------------------------------------- */
    function Request(options,path,data,callback) { 
      var request = this, buffer = [] 
      , json = (data && !data.length) ? JSON.stringify(data) : null
      , params = db.extend(true,{
        "path" : path,
        "headers" : {
          "Content-Type": "application/json"
          //, "Content-Length": json ? json.length : (data && data.length ? data.length : 0)
        }
      },options, db.config.server)
        , ajax = new Ajax(params,function(res) {
            res.on('end',function(){ 
              request.headers = res.headers;
              /* NOTE: res.data is Array */
              if(res.data.length > 0) {
                try{  
                  request.result = JSON.parse(res.data);
                } catch(e) {
                  request.data = res.data;
                } 
              } 
              if(request.result)
                handle_result(request.result.error,res.statusCode,request.result.errorMessage);
              else {  
                /* Assume error if response error is undefined */
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
      
      /* log errors to console */
      request.on('error', function(e){
        console.log("error(%s): ", e.code, e.message);
      });

      /* json or buffered data */
      if(data) ajax.write(json ? json : data);
      ajax.end();
      
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
    Request.prototype = new Emitter();

    /* Request factories */
    return {  
      "post": function(path,data,callback) {
        return new Request({"method":"POST"},path,data,callback);
      },
      "get": function(path,callback) {
        return new Request({"method":"GET"}, path, null, callback );
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
  } 
});