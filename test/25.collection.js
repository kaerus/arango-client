if (typeof define !== 'function') { var define = require('amdefine')(module) }

var libs = [
   '../lib/arango',
  './lib/qunit-1.10.js'
];

define(libs,function(arango){ 
  module = QUnit.module;

var db = new arango.Connection;
  
module('Collection',{
  setup: function(){
    db.collection.create("testcol");
  }
});      


asyncTest('create collection',2,function(){
  db.collection.delete("testcol2",function(){
    db.collection.create("testcol2",function(err,ret){
      ok(!err,"Created collection");
      equal(ret.name,"testcol2","name validated");
      start();
    });
  });
});

asyncTest('get collection by id',3,function(){
  db.collection.get("testcol",function(err,ret){
    ok(!err,"got collection by name");
    id = ret.id;
    db.collection.get(id,function(err,ret){
      ok(!err,"got collection by id");
      equal(ret.name,"testcol","name validated");
      start();
    });
  });  
});

asyncTest('get collection by name',1,function(){
  db.collection.get("testcol",function(err,ret){
    ok(!err,"got collection");
    start();
  });
});

asyncTest('collection figures',1,function(){
  db.collection.figures("testcol",function(err,ret){
    ok(!err,"successful");
    start();
  });
});

asyncTest('collection count',1,function(){
  db.collection.count("testcol",function(err,ret){
    ok(!err,"successful");
    start();
  });
});

asyncTest('list collections',1,function(){
  db.collection.list(function(err,ret){
    ok(!err,"successful");
    start();
  });
});


asyncTest('collection properties',4,function(){
  db.collection.create("properties",function(err,ret){
    db.collection.getProperties("properties",function(err,ret){
      ok(!err,"get properties");
      js = ret.journalSize;
      ws = ret.waitForSync;

      db.collection.setProperties("properties",{waitForSync:!ws,journalSize:js*10},function(err,ret){
        ok(!err,"set properties");
        equal(ret.waitForSync,!ws,"waitForSync changed");
        equal(ret.journalSize,js*10,"journalSize changed");
        start();
      });
    });
  });   
});

asyncTest('unload & load',4,function(){
  db.collection.unload("testcol",function(err,ret){
    ok(!err,"unloaded");
    id = ret.id;
    equal(ret.status,4,"status 4");
    db.collection.load(id,function(err,ret){
      ok(!err,"loaded");
      equal(ret.status,3,"status 3");
      start();
    });
  });  
});

asyncTest('rename collection',3,function(){
  db.collection.create("rename",function(err,ret){
    ok(!err,"created");
    var rid = ret.id;
    db.collection.rename(rid,"rename2",function(err,ret){
      ok(!err,"successful");
      equal(ret.name,"rename2","renamed");
      db.collection.delete(rid);
      start();
    });
  });
});


asyncTest('delete collection',3,function(){
  db.collection.create("deleteme",function(err,ret){
    ok(!err,"created");
    var id = ret.id;
    db.collection.delete(id,function(err,ret){
      ok(!err,"Deleted");
      equal(ret.id,id,"deleted id validated");
      start();
    });
  });    
});

});  
  
  