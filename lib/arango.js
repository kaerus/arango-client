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

var BROWSER = (typeof window ==='object' && window.hasOwnProperty('location'))
  , WINDOW_LOCATION = (BROWSER ? window.location : false) 
  , include = {}
  , utils = require('./utils');

include.query = require('./query');
include.request = require('./request');

include.sha256hex = function(word) {
  /*
  var crypto = require('crypto');
  return crypto.createHash('sha256').update(word).digest('hex');
  */
  return word;
};

include.api = {
  "cursor": require('./api/cursor'),
  "collection": require('./api/collection'),
  "document": require('./api/document'),
  "index": require('./api/index'),
  "edge": require('./api/edge'),
  "key": require('./api/key'),
  "session": require('./api/session'),
  "admin": require('./api/admin'),
  "simple": require('./api/simple')
};

function Connection(){
  var self = this, options = {}, i = 0;
  
  if( typeof arguments[i] === "string") {
    var db_url = /^(?:([A-Za-z]+):)?(\/{0,3})(?:([^\x00-\x1F\x7F:]+)?:?([^\x00-\x1F\x7F:]*)@)?([0-9.\-A-Za-z]+)(?::(\d+))?(?:\/([^?#]*))$/;
    var u = db_url.exec(arguments[i++]);
    options.protocol = u[1];
    options.user = u[3];
    options.pass = u[4];
    options.host = u[5];
    options.port = u[6];
    options.name = u[7];
  }
  if( typeof arguments[i] === "object" ) {
    utils.extend(options,arguments[i++]);
  }
  if( typeof arguments[i] === "function" ) {
    this.callback = arguments[i++];
  }
  
  this.config = {
    server: { 
      protocol: options.protocol || (WINDOW_LOCATION ? WINDOW_LOCATION.protocol.split(':')[0] : "http"),
      hostname: options.host || (WINDOW_LOCATION ? WINDOW_LOCATION.hostname : "127.0.0.1"),
      port: parseInt(options.port,10) || (WINDOW_LOCATION ? WINDOW_LOCATION.port : 8529)
    },
    user: options.user || "",
    _pass: options.pass || "",
    name: options.name || ""  
  };

  function hash_pass(word) {     
    var hash = include.sha256hex;
    return word && word.length > 0 ? (word.length === 64 ? word : hash(word)) : "";  
  }
  
  Object.defineProperty(this.config,"pass",{
      get: function () {
       return this._pass;
      },
      set: function (word) {
        this._pass = hash_pass(word); 
     }
  });
  
  /* Expose hasher */
  this.hashPass = hash_pass;
  
  /* hash the password if it's not 256bits wide */
  if(this.config._pass.length !== 64)
    this.config.pass = this.config._pass;
  
  /* register api modules */
  for(var module in include.api)
    this[module] = include.api[module](this);
    
  /* register request methods */
  var request_methods = include.request(this);
  for(var method in request_methods )
    this[method] = request_methods[method];

  /* AQL builder */
  this.query = include.query(this);
};

  return {"Connection":Connection};
});
