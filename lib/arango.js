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

function Connection() {
    this.use.apply(this,arguments);

    Object.defineProperty(this,"server",{
        get: function () {
            return {protocol:this.protocol, 
                    hostname:this.hostname,
                    port:this.port,
                    headers:this.headers };
        }
    });
 
    /* Include API modules */
    for(var module in api) {
        this[module] = api[module](this);
    } 
}

Connection.prototype = {
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
    "use": function() {
        for(var i = 0, connection; connection = arguments[i]; i++) {
            if(typeof connection === 'object') {
                utils.extend(true,this,connection);
            }
            else if(typeof connection === 'string') {
                var conn = utils.parseUrl(connection);
                if(conn) {
                    utils.extend(this,conn);
                    /* get collection name from path */
                    if(conn.path) {
                        this.path = conn.path;
                        if(typeof this.path === 'string') {
                            this.name = this.path;
                        } else if(typeof this.path === 'object') {
                            this.name = this.path.first;
                        }
                    }   
                } else {
                    /* Connection string is a collection name */
                    this.name = connection;
                }    
            } else throw new Error("Invalid connection");
        }

        /* apply defaults */ 
        this.protocol = this.protocol || (WINDOW_LOCATION ? WINDOW_LOCATION.protocol.split(':')[0] : "http");
        this.hostname = this.hostname || (WINDOW_LOCATION ? WINDOW_LOCATION.hostname : "127.0.0.1");
        this.port = parseInt(this.port,10) || (WINDOW_LOCATION ? WINDOW_LOCATION.port : 8529);
        this.name = this.name || "";
        this.headers = this.headers || {};

        /* Basic authorization */
        if(this.username) this.headers.authorization = 'Basic ' + 
            this.crypto.enc.Utf8.parse(this.username + ':' + this.password).toString(this.crypto.enc.Base64);

        return this;
    },
    "crypto": require('./ext/crypto')
}

module.exports = {Connection: Connection};

