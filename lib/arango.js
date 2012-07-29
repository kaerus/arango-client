/*
 * Arango REST module for node.js by Anders Elo (anders @ kaerus com) 2012
 * MIT licenced, feel free to use, share and modify.
 *
 */
 
var fs = require('fs');
var util = require('util');

/* 
  Connection <options> 
    protocol: <https | http>
    hostname: <server>
    port: <port>
    setHost: <true|false>
    user: <username>
    pass: <password>
    name: <collection>
*/
var ArangoDB = function(){
  var self = this 
    , options = arguments[0] || {}
    , callback = arguments[1] || function(){};
    
  this.config = {
    server: { 
      hostname: options.hostname || "127.0.0.1",
      port: options.port || 8529,
      setHost: options.setHost || false
    },
    user: options.user || "",
    pass: options.pass || "",
    name: options.name || "" // default collection name 
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
  
  this.transport = require(options.protocol || 'http');  
  
  this.collection = require('./collection')(this);
  this.document = require('./document')(this);
  this.session = require('./session')(this);    
  var request = require('./request')(this);
    
  /*  
   * Request wrapper which proxies the callback
   * if it's present and returns the request.
   */  
  function request_wrap(method) {
    return function(){
      var args = Array.prototype.slice.call(arguments),cb;
      if( typeof args.slice(-1)[0] === "function" ) {
        cb = args.pop()
        args.push(function(res){cb(0,res);});
      }  
      return method.apply(this,args).on('error',function(e) {
        if(cb) cb(e.code,e.errorMessage);
      }); 
    };
  }
  
  /* register request methods */
  for(var method in request )
    this[method] = request_wrap(request[method]);
};

module.exports.Connection = ArangoDB;

ArangoDB.version = JSON.parse( fs.readFileSync( __dirname + '/../package.json', 'utf8' )).version;