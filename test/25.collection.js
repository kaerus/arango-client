var assert = require('chai').assert 
  , arango = require('../index')
  , util = require('util')
  , extend = require('node.extend');
  
suite('Arango colleciton', function(){
  var db = new arango.Connection;
  var id,name = "testcolleciton";
  
  test('create collection', function(done){
    db.collection.create({name: name},function(err,ret){
      assert(!err,util.inspect(ret));
      assert.equal(ret.name,name,"collection name validation");
      id = ret.id;
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

});  
  
  