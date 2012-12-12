ArangoDB client
===============
A client for the ArangoDB nosql database.

Install
-------
```
As nodejs module: npm install arango.client
From source: git clone git://github.com/kaerus/arango-client
```

Test
----
```
Open/run index.html from the test directory.
```

Building
--------
To be able to build a minified version you need to have the require.js optimizer r.js installed.
```
make dist
```
This creates a single minified javascript file in the ```dist``` directory.


Usage
=====
You can use arango-client either as node.js server module or from a web client.
Since arango-client is written in AMD compatible fashion you should be able 
to require it in your project using any standard AMD loader.
However, require.js is included by default when installing through npm.

Introduction
------------
All callbacks receives error code, return value and message headers.
If the error is set, return contains an error message, otherwise return
contains whatever yields from the database, usually in the form of a json object. 
```javascript
db.document.get(docid,function(err,ret,hdr){
  console.log("headers:", util.inspect(hdr));
  if(err) console.log("err(%s):", err, ret);
  else console.log("result: ", util.inspect(ret));
});
```

Using events
------------
You may also use events as a means to receive data or errors.
This can be very useful in some cases, however the current implementation 
is somewhat limited at the moment but new exciting developements are in the pipeline.

The on 'error' event passes an error object with error.code and error.message.
```javascript
db.document.get("error").on('error',function(error){
  console.log("err(%s):",error.code, error.message);
});
```
On 'result' event passes the returned data and headers.
```javascript
db.document.list().on('result',function(result){
  console.log("result:", util.inspect(result));
});
```
For details regarding the ArangoDB interface check out lib/api/ 
and use the nodejs/browser console to experiment.
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
``` 
 
Initialization
--------------
To initialize a connection you have to use the ```Connection([string],[object])``` constructor.
```javascript
/* use default settings, connects to http://127.0.0.1:8529 in nodejs */
/* or window.location when using from your browser */
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
Sometimes it's better to use events instead of callbacks.

```javascript
/* alternate style utilizing events */
db.document.list("newcollection").on('result',function(result){
  console.log(util.inspect(result));
});
/* errors are logged to console per default */
```

Queries
-------
```javascript
/* simple query string */
db.query.exec("FOR u in test RETURN u",function(err,ret){
  console.log("err(%s):", err, ret);
});

/* A bindvar for the collection name */
db.query.string = "FOR u IN @@collection RETURN u";
...
/* execute the query and pass the collection variable */
db.query.exec({'@collection':"test"},function(err,ret){
  console.log("err(%s):",util.inspect(ret));
});
```
Note: ArangoDB expects @@ in front of collection names when using a bindvar.
The bindvar attribute in this case needs to be prefixed with a single @. 
In all other cases the bindvar atttribute can be provided without any prefix 
and the variable in the query string is denoted with a single @ . 



Query builder
-------------
The query builder is still experimental and prone for changes.
Batch size can be set using the ```query.count(<number>)``` method.
However iterations over result sets are not fully supported yet.
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
```
Copyright (c) 2012 Kaerus (kaerus.com), Anders Elo <anders @ kaerus com>.
```
Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at
 
    http://www.apache.org/licenses/LICENSE-2.0
 
Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
 