var assert = require('chai').assert 
  , arango = require('../index')
  , util = require('util');

var db = new arango.Connection({name:"testcol"});
var query = {query:"FOR u IN testcursor RETURN u", count:true, batchSize:2};
var query2 = {query:"FOR u IN testcursor RETURN u._id",count:true, batchSize:1};
var id;
 
function initSuite(done){
  db = new arango.Connection({name:"testcursor"});
    db.collection.create(function(err,ret){
      var data = {};
      for(var i = 0; i < 50; i++) {
        data.i = i;
        data.msg = "test";
        db.document.create(data).on('error',function(error){
          assert(error.code,error.message);
        }).on('result',function(res){
            
        });
      }
      done();
    });
 }

function exitSuite(done){
  db.collection.delete("testcursor",function(err,ret){
    if(err) assert(!err,util.inspect(ret));
    done();
  });
}

 
suite('Arango cursor', function(){
  
  suiteSetup(initSuite);
  
  test('create', function(done){
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
   
  suiteTeardown(exitSuite);
   
});
  