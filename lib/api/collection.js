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
  var X = db._X_
    , path = "/_api/collection/";
  
  return {
    "create": function() {
      var collection = db.name, data = {}, callback, i = 0;
      if(typeof arguments[i] === "string") collection = arguments[i++];
      if(typeof arguments[i] === "object") data = arguments[i++];
      if(typeof arguments[i] === "function") callback = arguments[i++];
      if(!data.name) data.name = collection;
      return X.post(path,data,callback);
    },
    "get": function(id,callback) {
      return X.get(path+id,callback);   
    },
    "delete": function(id,callback) {
      return X.delete(path+id,callback);
    },
    "truncate": function(id,callback) {
      return X.put(path+id+'/truncate',null,callback);
    },
    "count": function(id,callback) {
      return X.get(path+id+'/count',callback);
    },
    "figures": function(id,callback) {
      return X.get(path+id+'/figures',callback);
    },
    "list": function(callback) {
      return X.get(path,callback);
    },
    "load": function(id,callback) {
      return X.put(path+id+'/load',null,callback);
    },
    "unload": function(id,callback) {
      return X.put(path+id+'/unload',null,callback);
    },
    "rename": function(id,data,callback) {
      if(typeof data === 'string' ) data = {name: data};
      return X.put(path+id+'/rename',data,callback);
    },
    "getProperties": function(id,callback) {
      return X.get(path+id+'/properties',callback);
    },
    "setProperties": function(id,data,callback) {
      return X.put(path+id+'/properties',data,callback);
    }
    
  }
};

});