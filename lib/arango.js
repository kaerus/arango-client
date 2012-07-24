/*
 * Arango REST module for node.js by Anders Elo (anders @ kaerus com) 2012
 * MIT licenced, feel free to use, share and modify.
 *
 */
 
 var fs = require('fs');
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
var Arango = function(){
  var options = arguments[0] || {}
    , callback = arguments[1] || function(){};
    
  this.config = {
    collection: options.collection || "",
    server: { 
      hostname: options.hostname || "127.0.0.1",
      port: options.port || 8529,
      setHost: options.setHost || false
    },
    credentials: {
      user: options.user || "",
      pass: options.pass || ""
    }
  };

  this.transport = require(options.protocol || 'http');  
  this.collection = require('./collection')(this);
  this.document = require('./document')(this);
  this.request = require('./request')(this);
  this.session = require('./session')(this);   
};

module.exports.Connection = Arango;

Arango.version = JSON.parse( fs.readFileSync( __dirname + '/../package.json', 'utf8' )).version;



