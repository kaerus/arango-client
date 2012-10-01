if (typeof define !== 'function') { var define = require('amdefine')(module) }

var libs = [
   '../lib/arango',
  './lib/qunit-1.10.js'
];

define(libs,function(arango){ 

module = QUnit.module;

var db = new arango.Connection({name:"testcursor"});
var query = {query:"FOR u IN testcursor RETURN u", count:true, batchSize:1}, counter = 0, more = false;

module("Cursor");
  asyncTest('create, get, delete',6, function(){
    db.collection.create(function(collection){
      ok(!collection,"collection created");
      var data = {};
      for(var i = 0; i < 50; i++) {
        data.i = i;
        data.msg = "test";
        db.document.create(data);
      }
      /* NOTE: documents are still injected */
      db.cursor.create(query,function(err,ret){
        ok(!err,"cursor created");
        ok(ret.id,"cursor id");
        ok(ret.result,"cursor result");
        this.id = ret.id;
        this.count = ret.count;
        /* read batches */
        /* TODO: fix this test */
        do{
          db.cursor.get(ret.id,function(err,ret){
            more = ret.hasMore;
            counter++;
          });
        } while(more);
        equal(counter,this.count,"retrieved " + this.batches);
        db.cursor.delete(this.id,function(deleted){
          ok(!deleted,"deleted");
          db.collection.delete("testcursor");
          start();
        });
      });
    });
  });
   
});
  