arango-client
=============
ArangoDB client node.js module

Examples
--------

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

/* query builder examples */

/* simple query string */
db.query.exec("FOR u in test RETURN u",function(err,ret){
  console.log("err(%s):", err, ret);
});

/* using the experimental query builder */
query = db.query.for('u').in('users')
                .filter('u.contact.address.state == "CA"')
                .collect('region = u.contact.region').into('group')
                .sort('LENGTH(group) DESC').limit('0, 5')
                .return('{"region": region, "count": LENGTH(group)}');

/* show the composed query string */
query.string
'FOR u IN users FILTER u.contact.address.state == @state COLLECT region = u.contact.region INTO group SORT LENGTH(group) DESC LIMIT 0, 5 RETURN {"region": region, "count": LENGTH(group)}'
                
/* execute test */
query.test(function(err,ret){
  console.log("err(%s):",err,ret);
});

/* execute the query with the variable 'state' */
query.exec({state: "CA"}, function(err,ret){
  console.log("err(%s):",err,ret);
});

/* nested queries */
query = b.query.for('likes').in(function() {
  return this.for('u').in('users')
  .filter('u.gender == @gender && @likes')
  .from('u.likes').include(function() {
      return this.from('value').in('u.likes')
      .filter('value != @likes')
      .return('value');
  });
}).collect('what = likes').into('group')
.sort('LENGTH(group) DESC')
.limit('0, 5')
.return('{"what": what, "count": LENGTH(group)}');

query.string
'FOR likes IN ( FOR u IN users FILTER u.gender == @gender && @likes IN u.likes  FOR value IN u.likes FILTER value != @likes RETURN value ) COLLECT what = likes INTO group SORT LENGTH(group) DESC LIMIT 0, 5 RETURN {"what": what, "count": LENGTH(group)}'

query.exec({gender:"female",likes:"running"},function(err,ret){
  console.log("err(%s):",err,ret);
});
```

