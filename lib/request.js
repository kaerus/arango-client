if (typeof define !== 'function') { var define = require('amdefine')(module) }
define(function (require) {

  var Emitter = require('./emitter');

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
          false;
          //xhr = require('./nodejs');
      } catch(e){
        /* TODO check for node http/https */
         throw new Error('Ajax not supported');
       }   
    }
  /*
    var Xhr = (function(x,p) {
        if(typeof x === 'object')
            return function(){return x};
        else if(p)
          return window[x](p);
        else return window[x]();    
      }
    })(xhr,xp);
    */
    var Xhr = window[xhr];
  /*
   if (!params) params = {};
      if (!params.host) params.host = db.config.server.hostname;
      if (!params.port) params.port = db.config.server.port;
      
      var req = new AjaxRequest(new xhr, params);
      if (callback) req.on('response', callback);
      return req;
  */
    function Ajax(params,callback) {
      var ajax = this;
      this.xhr = new Xhr; 

      /* timeout handler */
      ajax.xhr.timeout = 5000;
      ajax.xhr.ontimeout = function(err) {

      };
        
      /* response object */
      function Response(callback) {
        this.buffer = [];
         if(callback) this.on('response',callback);
      }

      Response.prototype = new Emitter();
      var res = new Response(callback);
        

      /* readyState handler */
      ajax.xhr.onreadystatechange = function(){
        res.emit('response',res);
        console.log("response state(%s)",ajax.xhr.readyState);
        switch(ajax.xhr.readyState) {
          case 4:
            console.log("xhr",ajax.xhr);
            res.statusCode = ajax.xhr.status;
            res.headers = ajax.parseHeaders(ajax.xhr.getAllResponseHeaders());
            res.emit('data',ajax.xhr.responseText);
            res.emit('end');
            break;
          case 3:
            break;
          case 2:
            break;
          case 1: 
            break; 
        }
      };
        if (!params.host) params.host = window.location.host.split(':')[0];
        if (!params.port) params.port = window.location.port;
        var url = "http://" + params.host + ":" + params.port + "/" + params.path;
        /* prepare async request */
        console.log("xhr.open(%s,%s)",url,params.path);
        ajax.xhr.open(params.method,url,true);
        /* set request headers */
        Object.keys(params.headers).forEach(function(header){
          console.log("chr.setRequestHeader(%s,%s)",header,params.headers[header]);
          ajax.xhr.setRequestHeader(header,params.headers[header]);
        });
    }
    Ajax.prototype = new Emitter();

    Ajax.prototype.write = function(data) {
      console.log("(write)xhr.send(%s)",data||null);
      this.xhr.send(data||null);
    };

    Ajax.prototype.end = function(data) {
      console.log("(end)xhr.send(%s)",data||null);
      this.xhr.send(data||null);
    };

    Ajax.prototype.parseHeaders = function(h) {
      var headers = {}, key, value, i;
      h.toLowerCase().split('\n').forEach(function(header){
        i = header.indexOf(':');
        key = header.slice(0,i).replace(/^[\s]+|[\s]+$/g,'');
        value = header.slice(i+1,header.length).replace(/^[\s]+|[\s]+$/g,'');
        headers[key] = value;
      });
      return headers;
    }

    function Request(options,path,data,callback) { 
      var request = this, buf = "" 
      , json = (data && !data.length) ? JSON.stringify(data) : null
      , params = db.extend(true,{
        "path" : path,
        "headers" : {
          "Content-Type": "application/json",
          "Content-Length": json ? json.length : (data && data.length ? data.length : 0)
        }
      },options, db.config.server)
      //, req = db.transport.request(params,function(res) {
        , req = new Ajax(params,function(res) {
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
      
      /* log errors to console */
      req.on('error', function(e){
        console.log("error(%s): ", e.code, e.message);
      });

      /* json or buffered data */
      if(data) req.write(json ? json : data);
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