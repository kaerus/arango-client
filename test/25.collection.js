if (typeof define !== 'function') { var define = require('amdefine')(module) }
  
var libs = [
   '../lib/arango',
  './lib/qunit-1.10.js'
];

define(libs,function(arango){ 
  module = QUnit.module;

var db = new arango.Connection
  , id, id2, name = "testcollection";
  
module('Collection');      


moduleBegin = function(){
  db.collection.delete(name,function(err,ret){
    start();
  });
} 

moduleDone = function(){
    db.collection.delete(name,function(err,ret){
  });  
}

stop();

asyncTest('create collection',2,function(){
  db.collection.create(name,function(err,ret){
    ok(!err,"Created collection");
    equal(ret.name,name,"name validated");
    id = ret.id;
    start();
  });
});

asyncTest('create collection 2',2,function(){
  var name2 = "testcollection2";
  db.collection.create(name2,function(err,ret){
    console.log("ERr(%s):",err,ret);
    ok(!err,"create collection");
    equal(ret.name,name2,"name validated");
    id2 = ret.id;
    start();
  });
});

asyncTest('delete collection 2',2,function(){
  db.collection.delete(id2,function(err,ret){
    ok(!err,"Delete collection");
    equal(ret.id,id2,"deleted collection id validated");
    start();
  });
});


asyncTest('get collection by id',2,function(){
  db.collection.get(id,function(err,ret){
    ok(!err,"got collection");
    equal(ret.name,name,"name validated");
    start();
  });
});

asyncTest('get collection by name',2,function(){
  db.collection.get(name,function(err,ret){
    ok(!err,"got collection");
    equal(ret.id,id,"id validated");
    start();
  });
});

asyncTest('delete collection',2,function(){
  db.collection.delete(id,function(err,ret){
    ok(!err,"Deleted");
    equal(ret.id,id,"deleted id validated");
    start();
  });
});

});  
  
  