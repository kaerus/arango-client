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
    , path = "/_api/index/"
    , xpath = "/_api/index?collection=";
  
  return {
    "get": function(id,callback) {
      return X.get(path+id,callback);
    },
    "create": function() {
      var collection = db.name, data = {}, callback, i = 0;
      if(typeof arguments[i] === "string") collection = arguments[i++];
      if(typeof arguments[i] === "object") data = arguments[i++];
      if(typeof arguments[i] === "function") callback = arguments[i++];
      return X.post(xpath+collection,data,callback);
    },
    "delete": function(id,callback) {
      return X.delete(path+id,callback);
    },
    "list": function() {
      var collection = db.name, callback, i = 0;
      if(arguments.length > 0) {
        if(typeof arguments[i] === "string") collection = arguments[i++];
        if(typeof arguments[i] === "function") callback = arguments[i++];
      }
      return X.get(xpath+collection,callback);
    }
  }
};

});