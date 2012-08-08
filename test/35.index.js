var assert = require('chai').assert 
  , arango = require('../index')
  , util = require('util')
  , extend = require('node.extend');

var db, id; 
var hash_index = { "type" : "hash", "unique" : false, "fields" : [ "a", "b" ] };
 
function initSuite(done){
  db = new arango.Connection({name:"testcol"});
  /* reset test collection */
  db.collection.delete("testcol",function(err,ret){
    
    db.collection.create(function(err,ret){
      if(err) assert(!err,util.inspect(ret));
      done();
    });
  });
}

function exitSuite(done){
  db.collection.delete("testcol",function(err,ret){
    if(err) assert(!err,util.inspect(ret));
    done();
  });
}

suite('Arango index', function(){
  suiteSetup(initSuite);
  
  test('create index', function(done){
    db.index.create(hash_index,function(err,ret){
      if(err) assert(!err,util.inspect(ret));
      assert(ret.id,"has no id");
      assert.equal(ret.type,"hash","validate type");
      assert.equal(ret.unique,false,"validate unique");
      assert.deepEqual(ret.fields,hash_index.fields,"validate fields");
      id = ret.id;
      done();
    });  
  });
  
  test('get index',function(done){
    db.index.get(id,function(err,ret){
      if(err) assert(!err,util.inspect(ret));
      assert(ret.id,"has no id");
      assert(ret.id,id,"validate id");
      assert.equal(ret.type,"hash","validate type");
      assert.equal(ret.unique,false,"validate unique");
      assert.deepEqual(ret.fields,hash_index.fields,"validate fields");
      done();
    });
  });
  
  test('delete index',function(done){
    db.index.delete(id,function(err,ret){
      if(err) assert(!err,util.inspect(ret));
      assert(ret.id,"has no id");
      assert.equal(ret.id,id,"validate id");
      done();
    });
  });
  
  test('list index',function(done){ 
    db.index.list(function(err,ret){
      if(err) assert(!err,util.inspect(ret));
      done();
    });
  });
  
  suiteTeardown(exitSuite);
});