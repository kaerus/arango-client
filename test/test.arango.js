var chai = require('chai') 
  , assert = chai.assert
  , arango = require('../index');

suite('Arango client basics', function(){
  var db = new arango.Connection;

  test('validating Connection object', function(done){   
    assert(db,'is something');
    assert.equal(db.transport,require('http'),'has http transport');
    assert.deepEqual({
      collection: '',
      server: { hostname: '127.0.0.1', port: 8529, setHost: false },
      credentials: { user: '', pass: '' }
    },db.config,'has default config');
    done();
  });
    
});