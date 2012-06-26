/*
 * Arango REST module for node.js by Anders Elo (anders @ kaerus com) 2012
 * MIT licenced, feel free to use, share and modify.
 *
 */
var util = require('util')
  , extend = require('node.extend')
  , crypto = require('crypto')
  , qs = require('querystring')
  , fs = require('fs')
  , EventEmitter = require( "events" ).EventEmitter;  
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
    , callback = arguments[1] || function(){}
    , self = this;
  this.protocol = options.protocol || 'http'; 
  this.options = {};
  this.options.hostname = options.hostname || "127.0.0.1";
  this.options.port = options.port || 8529;
  this.options.setHost = options.setHost || false;
  /* transport handler */
  this.transport = require(this.protocol);
  /* user login credentials */
  this.credentials = {};
  this.credentials.user = options.user || "";
  this.credentials.pass = options.pass || "";
    
  /* default collection name */
  this.name = options.name || "";
  /* session object */
  this.session = {};
 
  /* helpers */
  this.collection = require('./collection')(self);
  this.document = require('./document')(self);
  this.request = require('./request')(self);
   
  /* request sid */
  function new_session(on_session) {
    var path = "/_admin/user-manager/session";
    self.request.post(path,null,function(res){
        self.session = res;
        on_session();
      }).on('error',function(err){
        self.emit('error',err);
      }); 
     return self; 
  }
  
  /* login and get permissions */
  this.login = function(on_login) {               
    new_session(function(){
      if(self.credentials.user && self.credentials.user.length > 0) { 
        var path = "/_admin/user-manager/session/" + self.session.sid + "/login"
          , data = {"user": self.credentials.user, "password": self.credentials.pass};  
        self.request.put(path,data,function(res){
          self.session = extend({},self.session,res);
          on_login(self.session);
        }).on('error',function(err){
         self.emit('error',err);
        });  
      } else on_login(self.session);
    });
    return self;
  };
 
  EventEmitter.call(this);
};

util.inherits(Arango, EventEmitter);
module.exports.Connection = Arango;

Arango.version = JSON.parse( fs.readFileSync( __dirname + '/../package.json', 'utf8' )).version;



