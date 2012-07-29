var assert = require('chai').assert 
  , arango = require('../index')
  , util = require('util')
  , extend = require('node.extend');
  
suite('Arango index', function(){
  var db = new arango.Connection({name:"test"});
  var query = {query:"FOR u IN test RETURN u", count:true, batchSize:2};
  var query2 = {query:"FOR u IN test RETURN u._id",count:true, batchSize:1};
  var id;
  
  test('create cursor', function(done){
    db.cursor.create(query,function(err,ret){
      if(err) assert(!err,util.inspect(ret));
      assert(ret.id,"validate id");
      assert(ret.result,"validate result");
      id = ret.id;
      done();
    });
  });
  
  test('get next batch',function(done){
    var hasMore;
    do{
      db.cursor.get(id,function(err,ret){
        if(err) assert(!err,util.inspect(ret));
        hasMore = ret.hasMore;
      });
    } while(hasMore); 
    done();
  });

  test('create another cursor', function(done){
    db.cursor.create(query2,function(err,ret){
      if(err) assert(!err,util.inspect(ret));
      assert(ret.id,"validate id");
      assert(ret.result,"validate result");
      id = ret.id;
      done();
    });
  });
  
  test('delete cursor',function(done){
    db.cursor.delete(id,function(err,ret){
      if(err) assert(!err,util.inspect(ret));
      assert.equal(ret.id,id,"validate id");
      done();
    });
  });
    
});
  