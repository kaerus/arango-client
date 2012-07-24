var assert = require('chai').assert 
  , arango = require('../index')
  , util = require('util')
  , extend = require('node.extend');
  
suite('Arango document', function(){
  var db = new arango.Connection({name:"test"});
  var data = {somedata:"test1",somemore:"test2"};
  var id, rev;
  
  test('create and get document', function(done){
    db.document.create(data,function(err,ret){
      assert(!err);
      id = ret._id;
      rev = ret._rev;
      db.document.get(id,function(err,doc){
        var docdata = extend({_id:id,_rev:rev},data);
        assert(!err);
        assert.deepEqual(docdata,doc);
        done();
      });
    });
  });
  
  test('update document', function(done){
    var moredata = extend(data,{more:"some extra"});
    db.document.put(id,moredata,function(err,ret){
      assert(!err);
      assert.equal(id,ret._id,"id should be same");
      assert.notEqual(rev,ret._rev,"rev should be updated");
      rev = ret._rev;
      db.document.get(id,function(err,doc){
        var docdata = extend({_id:id,_rev:rev},moredata);
        assert(!err);
        assert.deepEqual(docdata,doc);
        done();   
      });
    });
  });
  
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
  
  test('delete and verify deleted', function(done){
    db.document.delete(id,function(err,ret){
      assert(!err);
      db.document.get(id,function(err,ret){
        assert(err);
        done();
      });
    });
  });
  
  
});