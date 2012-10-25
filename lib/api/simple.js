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
    , path = "/_api/simple/", skip, limit;

  function applyOptions(data,options) {
    if(typeof options === 'object') {
      Object.keys(options).forEach(function(option){
        switch(option){
          case 'from': data.left = options[option];
            data.closed = true;
            break;
          case 'to': data.right = options[option];
            data.closed = true;
            break;
          default:
            data[option] = options[option];
            break;          
        }   
        /* apply skip/limit preferences */
        if(skip && !data.skip) data.skip = skip;
        if(limit && !data.limit) data.limit = limit;
      });
    }

    return data;
  }

  return {
    "list": function() {
      var data = {collection: db.name}, i = 0, options, callback;

      if(typeof arguments[i] === 'string') data.collection = arguments[i++];
      if(typeof arguments[i] === 'object') options = arguments[i++];
      if(typeof arguments[i] === 'function') callback = arguments[i++];

      return X.put(path+'all',applyOptions(data),callback);
    },
    "example": function() {
      var data = {collection: db.name}, i = 0, options, callback;

      if(typeof arguments[i] === 'string') data.collection = arguments[i++];
      if(typeof arguments[i] === 'object' && 
          typeof arguments[i+1] === 'object') options = arguments[i++];
      if(typeof arguments[i] === 'object') data.example = arguments[i++];
      if(typeof arguments[i] === 'function') callback = arguments[i++];

      return X.put(path+'by-example',applyOptions(data),callback);
    },
    "first": function() {
      var data = {collection: db.name}, i = 0, options, callback;

      if(typeof arguments[i] === 'string') data.collection = arguments[i++];
      if(typeof arguments[i] === 'object') data.example = arguments[i++];
      if(typeof arguments[i] === 'function') callback = arguments[i++];

      return X.put(path+'first-example',data,callback);    
    },
    "range": function() {
      var data = {collection: db.name}, i = 0, options, callback;

      if(typeof arguments[i] === 'string') data.collection = arguments[i++];
      if(typeof arguments[i] === 'object') options = arguments[i++];
      if(typeof arguments[i] === 'function') callback = arguments[i++];

      return X.put(path+'range',applyOptions(data),callback);
    },
    "near": function() {
      var data = {collection: db.name}, i = 0, options, callback;
        
      if(typeof arguments[i] === 'string') data.collection = arguments[i++];
      if(typeof arguments[i] === 'object') options = arguments[i++];
      if(typeof arguments[i] === 'function') callback = arguments[i++];

      return X.put(path+'near',applyOptions(data),callback);
    },
    "within": function() {
      var data = {collection: db.name}, i = 0, options, callback;
      
      if(typeof arguments[i] === 'string') data.collection = arguments[i++];
      if(typeof arguments[i] === 'object') options = arguments[i++];
      if(typeof arguments[i] === 'function') callback = arguments[i++];

      return X.put(path+'within',applyOptions(data),callback);
    },
    "skip": function(val) {
        skip = val;
    },
    "limit": function(val) {
        limit = val;
    }
  }
};

});


