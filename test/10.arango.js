var assert = require('chai').assert 
  , arango = require('../index')
  , util = require('util');

suite('Arango client', function(){
  var db = new arango.Connection;

  test('validating object', function(done){   
    assert(db,'is something');
    assert.equal(db.transport,require('http'),'has http transport');
    assert.deepEqual({ hostname: '127.0.0.1', port: 8529, setHost: false },
      db.config.server, 'has default config');
    done();
  });
  
  test('get status', function(done){
    db.get("/_admin/status",function(err,ret){
      assert(!err);
      done();
    });
  });
  
});