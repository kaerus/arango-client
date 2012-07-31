arango-client
=============
ArangoDB client node.js module

Example
=======

```
var arango = require('arango.client'), util = require('util');
 
/* Prepare a connection, defaults {protocol:'http', hostname:'127.0.0.1', port: 8529} */ 
db = new arango.Connection({name:"testcollection"});

/* we need to first create our test collection */
db.collection.create(function(err,ret){
  console.log("err(%s): ",err, ret);
});

/* create a new document in collection */
db.document.create({a:"test"},function(err,ret){
  if(err) console.log("error(%s): ", err,ret);
  else console.log(util.inspect(ret));
});
 
/* create a document and a new collection on demand */
db.document.create_("newcollection",{a:"test"},function(err,ret){
  if(err) console.log("error(%s): ", err,ret);
  else console.log(util.inspect(ret));
});
 
/* alternate style utilizing events */
db.document.list().on('result',function(result){
  console.log(util.inspect(result));
}).on('error',function(error){
  console.log("error(%s):", error.code, error.message);
});
```

