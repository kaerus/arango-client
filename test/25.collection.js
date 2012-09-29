if (typeof define !== 'function') { var define = require('amdefine')(module) }

var libs = [
   '../lib/arango',
  './lib/qunit-1.10.js'
];

define(libs,function(arango){ 
  module = QUnit.module;

var db = new arango.Connection;

module("Collection");  

asyncTest('create',2,function(){
    db.collection.create("testcreate",function(err,ret){
      ok(!err,"created");
      equal(ret.name,"testcreate","name validated");
      db.collection.delete("testcreate");
      start();
    });
});

asyncTest('delete',3,function(){
  db.collection.create("testdelete",function(err,ret){
    ok(!err,"created");
    var id = ret.id;
    db.collection.delete(id,function(err,ret){
      ok(!err,"Deleted");
      equal(ret.id,id,"deleted id validated");
      start();
    });
  });    
});


asyncTest('get by name & id',4,function(){
  db.collection.create("testget",function(create){
    ok(!create,"created");
    db.collection.get("testget",function(err,ret){
      ok(!err,"got collection by name");
      id = ret.id;
      db.collection.get(id,function(err,ret){
        ok(!err,"got collection by id");
        equal(ret.name,"testget","name validated");
        db.collection.delete("testget");
        start();
      });
    });
  });    
});

asyncTest('figures & count',3,function(){
  db.collection.create("testfigures",function(create){
    ok(!create,"created");
    db.collection.figures("testfigures",function(err,ret){
      ok(!err,"figures");
      db.collection.count("testfigures",function(err,ret){
        ok(!err,"count");
        db.collection.delete("testfigures");
        start();
      });
    });
  });  
});

asyncTest('list',1,function(){
  db.collection.list(function(list){
    ok(!list,"list");
    start();
  });
});


asyncTest('get & set properties',5,function(){
  db.collection.create("testprop",function(create){
    ok(!create,"created");
    db.collection.getProperties("testprop",function(err,p){
      ok(!err,"get properties");
      var sync = !(p.waitForSync), size = p.journalSize * 10;
      console.log("properties sync=%s size=%s:", sync,size,p);
      db.collection.setProperties("testprop",{waitForSync: sync,journalSize:size},function(err,ret){
        ok(!err,"set properties");
        equal(ret.waitForSync,sync,"waitForSync changed");
        equal(ret.journalSize,size,"journalSize changed");
        db.collection.delete("testprop");
        start();
      });
    });
  });   
});

asyncTest('unload & load',5,function(){
  db.collection.create("testload",function(create){
  ok(!create,"created");

    db.collection.unload("testload",function(err,ret){
      ok(!err,"unloaded");
      id = ret.id;
      equal(ret.status,4,"status 4");
      db.collection.load(id,function(err,ret){
        ok(!err,"loaded");
        equal(ret.status,3,"status 3");
        db.collection.delete("testload");
        start();
      });
    });
  });    
});

asyncTest('rename',4,function(){
  db.collection.create("rename",function(err,ret){
    ok(!err,"created");
    ok(ret.id,"have id");
    db.collection.rename(ret.id,"rename2",function(err,ret){
      ok(!err,"successful");
      equal(ret.name,"rename2","renamed");
      db.collection.delete(ret.id);
      start();
    });
  });
});

});  
  
  