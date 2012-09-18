/* Copyright (c) 2012 Kaerus, Anders Elo <anders @ kaerus com>.
 
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

return function(db){
  var path = "/_api/simple/", skip, limit;
  var util = require('util');

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
      var data = {collection: db.config.name}, i = 0, options, callback;

      if(typeof arguments[i] === 'string') data.collection = arguments[i++];
      if(typeof arguments[i] === 'object') options = arguments[i++];
      if(typeof arguments[i] === 'function') callback = arguments[i++];

      return db.put(path+'all',applyOptions(data),callback);
    },
    "example": function() {
      var data = {collection: db.config.name}, i = 0, options, callback;

      if(typeof arguments[i] === 'string') data.collection = arguments[i++];
      if(typeof arguments[i] === 'object' && 
          typeof arguments[i+1] === 'object') options = arguments[i++];
      if(typeof arguments[i] === 'object') data.example = arguments[i++];
      if(typeof arguments[i] === 'function') callback = arguments[i++];

      return db.put(path+'by-example',applyOptions(data),callback);
    },
    "first": function() {
      var data = {collection: db.config.name}, i = 0, options, callback;

      if(typeof arguments[i] === 'string') data.collection = arguments[i++];
      if(typeof arguments[i] === 'object') data.example = arguments[i++];
      if(typeof arguments[i] === 'function') callback = arguments[i++];

      return db.put(path+'first-example',data,callback);    
    },
    "range": function() {
      var data = {collection: db.config.name}, i = 0, options, callback;

      if(typeof arguments[i] === 'string') data.collection = arguments[i++];
      if(typeof arguments[i] === 'object') options = arguments[i++];
      if(typeof arguments[i] === 'function') callback = arguments[i++];

      return db.put(path+'range',applyOptions(data),callback);
    },
    "near": function() {
      var data = {collection: db.config.name}, i = 0, options, callback;
        
      if(typeof arguments[i] === 'string') data.collection = arguments[i++];
      if(typeof arguments[i] === 'object') options = arguments[i++];
      if(typeof arguments[i] === 'function') callback = arguments[i++];

      return db.put(path+'near',applyOptions(data),callback);
    },
    "within": function() {
      var data = {collection: db.config.name}, i = 0, options, callback;
      
      if(typeof arguments[i] === 'string') data.collection = arguments[i++];
      if(typeof arguments[i] === 'object') options = arguments[i++];
      if(typeof arguments[i] === 'function') callback = arguments[i++];

      return db.put(path+'within',applyOptions(data),callback);
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


