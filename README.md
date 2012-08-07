arango-client
=============
ArangoDB client node.js module

Examples
--------

```javascript
var arango = require('arango.client'), util = require('util');
 
/* Prepare a connection with 'test' as default collection */ 
db = new arango.Connection("http://127.0.0.1/test");

/* Create the 'test' collection */
db.collection.create(function(err,ret){
  console.log("error(%s): ", err, ret);
});

/* create a new document in 'test' collection */
db.document.create({a:'test',b:123,c:Date()},function(err,ret){
  if(err) console.log("error(%s): ", err, ret);
  else console.log(util.inspect(ret));
});

/* get a list of all documents in collection */
db.document.list(function(err,ret){
  if(err) console.log("error(%s): ", err, ret);
  else console.log(util.inspect(ret));
});
 
/* create a new document and create a new collection on demand */
db.document.create(true,"newcollection",{a:"test"},function(err,ret){
  if(err) console.log("error(%s): ", err, ret);
  else console.log(util.inspect(ret));
});

/* create another document in the new collection */
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

/* simple query string */
db.query.exec("FOR u in test RETURN u",function(err,ret){
  console.log("err(%s):", err, ret);
});

/* using the experimental query builder */
query = db.query.for('u').in('users')
          .filter('u.contact.address.state == @state')
          .collect('region = u.contact.region').into('group')
          .sort('LENGTH(group) DESC').limit('0, 5')
          .return('{"region": region, "count": LENGTH(group)}');

/* show the query string */
console.log("Arango query:", query.string);
                
/* test the query */
query.test(function(err,ret){
  console.log("err(%s):",err,ret);
});

/* execute the query and set the variable 'state' */
query.exec({state: "CA"}, function(err,ret){
  console.log("err(%s):",err,ret);
});

/* nested queries embedded as functions(){} */
query = db.query.for('likes').in(function() {
    this.for('u').in('users')
    .filter('u.gender == @gender && @likes')
    .from('u.likes').include(function() {
      this.from('value').in('u.likes')
      .filter('value != @likes')
      .return('value');
    });
  }).collect('what = likes').into('group')
  .sort('LENGTH(group) DESC')
  .limit('0, 5')
  .return('{"what": what, "count": LENGTH(group)}');


query.exec({gender:"female",likes:"running"},function(err,ret){
  console.log("err(%s):",err,ret);
});
```

