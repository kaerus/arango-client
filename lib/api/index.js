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

function closure(db){

    var path = "/_api/index/",
        xpath = "/_api/index?collection=";

      
    var IndexAPI = {
        "create": function(data,callback) {
            return db['post'](xpath+db.name,data,callback);
        },
        "get": function(id,callback) {
            return db['get'](path+id,callback);
        },
        "delete": function(id,callback) {
            return db['delete'](path+id,callback);
        },
        "list":function(callback) {
            return db['get'](xpath+db.name,callback);
        }    
    };

    return IndexAPI;
}

module.exports = closure;
