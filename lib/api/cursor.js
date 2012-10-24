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
    , path = "/_api/cursor/";
  
  return {
    "get": function(id,callback) {
      return X.put(path+id,{},callback);
    },
    "create": function(data,callback) {
      return X.post(path,data,callback);
    },
    "query": function(data,callback) {
      return X.post("/_api/query",data,callback);
    },
    "explain": function(data,callback) {
      return X.post("/_api/explain",data,callback);
    },
    "delete": function(id,callback) {
      return X.delete(path+id,callback);
    }
  }
};

});