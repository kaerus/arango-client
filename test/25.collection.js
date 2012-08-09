var assert = require('chai').assert 
  , arango = require('../index')
  , util = require('util');

var db = new arango.Connection;
var id,id2,name = "testcollection";

function initSuite(done){
  db.collection.delete(name,function(err,ret){
    done();
  });
}

function exitSuite(done){
  db.collection.delete(name,function(err,ret){
    done();
  });  
}
  
suite('Arango collection', function(){
    
  test('create collection', function(done){
    db.collection.create(name,function(err,ret){
      assert(!err,util.inspect(ret));
      assert.equal(ret.name,name,"collection name validation");
      id = ret.id;
      done();
    });
  });
  
  db.config.name = "testcollection2";

  test('create collection 2', function(done){
    db.collection.create(function(err,ret){
      assert(!err,util.inspect(ret));
      assert.equal(ret.name,db.config.name,"collection name validation");
      id2 = ret.id;
      done();
    });
  });
  
  test('delete collection 2',function(done){
    db.collection.delete(id2,function(err,ret){
      assert(!err,util.inspect(ret));
      assert.equal(ret.id,id2,"deleted collection id validation");
      done();
    });
  });

  
  test('get collection by id',function(done){
    db.collection.get(id,function(err,ret){
      assert(!err,util.inspect(ret));
      assert.equal(ret.name,name,"collection name validation");
      done();
    });
  });
  
  test('get collection by name',function(done){
    db.collection.get(name,function(err,ret){
      assert(!err,util.inspect(ret));
      assert.equal(ret.id,id,"collection id validation");
      done();
    });
  });
  
  test('delete collection',function(done){
    db.collection.delete(id,function(err,ret){
      assert(!err,util.inspect(ret));
      assert.equal(ret.id,id,"deleted collection id validation");
      done();
    });
  });
  
  suiteTeardown(exitSuite);
});  
  
  