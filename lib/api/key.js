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

return function(db){
  var X = db.request
    , path = "/_api/key/"
    , xpath = "/_api/keys/";
  
  function setKey(method,path,options,data,callback){
      var headers = {}, expiry;
      if(typeof options.expires === 'object') expiry = options.expires;
      else expiry = new Date(Date.parse(options.expires,"yyyy-MM-dd HH:MM:SS"));
      
      headers['x-voc-expires'] = expiry.toISOString();
      if(options.extended) headers['x-voc-extended'] = JSON.stringify(options.extended);
      return X.raw({"method":method,headers:headers},path,data,callback);
  }
  /* todo: reconsider this */
  function stripKey(key) {
    return key.replace(/^[.\/]*/,'');
  }
  
  return {
    "get": function() {
      var collection = db.name, key, callback, i = 0;
      if(typeof arguments[i+1] === 'string') collection = arguments[i++];
      if(typeof arguments[i] === 'string') key = arguments[i++];
      if(typeof arguments[i] === 'function') callback = arguments[i++];
      return X.get(path+collection+'/'+stripKey(key),callback);
    },
    "create": function() {
      var collection = db.name, key, options = {}, data = {}, callback, i = 0;
      if(typeof arguments[i+1] === 'string') collection = arguments[i++];
      if(typeof arguments[i] === 'string') key = arguments[i++];
      options = arguments[i++];
      data = arguments[i++];
      if(typeof arguments[i] === 'function') callback = arguments[i++];
    
      return setKey("POST",path+collection+'/'+stripKey(key),options,data,callback);
    },
    "put": function() {
      var collection = db.name, key, options = {}, data = {}, callback, i = 0;
      if(typeof arguments[i+1] === 'string') collection = arguments[i++];
      if(typeof arguments[i] === 'string') key = arguments[i++];
      options = arguments[i++];
      data = arguments[i++];
      if(typeof arguments[i] === 'function') callback = arguments[i++];

      return setKey("PUT",path+collection+'/'+stripKey(key)+'?create=1',options,data,callback);
    },
    "list": function() {
      var collection = db.name, key, callback, i = 0;
      if(typeof arguments[i+1] === 'string') collection = arguments[i++];
      if(typeof arguments[i] === 'string') key = arguments[i++];
      if(typeof arguments[i] === 'function') callback = arguments[i++];
 
      return X.get(xpath+collection+'/'+stripKey(key),callback);
    },
    "delete": function() {
      var collection = db.name, key, callback, i = 0;
      if(typeof arguments[i+1] === 'string') collection = arguments[i++];
      if(typeof arguments[i] === 'string') key = arguments[i++];
      if(typeof arguments[i] === 'function') callback = arguments[i++];
 
      return X.delete(path+collection+'/'+stripKey(key),callback);
    }
  }
};

});