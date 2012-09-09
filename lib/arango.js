if (typeof define !== 'function') { var define = require('amdefine')(module) }
define(function (require) {

/*
 * Arango REST module for node.js by Anders Elo (anders @ kaerus com) 2012
 * MIT licenced, feel free to use, share and modify.
 *
 */  

var include = {};

include.query = require('./query');
include.extend = require('./extend');
include.emitter = require('./emitter'); 
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
  "session": require('./api/session')
};

function Connection(){
  var self = this, options = {}, i = 0;
  
  this.extend = include.extend;
  
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
    this.extend(options,arguments[i++]);
  }
  if( typeof arguments[i] === "function" ) {
    this.callback = arguments[i++];
  }
  
  this.config = {
    server: { 
      hostname: options.host || "127.0.0.1",
      port: parseInt(options.port) || 8529,
      setHost: options.setHost || false
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
