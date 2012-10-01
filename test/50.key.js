if (typeof define !== 'function') { var define = require('amdefine')(module) }

var libs = [
   '../lib/arango',
  './lib/qunit-1.10.js'
];

define(libs,function(arango){ 

module = QUnit.module;

var db = new arango.Connection({name:"testkey"});
var key, id, db
  , options = {}, data = "this is a test"
  , extend = {a:1,b:2}, date = new Date();

//var utils = require('../lib/utils');


module("Key");  
asyncTest('create, get, update & verify',function(){
  db.collection.create(function(err){
    ok(!err,"created collection");
    key = "testkey";
    date.setDate(date.getDate()+1);
    date.setMilliseconds(0);  // Note: adb truncates millisecs
    options.expires = date;
    options.extended = extend; 
    db.key.create(key,options,data,function(err,ret){
      ok(!err,"created key");
      id = ret._id; // ? 
      db.key.get(key,function(err,ret,hdr){
        ok(!err,"get");
        var d = new Date(Date.parse(hdr['x-voc-expires'].toUpperCase()));
        console.log("x-voc-expires:",hdr['x-voc-expires']);
        equal(d.toISOString(),
                     date.toISOString(),"validate expiration");
        deepEqual(JSON.parse(hdr['x-voc-extended']),
                     extend,"validate extended");
        assert.equal(ret,data,"validate data"); 
        options.extend = {b:3,c:1};
        data = "we have updated the data";
        db.key.put(key,options,data,function(err,ret){
          ok(!err,"update");
          ok(ret.changed,"validate changed");
          db.key.get(key,function(err,ret,hdr){
            ok(!err,"refresh");
            var d = new Date(Date.parse(hdr['x-voc-expires'].toUpperCase()));
            equal(d.toISOString(),
                       date.toISOString(),"validate expiration");
            deepEqual(JSON.parse(hdr['x-voc-extended']),
                       extend,"validate extended");
            equal(ret,data,"validate data");         
            db.key.delete(key,function(err,ret){
              ok(!err,"deleted");
              db.collection.delete("testkey");
              start();
            });    
          });
        });            
      });
    });
  });
});
});