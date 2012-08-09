var assert = require('chai').assert 
  , arango = require('../index')
  , util = require('util');

var collection = "testkey";
var key, id, db
  , options = {}, data = "this is a test"
  , extend = {a:1,b:2}, date = new Date();

  
function initSuite(done){
  db = new arango.Connection({name:collection});
  /* reset test collection */
  db.collection.delete(collection,function(err,ret){
    db.collection.create(collection,function(err,ret){
      if(err) assert(!err,util.inspect(ret));
      done();
    });
  });
}

function exitSuite(done){
  db.collection.delete(collection,function(err,ret){
    if(!err) done();
  });  
}


suite('Arango key store', function(){
  
  suiteSetup(initSuite);
  test('create key',function(done){
    key = "testkey";
    date.setDate(date.getDate()+1);
    date.setMilliseconds(0);  // Note: adb truncates millisecs
    options.expires = date;
    options.extended = extend; 
    db.key.create(collection,key,options,data,function(err,ret){
      if(err) assert(!err,util.inspect(ret));
      id = ret._id; // ? 
      done();
    });
  });
  
  test('get key',function(done){
    db.key.get(collection,key,function(err,ret,hdr){
      if(err) assert(!err,util.inspect(ret));
      var d = new Date(Date.parse(hdr['x-voc-expires']));
      assert.equal(d.toISOString(),
                   date.toISOString(),"validate expiration");
      assert.deepEqual(JSON.parse(hdr['x-voc-extended']),
                   extend,"validate extended");
      assert.equal(ret,data,"validate data");             
      done();
    });
  });
  
  test('update & verify key',function(done){
    options.extend = {b:3,c:1};
    data = "we have updated the data";
    db.key.put(collection,key,options,data,function(err,ret){
      if(err) assert(!err,util.inspect(ret));
      assert.isTrue(ret.changed,"validate changed");
      
      db.key.get(collection,key,function(err,ret,hdr){
        if(err) assert(!err,util.inspect(ret));
        var d = new Date(Date.parse(hdr['x-voc-expires']));
        assert.equal(d.toISOString(),
                   date.toISOString(),"validate expiration");
        assert.deepEqual(JSON.parse(hdr['x-voc-extended']),
                   extend,"validate extended");
        assert.equal(ret,data,"validate data");             
        done();
      });
    });
  });
  
  test('delete key',function(done){
    db.key.delete(collection,key,function(err,ret){
      if(err) assert(!err,util.inspect(ret));
      done();
    });
  });
  
  suiteTeardown(exitSuite);
});