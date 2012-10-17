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

var BROWSER = (typeof window ==='object' && window.hasOwnProperty('location'))
  , WINDOW_LOCATION = (BROWSER ? window.location : false) 
  , include = {}
  , utils = require('./utils');

include.query = require('./query');
include.request = require('./request');
include.sha256hex = require('./ext/sha256').SHA256;

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
    var db_url = /^(?:([A-Za-z]+):)?(\/{0,3})(?:([^\x00-\x1F\x7F:]+)?:?([^\x00-\x1F\x7F:]*)@)?([0-9.\-A-Za-z]+)(?::(\d+))?(?:\/([^?#]*))?$/;
    var u = db_url.exec(arguments[i++]);
    if(!u) throw new Error("invalid connection string");
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
    return word && word.length > 0 ? (word.length === 64 ? word : hash(word).toString()) : "";  
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
  
  /* hash the password if it's not done */
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

  Connection.prototype.use = function(collection){
    this.config.name = collection;
    
    return this;
  };

  return {"Connection":Connection};
});
