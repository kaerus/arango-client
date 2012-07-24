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
var ArangoDB = function(){
  var options = arguments[0] || {}
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

  this.config.__defineGetter__("pass",function(){
    return this._pass;
  });
  
  this.config.__defineSetter__("pass",function(word){
    if( word && word.length > 0 ) {
        var crypto = require('crypto');
	      this._pass = crypto.createHash('sha256')
	                    .update(word).digest('hex');
	  } else this._pass = word;            
  });
  
  this.transport = require(options.protocol || 'http');  
  
  this.collection = require('./collection')(this);
  this.document = require('./document')(this);
  this.session = require('./session')(this);  
  
  var request = require('./request')(this);
   
  function request_wrap(method) {
    return function(){
      var args = Array.prototype.slice.call(arguments)  
        , cb = args.splice(-1,1,function(res){cb(0,res);})[0];
      method.apply(this,args).on('error',function(e) {
        cb(e.code,e.errorMessage);
      }); 
    };
  }
  this.get = request_wrap(request.get);
  this.put = request_wrap(request.put);
  this.patch = request_wrap(request.patch);
  this.post = request_wrap(request.post);
  this.delete = request_wrap(request.delete);
  
};

module.exports.Connection = ArangoDB;


ArangoDB.version = JSON.parse( fs.readFileSync( __dirname + '/../package.json', 'utf8' )).version;



