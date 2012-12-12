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
The api always returns a promise but it may also be called using a callback.

Providing a callback returns an error-flag/code, result and headers.
```javascript
db.document.get(docid,function(err,res,hdr){
  console.log("headers:", util.inspect(hdr));
  if(err) console.log("err(%s):", err, res);
  else console.log("result: ", util.inspect(res));
});
```

Using a promise
```javascript
db.document.get(docid)
  .then(function(res,hdr){ console.log("(%s):", hdr, res) },
    function(err){ console.log("error:", err) } );
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

/* with use() you can switch connection settings */
db.use("http://new.server/collection")

/* db.server dumps server configuration */
db.server

```

Creating collections & documents
-------------------------------
```javascript
/* Create a 'test' collection */
db.use("test");

db.collection.create(function(err,ret){
  console.log("error(%s): ", err, ret);
});

/* create a new document in 'test' collection */
db.document.create({a:'test',b:123,c:Date()})
  .then(function(res,hdr){
    console.log("(%s):",hdr,util.inspect(res)) },
    function(err){ console.log("error(%s): ", err) }
);  

/* get a list of all documents */
db.use("collection123")
  .document.list()
  .then(function(res){ console.log("result", res) },
    function(err){ console.log("error", err) } );
 
/* create a new document and create a new */
/* collection by passing true as first argument */
db.document.create(true,"newcollection",{a:"test"})
  .then(function(res){ console.log("res", util.inspect(res) },
    function(err){ console.log("err", err) } );
});

/* create another document in the collection */
db.document.create("newcollection",{b:"test"})
  .then(function(res){ console.log("res", util.inspect(res) },
    function(err){ console.log("err", err) } );
});
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
Result batch size can be set using the ```query.count(<number>)``` method.
In case of partial results the next batch can be retrieved with res.next().
```javascript
/* using the query builder */
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
query.exec({state: "CA"})
  .then(function(res){ console.log("res",res) },
    function(err){ console.log("err",err) });


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

Actions
-------
ArangoDB supports user defined actions that can be used for implementing business logic or creating complex queries serverside.
To request an action you first need to define it.
```javascript
/* define an action */
db.action.define(
    {
      name: 'someAction',
      url: 'http://127.0.0.1:8529/test'
      method: 'post',
      result: function(res){ console.log("res:", res ) },
      error: function(err){ console.log("err:", err) }   
    }
);

/* invoke the action */
var data = {test:"data"}
db.action.invoke("someAction",data);

/* you can also pass a callback */
db.action.invoke("someAction",data,function(err,ret){
  console.log("err(%s):", err, ret); 
}); 



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
 