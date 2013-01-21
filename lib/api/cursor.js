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

function closure(db) {
    
    var path = "/_api/cursor/";

    function CursorAPI(){}

    CursorAPI.prototype = {
        "get": function(id,callback) {
            return db['put'](path+id,{},callback);
        },
        "create": function(data,callback) {
            return db['post'](path,data,callback);
        },
        "query": function(data,callback) {
            return db['post']("/_api/query",data,callback);
        },
        "explain": function(data,callback) {
            return db['post']("/_api/explain",data,callback);
        },
        "delete": function(id,callback) {
            return db['delete'](path+id,callback);
        }
    };

    return new CursorAPI;
}

module.exports = closure;
