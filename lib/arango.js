/*
 * Arango REST module for node.js by Anders Elo (anders @ kaerus com) 2012
 * MIT licenced, feel free to use, share and modify.
 *
 */

var include = require('./include');

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
  
  /* hash the password if it's not 256bits wide */
  if(this.config.pass.length !== 64)
    this.config.pass = this.config._pass;
  
  this.transport = include.transport(options.protocol); 
  
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
