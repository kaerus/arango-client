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

function Transport(options) {
  utils.Emitter.call(this);
  var self = this;

  this._xhr = Ajax.request(options,function(res) {
    var response = {};

    self.response = function(){
      return response;
    }

    if(typeof res.data !== 'object') {
        res.data = [];
        res.on('data',function(data){
            res.data.push(data);
        });
    }   
    res.on('end',function(){
      if(res.data.length > 0) {
        try{  
          response = JSON.parse(res.data.join(''));
        } catch(e) {
          response = res.data.join('');
        } 
      } 

      if(response.error) {
        response.message = self.response.errorMessage;
      } else if(res.error) {
        response.error = true;
      } else if(typeof response.error === 'undefined') {
        response.error = true;
      }

      if(response.error) {
        self.emit('error',response.statusCode, response.message);
      } else {
        self.emit('result',response, res.headers);
      }
    });
  }).on('error',function(err){self.emit('error',err)});               
}

utils.inherit(Transport, utils.Emitter);

Transport.prototype.send = function(data) {
  if(data) this._xhr.write(data);
  this._xhr.end();  
}

return function(db){ 

  function Request(options,path,data,callback) { 
      var self = this, request = {}, response = {}, headers = {}, transport;
      
      /* try converting to Buffer to workaround issue with wrong json length */
      try {
        request.data = data && !data.length ? new Buffer(JSON.stringify(data)) : data;
      } catch(e) {
        request.data = JSON.stringify(data);  
      } 

      request.options = utils.extend(true,{
        "path" : path,
        "headers" : {
          "content-type": "application/json",
          "connection": "keep-alive",
          "content-length": request.data ? request.data.length : 0
        }
      }, db.server, options);

      /* request hook */
      db.event.emit('request',request);

      transport = new Transport(request.options);

      transport.on('error',function(err) {    
        if(callback) callback(err.code,err.message);
        else db.event.emit('error',err);
      }).on('result',function(res,hdr) {
        /* response hook */
        db.event.emit('response',res, hdr);
        response = res;
        headers = hdr;
      });

      this.request = function() {
        return request;
      }

      this.response = function() {
        return response;
      }

      this.head = function() {
        return headers;
      }

      transport.send(data);

    }
    

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