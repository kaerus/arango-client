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

return function(db){
  var path = "/_api/collection/";
  
  return {
    "create": function() {
      var collection = db.config.name, data = {}, callback, i = 0;
      if(typeof arguments[i] === "string") collection = arguments[i++];
      if(typeof arguments[i] === "object") data = arguments[i++];
      if(typeof arguments[i] === "function") callback = arguments[i++];
      if(!data.name) data.name = collection;
      console.log("Create collection(%s): ", collection, data);
      return db.post(path,data,callback);
    },
    "get": function(id,callback) {
      return db.get(path+id,callback);   
    },
    "delete": function(id,callback) {
      return db.delete(path+id,callback);
    },
    "truncate": function(id,callback) {
      return db.put(path+id+'/truncate',null,callback);
    },
    "count": function(id,callback) {
      return db.get(path+id+'/count',callback);
    },
    "figures": function(id,callback) {
      return db.get(path+id+'/figures',callback);
    },
    "list": function(callback) {
      return db.get(path,callback);
    },
    "load": function(id,callback) {
      return db.put(path+id+'/load',null,callback);
    },
    "unload": function(id,callback) {
      return db.put(path+id+'/unload',null,callback);
    },
    "rename": function(id,name,callback) { 
      return db.put(path+id+'/rename',{name:name},callback);
    },
    "getProperties": function(id,callback) {
      return db.get(path+id+'/properties',callback);
    },
    "setProperties": function(id,data,callback) {
      return db.put(path+id+'/properties',data,callback);
    }
    
  }
};

});