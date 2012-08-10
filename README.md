ArangoDB client
===============
A client for the ArangoDB nosql database.

Install
-------
```
npm install arango.client
```

Test
----
```
npm test
```

Usage
=====
Either as node.js server module or from a web client.


Callbacks gets error, result (or message on error) and headers. 
```javascript
db.document.get(docid,function(err,ret,hdr){
  console.log("headers:", util.inspect(hdr));
  if(err) console.log("err(%s):", err, ret);
  else console.log("result: ", util.inspect(ret));
});
```
When using Events, on 'error' passes an error object with error.code and error.message
```javascript
db.document.get("error").on('error',function(error){
  console.log("err(%s):",error.code, error.message);
});
```
On 'result' event gets result data and headers (if needed).
```javascript
db.document.list().on('result',function(result){
  console.log("result:", util.inspect(result));
});
```
By default the 'error' event is being logged to console.
For details regarding the ArangoDB interface check out lib/api/ 
and use the node console to experiment.
```javascript
node
arango = require('arango.client')
{ Connection: [Function] }
db = new arango.Connection
```

Examples
========
Require
-------
```javascript
var arango = require('arango.client')
  , util = require('util');   // required for debug purposes
``` 
 
Initialization
--------------
To prepare a connection you have to use the Connection(<string>,<object>,<function>) constructor.
```javascript
/* use default, connects to http://127.0.0.1:8529 */
db = new arango.Connection

/* connection string */
db = new arango.Connection("http://127.0.0.1/test");

/* connection with http auth */
db = new arango.Connection("http://user:pass@your.host.com/database");

/* connection object */
db = new arango.Connection({name:"database", user:"master"});

/* mixed mode */
db = new arango.Connection("http://test.host.com:80/default",{user:uname,pass:pwd});
```

Creating collections & documents
-------------------------------
```javascript
/* Create a 'test' collection */
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
```
Utilizing events
----------------
Sometimes it's nicer to use events instead of callbacks.

```javascript
/* alternate style utilizing events */
db.document.list("newcollection").on('result',function(result){
  console.log(util.inspect(result));
}).on('error',function(error){
  console.log("error(%s):", error.code, error.message);
});
```

Queries
-------
```javascript
/* simple query string */
db.query.exec("FOR u in test RETURN u",function(err,ret){
  console.log("err(%s):", err, ret);
});

/* a bindvar for the collection name */
db.query.string = "FOR u IN @collection RETURN u";
...
/* execute the query and pass the collection variable */
db.query.exec({collection:"test"},function(err,ret){
  console.log("err(%s):",util.inspect(ret));
});
```

Query builder
-------------
The query builder is still experimental and prone for changes.
Batch size can be set using the query.count(<number>) method.
However iterations over result sets are not fully supported.
```javascript
/* using the experimental query builder */
query = db.query.for('u').in('users')
          .filter('u.contact.address.state == @state')
          .collect('region = u.contact.region').into('group')
          .sort('LENGTH(group) DESC').limit('0, 5')
          .return('{"region": region, "count": LENGTH(group)}');

/* show the composed query string */
console.log("Arango query:", query.string);
                
/* test run the query */
query.test(function(err,ret){
  console.log("err(%s):",err,ret);
});

/* execute the query and set the variable 'state' */
query.exec({state: "CA"}, function(err,ret){
  console.log("err(%s):",err,ret);
});

/* detailed query explanation */
query.explain({state:"CA"},function(err,ret){
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



License
=======
MIT License

Copyright (C) 2012 Anders Elo

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

