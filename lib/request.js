/* 
 * Copyright (c) 2012 Kaerus (kaerus.com), Anders Elo <anders @ kaerus com>.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

if (typeof define !== 'function') { var define = require('amdefine')(module) }
define(function (require) {

var utils = require('./utils')
  , Ajax = require('./ajax');

return function(db){ 

  function Request(options,path,data,callback) { 
      utils.Emitter.call(this);
      /* try converting to Buffer to workaround issue with wrong json length */
      try {
        data = data && !data.length ? new Buffer(JSON.stringify(data)) : data;
      } catch(e) {
        data = JSON.stringify(data);  
      }  
      var request = this, buffer = [] 
      , params = utils.extend(true,{
        "path" : path,
        "headers" : {
          "content-type": "application/json",
          "connection": "keep-alive",
          "content-length": data ? data.length : 0
        }
      }, db.server, options)
        , req = Ajax.request(params,function(res) {
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
                  request.result = JSON.parse(res.data.join(''));
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
      
      if(data) req.write(data);
      req.end();
                                    
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