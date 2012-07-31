arango-client
=============
ArangoDB client node.js module

Example
=======

```
var arango = require('arango.client'), util = require('util');
 
/* Prepare a connection */ 
db = new arango.Connection("http://127.0.0.1/test");

/* create the test collection */
db.collection.create(function(err,ret){
  console.log("error(%s): ", err, ret);
});

/* create a new document */
db.document.create({a:"test"},function(err,ret){
  if(err) console.log("error(%s): ", err, ret);
  else console.log(util.inspect(ret));
});

/* get a list of documents */
db.document.list(function(err,ret){
  if(err) console.log("error(%s): ", err, ret);
  else console.log(util.inspect(ret));
});
 
/* create a document and a new collection on demand */
db.document.create(true,"newcollection",{a:"test"},function(err,ret){
  if(err) console.log("error(%s): ", err, ret);
  else console.log(util.inspect(ret));
});

/* create another document in new collection */
db.document.create("newcollection",{b:"test"},function(err,ret){
  if(err) console.log("error(%s): ", err, ret);
  else console.log(util.inspect(ret));
});

/* alternate style utilizing events */
db.document.list("newcollection").on('result',function(result){
  console.log(util.inspect(result));
}).on('error',function(error){
  console.log("error(%s):", error.code, error.message);
});

/* query for specific attribute */
db.cursor.create({query:"FOR u IN test RETURN u.a"}).on('result', function(result){
  console.log(util.inspect(result));
}).on('error',function(error){
  console.log("error(%s):", error.code, error.message);
});
```

