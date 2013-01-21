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

function closure(db) {

    var params = require('../utils').Params,
        path = "/_api/collection/";

    function CollectionAPI(){}

    CollectionAPI.prototype = {
        "create": params([{collection:"string"},{data:"object"},{callback:"function"}],
            function(collection,data,callback) {
                collection = collection ? collection : db.name;
                data = data ? data : {};
                if(!data.name) data.name = collection;
                return db['post'](path,data,callback);
            }
        ),
        "get": function(id,callback) {
            return db['get'](path+id,callback);   
        },
        "delete": function(id,callback) {
            return db['delete'](path+id,callback);
        },
        "truncate": function(id,callback) {
            return db['put'](path+id+'/truncate',null,callback);
        },
        "count": function(id,callback) {
            return db['get'](path+id+'/count',callback);
        },
        "figures": function(id,callback) {
            return db['get'](path+id+'/figures',callback);
        },
        "list": function(callback) {
            return db['get'](path,callback);
        },
        "load": function(id,callback) {
            return db['put'](path+id+'/load',null,callback);
        },
        "unload": function(id,callback) {
            return db['put'](path+id+'/unload',null,callback);
        },
        "rename": function(id,data,callback) {
            if(typeof data === 'string' ) data = {name: data};
            return db['put'](path+id+'/rename',data,callback);
        },
        "getProperties": function(id,callback) {
            return db['get'](path+id+'/properties',callback);
        },
        "setProperties": function(id,data,callback) {
            return db['put'](path+id+'/properties',data,callback);
        }
    };

    return new CollectionAPI;
}

module.exports = closure;

