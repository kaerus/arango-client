var assert = require('chai').assert 
  , arango = require('../index')
  , util = require('util');

suite('Arango client', function(){
  var db, conn;

  test('arango.client http', function(done){   
    db =  new arango.Connection;
    assert(db,'is set to something');
    assert.equal(db.transport,require('http'),'has http transport');
    assert.deepEqual({ hostname: '127.0.0.1', port: 8529, setHost: false },
      db.config.server, 'has default config');
    done();
  });
  
  test('arango.client https', function(done){   
    db =  new arango.Connection({protocol:'https'});
    assert(db,'is set to something');
    assert.equal(db.transport,require('https'),'has https transport');
    assert.deepEqual({ hostname: '127.0.0.1', port: 8529, setHost: false },
      db.config.server, 'has default config');
    done();
  });
   
  test('url parser 1',function(done){
    conn = "http://1.2.3.4:1234/test";
    db = new arango.Connection(conn);
    assert.deepEqual({ hostname: '1.2.3.4', 
                       port: 1234, 
                       setHost: false }, db.config.server, 'validate config');
    assert.equal(db.config.name,'test','collection name');
    done();
  });  
  
  test('url parser 2',function(done){
    conn = "https://some.host.com:80/database"; 
    db = new arango.Connection(conn);
    assert.equal(db.transport,require('https'),'has https transport');
    assert.deepEqual({ hostname: 'some.host.com', 
                       port: 80, 
                       setHost: false }, db.config.server, 'validate config');
    assert.equal(db.config.name,'database','collection name');                   
    done();
  });  
  
  test('url parser 3',function(done){
    conn = "http://username:password@some.host.com:8529/database"; 
    db = new arango.Connection(conn);
    assert.deepEqual({ hostname: 'some.host.com', 
                       port: 8529, 
                       setHost: false }, db.config.server, 'validate config');
    assert.equal(db.config.name,'database','collection name');
    assert.equal(db.config.user,'username','username');
    assert.equal(db.config.pass,db.hashPass('password'),'password');
    done();
  });  
  
  test('url parser 4',function(done){
    conn = "http://username@some.host.com:8529/database"; 
    db = new arango.Connection(conn);
    assert.deepEqual({ hostname: 'some.host.com', 
                       port: 8529, 
                       setHost: false }, db.config.server, 'validate config');
    assert.equal(db.config.name,'database','collection name');
    assert.equal(db.config.user,'username','username');
    assert.equal(db.config.pass,'','password');
    done();
  });  
  
  test('get status', function(done){
    db = new arango.Connection
    db.get("/_admin/status",function(err,ret){
      assert(!err);
      done();
    });
  });
  
});