/*
 * Arango REST module for node.js by Anders Elo (anders @ kaerus com) 2012
 * MIT licenced, feel free to use, share and modify.
 *
 */

var include = require('./include')
  , extend = require('node.extend');

/* 
  Connection <string> || <object>
  string  
    "<protocol>://<username>:<password>@<hostname>:<port>/<collection>"
    "https://some.host.com:80/database"
  object 
    { 
      protocol: <https | http>
      hostname: <server>
      port: <port>
      setHost: <true|false>
      user: <username>
      pass: <password>
      name: <collection>
    } 
*/
module.exports.Connection = function(){
  var self = this, options = {}, i = 0;
  if( typeof arguments[i] === "string") {
    var db_url = /^(?:([A-Za-z]+):)?(\/{0,3})(?:([A-Za-z]+)?:?([A-Za-z]*)@)?([0-9.\-A-Za-z]+)(?::(\d+))?(?:\/([^?#]*))$/;
    var u = db_url.exec(arguments[i++]);
    options.protocol = u[1];
    options.user = u[3];
    options.pass = u[4];
    options.hostname = u[5];
    options.port = u[6];
    options.name = u[7];
  }
  if( typeof arguments[i] === "object" ) {
    extend(options,arguments[i++]);
  }
  if( typeof arguments[i] === "function" ) {
    this.callback = arguments[i++];
  }
  
  this.config = {
    server: { 
      hostname: options.hostname || "127.0.0.1",
      port: options.port || 8529,
      setHost: options.setHost || false
    },
    user: options.user || "",
    pass: options.pass || "",
    name: options.name || ""  
  };

  this.hashPass = function(word) {
    var crypto = require('crypto');
    return word && word.length > 0 ? crypto.createHash('sha256')
	                          .update(word).digest('hex') : "";  
  }

  this.config.__defineGetter__("pass",function(){
    return this._pass;
  });
  
  this.config.__defineSetter__("pass",function(word){
    this._pass = self.hashPass(word);            
  });
  
  this.transport = include.transport(options.protocol);  
  
  /* register api modules */
  for(var module in include.api)
    this[module] = include.api[module](this);
    
  /* register request methods */
  var request_methods = include.request(this);
  for(var method in request_methods )
    this[method] = request_methods[method];
};
