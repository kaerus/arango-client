var assert = require('chai').assert 
  , arango = require('../index')
  , util = require('util');
  
suite('Arango document', function(){
  var db = new arango.Connection("http://127.0.0.1/test");
  var data = {somedata:"test1",somemore:"test2"};
  var collection =  "testcol", id, rev;
  
  test('create test collection', function(done){
    db.collection.create(function(err,ret){
      done();
    });
  });
  
  test('create 100 documents', function(done){
    for(var i = 0; i < 100; i++) {
      db.document.create(data).on('error',function(error){
        assert(error.code,error.message);
      });
    }
      done();
  });
  
  test('create and get document', function(done){
    db.document.create(data,function(err,ret){
      assert(!err);
      id = ret._id;
      rev = ret._rev;
      db.document.get(id,function(err,doc){
        var docdata = db.extend({_id:id,_rev:rev},data);
        assert(!err);
        assert.deepEqual(docdata,doc);
        done();
      });
    });
  });
  
  test('check head',function(done){
    db.document.head(id,function(err,ret){
      assert.equal(err,200,ret);
      done();
    });
  });
  
  test('update document', function(done){
    var moredata = db.extend(data,{more:"some extra"});
    db.document.put(id,moredata,function(err,ret){
      assert(!err);
      assert.equal(id,ret._id,"id should be same");
      assert.notEqual(rev,ret._rev,"rev should be updated");
      rev = ret._rev;
      db.document.get(id,function(err,doc){
        var docdata = db.extend({_id:id,_rev:rev},moredata);
        assert(!err);
        assert.deepEqual(docdata,doc);
        done();   
      });
    });
  });
  
  /* PATCH method is not supported
  test('get and patch document', function(done) {
    db.document.get(id,function(err,doc){
        assert(!err);
        var patchdata = {patched:"xxx"};
        db.document.patch(id,patchdata,function(err,ret){
          assert(!err,util.inspect(ret));
          assert(true,"todo: verify patched data");
          done();
        });
    });
  });
  */
  
  test('delete and verify deleted', function(done){
    db.document.delete(id,function(err,ret){
      assert(!err);
      db.document.get(id,function(err,ret){
        assert(err);
        done();
      });
    });
  });
  
  
  test('create document and force collection', function(done){
    db.document.create_("newcollection",data,function(err,ret){
      if(err) assert(!err,util.inspect(ret));
      id = ret._id;
      rev = ret._rev;
      done();
    });
  });
  
  test('delete and verify', function(done){
     db.document.delete(id,function(err,ret){
        if(err) assert(!err, util.inspect(ret));
        assert.equal(ret._id,id,"validate deleted document id");
        assert.equal(ret._rev,rev,"validate deleted document rev");   
        done();
     });
  });
  
  
});