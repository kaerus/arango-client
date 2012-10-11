/*
 * Copyright (c) 2012 Kaerus, Anders Elo <anders @ kaerus com>.
 
 * Permission is hereby granted, free of charge, to any person obtaining a 
 * copy of this software and associated documentation files (the "Software"), 
 * to deal in the Software without restriction, including without limitation 
 * the rights to use, copy, modify, merge, publish, distribute, sublicense, 
 * and/or sell copies of the Software, and to permit persons to whom the 
 * Software is furnished to do so, subject to the following conditions:

 * The above copyright notice and this permission notice shall be included in 
 * all copies or substantial portions of the Software.

 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR 
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, 
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE 
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER 
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING 
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER 
 * DEALINGS IN THE SOFTWARE.
 */

if (typeof define !== 'function') { var define = require('amdefine')(module) }
define(function (require) {

var utils = require('./utils')
  , Ajax = require('./ajax');

return function(db){ 

  function Request(options,path,data,callback) { 
      utils.Emitter.call(this);

      var request = this, buffer = [] 
      , json = (data && !data.length) ? (data ? JSON.stringify(data) : null) : null
      , params = utils.extend(true,{
        "path" : path,
        "headers" : {
          "content-type": "application/json",
          "content-length": json ? json.length : (data && data.length ? data.length : 0)
        }
      },options, db.config.server)
        , req = new Ajax.request(params,function(res) {
            if(typeof res.data !== 'object') {
                res.data = [];
                res.on('data',function(data){
                    res.data.push(data);
                });
            }   
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

    utils.inherit(Request, utils.Emitter);

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