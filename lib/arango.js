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
  , utils = require('./utils')
  , action = require('./action');

include.query = require('./query');
include.action = require('./action');
include.request = require('./request');

include.api = {
  "collection": require('./api/collection'),
  "document": require('./api/document'),
  "cursor": require('./api/cursor'),
  "simple": require('./api/simple'),
  "index": require('./api/index'),
  "admin": require('./api/admin'),
  "edge": require('./api/edge'),
  "key": require('./api/key')
};

function Connection(){
  if(!(this instanceof Connection))
    return new Connection.apply(null,arguments);
  
  var self = this;

  function dispatch(event,type){
    if(typeof event === 'function' && typeof type === 'string') {
      var events = type.split(' ');
      events.forEach(function(my){
        self.event.on(my,event);  
      });
    }
  }
  this.event = new Event(dispatch);
/*
  function deferInit(){
    self.event.emit('init',self.event);  
  }

  setTimeOut(deferInit,0);
*/
  this.use.apply(this,arguments);

  Object.defineProperty(this,"server",{
      get: function () {
       return { protocol:this.protocol, 
                hostname:this.hostname,
                port:this.port };
      }
  });

  
  /* Request methods */
  this.request = {};
  
  var request_methods = include.request(this);
  for(var method in request_methods ) {
    this.request[method] = request_methods[method];
  }  

  /* Api modules */
  for(var module in include.api) {
    this[module] = include.api[module](this);
  } 

  /* AQL builder */
  this.query = include.query(this);

  /* Action maker */
  this.action = include.action(this);
};

  Connection.prototype.use = function(){
    for(var i = 0, connection; connection = arguments[i]; i++) {
      if(connection instanceof Connection){
        utils.extend(this,connection);  
      }
      else if(typeof connection === 'object') {
        utils.extend(true,this,connection);
      }
      else if(typeof connection === 'string') {
        var conn = utils.parseUrl(connection);
        if(conn){
          utils.extend(this,conn);
          /* grab collection name from path */
          if(conn.path !== null) {
            this.path = conn.path;
            if(typeof this.path === 'string') {
              this.name = this.path;
            } else if(typeof this.path === 'object') {
              this.name = this.path.first;
            }
          }   
        } else {
          this.name = connection;
        }
      } else if(typeof connection === 'function') {
        this.event.register('connect',connection);
      }  
    }

    /* apply some defaults */ 
    this.protocol = this.protocol || (WINDOW_LOCATION ? WINDOW_LOCATION.protocol.split(':')[0] : "http");
    this.hostname = this.hostname || (WINDOW_LOCATION ? WINDOW_LOCATION.hostname : "127.0.0.1");
    this.port = parseInt(this.port,10) || (WINDOW_LOCATION ? WINDOW_LOCATION.port : 8529);
    this.name = this.name || "";

    return this;
  };

  /* Event dispatcher */
  function Event(dispatcher) {
    this.dispatcher = dispatcher;
    utils.Emitter.call(this);
    this.on('register',dispatcher);
  }

  utils.inherit(Event, utils.Emitter);

  Event.prototype.register = function() {
    var i = 0, callback, on_event;
    if(typeof arguments[i] === 'string')
      on_event = arguments[i++];
    if(typeof arguments[i] === 'function')
      callback = arguments[i++];

    if(callback) this.emit('register',callback,on_event);
  }

  return {"Connection":Connection};
});
