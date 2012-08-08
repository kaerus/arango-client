var assert = require('chai').assert 
  , arango = require('../index')
  , util = require('util')
  , extend = require('node.extend');

var db = new arango.Connection("http://127.0.0.1/test");
var from, to, id, rev, data = {e:123}, doc = {a:1,b:2};

  
function setupDocs(done){
  db.document.create(true,data,function(err,ret){
    if(err) assert(!err,util.inspect(ret));
    from = ret._id;
      
    db.document.create(data,function(err,ret){
      if(err) assert(!err,util.inspect(ret));
      to = ret._id;
      done();
    });     
  });  
}

function teardownDocs(done){
  db.document.delete(from,function(err,ret){
    db.document.delete(to,function(err,ret){
      done();
    });
  });
}

suite('Arango edge', function(){
  
  suiteSetup(setupDocs);
  
  test('create edge', function(done){
    db.edge.create("test",from,to,data,function(err,ret){
      if(err) assert(!err,util.inspect(ret));
      id = ret._id;
      rev = ret._rev;
      done();
    });
  });
  
  test('check head',function(done){
    db.edge.head(id,function(err,ret){
      assert.equal(err,200,ret);
      done();
    });
  });
  
  test('get edge', function(done){
    db.edge.get(id,function(err,ret){
      if(err) assert(!err,util.inspect(ret));
      var docdata = db.extend(data,{_id:id,_rev:rev,_from:from,_to:to});
      assert.deepEqual(ret,docdata,"validate edge");
      done();
    });    
  });
  
  test('get edge if-match', function(done){
    db.edge.getIfMatch(id,rev,function(err,ret){
      if(err) assert(!err,util.inspect(ret));
      var docdata = db.extend({_id:id,_rev:rev,_from:from,_to:to},data);
      assert.deepEqual(ret,docdata,"validate edge");
      done();
    });    
  });
  
  test('get edge if-none-match', function(done){
    db.edge.getIfNoneMatch(id,'123456',function(err,ret){
      if(err) assert(!err,util.inspect(ret));
      var docdata = db.extend({_id:id,_rev:rev,_from:from,_to:to},data);
      assert.deepEqual(ret,docdata,"validate edge");
      done();
    });    
  });
  
  
  test('update & verify edge', function(done){
    data.e = {a:1,b:2};
    db.edge.put(id,data,function(err,ret){
      if(err) assert(!err,util.inspect(ret));
      rev = ret._rev;
      
      db.edge.get(id,function(err,ret){
        var docdata = db.extend(data,{_id:id,_rev:rev,_from:from,_to:to});
        assert.deepEqual(ret,docdata,"validate edge");
        done();
      });    
    });
  });
  
  test('update edge if-match', function(done){
    data.e = {a:2,b:3};
    db.edge.putIfMatch(id,rev,data,function(err,ret){
      if(err) assert(!err,util.inspect(ret));
      rev = ret._rev;
      done();
    });
  });
  
  test('update edge if-none-match', function(done){
    data.e = {a:4,b:5};
    db.edge.putIfNoneMatch(id,'123456',data,function(err,ret){
      if(err) assert(!err,util.inspect(ret));
      rev = ret._rev;
      done();
    });
  });
  
  /* PATCH not supported
  test('patch edge', function(done){
    var data2 = {f:1};
    db.edge.patch(id,data2,function(err,ret){
      if(err) assert(!err,util.inspect(ret));
      rev = ret._rev;
      db.edge.get(id,function(err,ret){
        var docdata = db.extend(data,data2,{_id:id,_rev:rev,_from:from,_to:to});
        assert.deepEqual(ret,docdata,"validate edge");
        done();
      });          
    });
  });
  */
  
  test('list edges', function(done){
    db.edge.list(from,'any',function(err,ret){
      if(err) assert(!err,util.inspect(ret));
      done();
    });
  });
  
  test('delete edge', function(done){
    db.edge.delete(id,function(err,ret){
      if(err) assert(!err,util.inspect(err));
      done();
    });
  });
  
  test('verify edge deleted by HEAD', function(done){
    db.edge.head(id, function(err,ret){
      assert.notEqual(err,200,ret);
      done();
    });
  });
  
  test('verify edge deleted by get', function(done){
    db.edge.get(id, function(err,ret){
      assert(err,ret);
      done();
    });
  });
  
  suiteTeardown(teardownDocs);
});