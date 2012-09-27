if (typeof define !== 'function') { var define = require('amdefine')(module) }

var libs = [
  '../lib/arango',
  './lib/qunit-1.10.js'
];


define(libs,function(arango){ 

var jsdom = require('jsdom');

module = QUnit.module;

module('Connection');

  var db, conn;

  test('arango.client http', function(){   
    db =  new arango.Connection;
    ok(db,'is set to something');
  });
   
  test('url parser 1',function(){
    conn = "http://1.2.3.4:1234/test";
    db = new arango.Connection(conn);
    deepEqual({ protocol: 'http',
                       hostname: '1.2.3.4', 
                       port: 1234}, db.config.server, 'validate config');
    equal(db.config.name,'test','collection name');
  });  
  
  test('url parser 2',function(){
    conn = "https://some.host.com:80/database"; 
    db = new arango.Connection(conn);
    deepEqual({ protocol: 'https',
                       hostname: 'some.host.com', 
                       port: 80}, db.config.server, 'validate config');
    equal(db.config.name,'database','collection name');                   
  });  
  
  test('url parser 3',function(){
    conn = "http://username:password@some.host.com:8529/database"; 
    db = new arango.Connection(conn);
    deepEqual({ protocol: 'http',
                       hostname: 'some.host.com', 
                       port: 8529}, db.config.server, 'validate config');
    equal(db.config.name,'database','collection name');
    equal(db.config.user,'username','username');
    equal(db.config.pass,db.hashPass('password'),'password');
  });  
  
  test('url parser 4',function(){
    conn = "http://username@some.host.com:8529/database"; 
    db = new arango.Connection(conn);
    deepEqual({ protocol: 'http',
                       hostname: 'some.host.com', 
                       port: 8529}, db.config.server, 'validate config');
    equal(db.config.name,'database','collection name');
    equal(db.config.user,'username','username');
    equal(db.config.pass,'','password');
  });  
  
  test('status', function(){
    stop()
    db = new arango.Connection;
    db.get("/_admin/status",function(err,ret){
      ok(!err);
      start();
    });
  });
  

});