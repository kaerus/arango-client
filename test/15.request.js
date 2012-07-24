var assert = require('chai').assert 
  , arango = require('../index')
  , util = require('util');

suite('Arango request', function(){
  var db = new arango.Connection;

  test('get db status', function(done){   
    var path = "/_admin/status";
    db.get(path,function(err,ret){
      assert(!err);
      done();
    });    
  });
  
});