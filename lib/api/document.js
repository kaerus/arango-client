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

    var params = require('../utils').Params,
        path = "/_api/document/",
        xpath = "/_api/document?collection=";


    function DocumentAPI(){}

    DocumentAPI.prototype = {
        "create":params([{create:"boolean"},{collection:"string"},{data:"object"},{callback:"function"}],
            function(create,collection,data,callback) {
                create = create ? "&createCollection=true" : "";
                collection = collection ? collection : db.name;
                return db['post'](xpath+collection+create,data,callback);
            }
        ),
        "get":params([{match:"boolean"},{id:"string"},{rev:"string"},{callback:"function"}],
            function(match,id,rev,callback) {
                if(match !== undefined) {
                    rev = JSON.stringify(rev||id);
                    if(match) return db['raw']({method:'GET',headers:{"if-match":rev}},path+id,callback);
                    else return db['raw']({method:'GET',headers:{"if-none-Match":rev}},path+id,callback);
                }
                return db['get'](path+id,callback);
            }
        ),
        "put":params([{match:"boolean"},{id:"string"},{rev:"string"},{data:"object"},{callback:"function"}],
            function(match,id,rev,data,callback) {
                if(match !== undefined) {
                    rev = JSON.stringify(rev||id);
                    if(match) return db['raw']({method:'PUT',headers:{"if-match":rev}},path+id,data,callback);
                    else return db['raw']({method:'PUT',headers:{"if-none-match":rev}},path+id,data,callback);
                }
                return db['put'](path+id,data,callback);
            }
        ),
        "patch":params([{match:"boolean"},{id:"string"},{rev:"string"},{data:"object"},{callback:"function"}],
            function(match,id,rev,data,callback) {
                if(match !== undefined) {
                    rev = JSON.stringify(rev||id);
                    if(match) return db['raw']({method:'PATCH',headers:{"if-match":rev}},path+id,data,callback);
                    else return db['raw']({method:'PATCH',headers:{"if-none-match":rev}},path+id,data,callback);
                }
                return db['patch'](path+id,data,callback);
            }
        ),
        "delete": function(id,callback) {
            return db['delete'](path+id,callback);
        },
        "head": function(id,callback) {
            return db['head'](path+id,callback);
        },
        "list":params([{collection:"string"},{callback:"function"}], 
            function(collection,callback) {
                collection = collection ? collection : db.name;
                return db['get'](xpath+collection,callback);
            }
        )
    }

    return new DocumentAPI;
}

module.exports = closure;
