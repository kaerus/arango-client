/* 
 * Copyright (c) 2012 Kaerus (kaerus.com), Anders Elo <anders @ kaerus com>.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

"use strict"

var BROWSER = (typeof window ==='object' && window.hasOwnProperty('location')),
    WINDOW_LOCATION = (BROWSER ? window.location : false), 
    utils = require('./utils'), 
    request = require('./request');

var api = {
  "collection": require('./api/collection'),
  "document": require('./api/document'),
  "action": require('./api/action'),
  "cursor": require('./api/cursor'),
  "simple": require('./api/simple'),
  "index": require('./api/index'),
  "admin": require('./api/admin'),
  "query": require('./api/query'),
  "edge": require('./api/edge'),
  "key": require('./api/key')
};

/* Arango connection factory */
function Connection(){
    var arango = new Arango();

    /* apply defaults */ 
    arango.name = '';

    arango.server = {
        protocol: WINDOW_LOCATION ? WINDOW_LOCATION.protocol.split(':')[0] : "http",
        hostname: WINDOW_LOCATION ? WINDOW_LOCATION.hostname : "127.0.0.1",
        port: WINDOW_LOCATION ? WINDOW_LOCATION.port : 8529,
        headers: {}
    }
    
    var username, password;

    for(var i = 0, connection; connection = arguments[i]; i++) {
        if(typeof connection === 'object') {
            utils.extend(true,arango,connection);
        }
        else if(typeof connection === 'string') {
            var conn = utils.parseUrl(connection);
            if(conn) {
                arango.server.protocol = conn.protocol;
                arango.server.hostname = conn.hostname;
                arango.server.port = parseInt(conn.port,10);
                username = conn.username;
                password = conn.password;
                /* get collection name from path */
                if(conn.path) {
                    if(typeof conn.path === 'string') {
                        arango.name = conn.path;
                    } else if(typeof conn.path === 'object') {
                        arango.name = conn.path.first;
                    }
                }   
            } else {
                /* Connection string is a collection name */
                arango.name = connection;
            }    
        } else throw new Error("Invalid connection");
    }

    /* Basic authorization */
    if(username) {
        arango.server.headers.authorization = 'Basic ' + 
            arango.crypto.enc.Utf8.parse(username + ':' + password).toString(arango.crypto.enc.Base64);  
    }

    return arango;
}

function Arango(obj) {

    /* inherit preferences */
    if(obj instanceof Arango) {
        this.server = utils.extend(true,{},obj.server);
    } 

    /* Mixin the API modules */
    for(var module in api) {
        this[module] = api[module](this);
    } 
}

Arango.prototype = {
    "get": function(path,callback){
        return request(this,{method:"GET"},path,null,callback);
    },
    "post": function(path,data,callback){
        return request(this,{method:"POST"},path,data,callback);
    },
    "put": function(path,data,callback){
        return request(this,{method:"PUT"},path,data,callback);
    },
    "delete": function(path,callback){
        return request(this,{method:"DELETE"},path,null,callback);
    },
    "head": function(path,callback){
        return request(this,{method:"HEAD"},path,null,callback);
    },
    "patch": function(path,data,callback){
        return request(this,{method:"PATCH"},path,data,callback);
    },
    "raw": function(options,path,data,callback){
        return request(this,options,path,data,callback);
    },
    "use": function(preference) {
        /* spawn a new object with the new preference setting */
        var db = new Arango(this);
        
        if(typeof preference === 'string') db.name = preference;
        else if(typeof preference === 'object') utils.extend(true,db,preference);

        /* We return a new object since a preference change  */
        /* would not work so well in asynchronous operations */
        return db;
    },
    "crypto": require('./ext/crypto')
}

module.exports = {Connection: Connection};

