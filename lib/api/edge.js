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

    var params = require('../utils').Params,
        path = "/_api/edge/",
        xpath = "/_api/edge?collection=",
        ypath = "/_api/edges/";

    var EdgeAPI = {
        "create":params([{collection:"string"},{from:"string"},{to:"string"},{data:"object"},{callback:"function"}],
            function(collection,from,to,data,callback) {
                if(!to){
                    to = from;
                    from = collection;
                    collection = db.name;
                }
                return db['post'](xpath+collection+'&from='+from+'&to='+to,data,callback);
            }
        ),
        "get":params([{match:"boolean"},{id:"string"},{rev:"string"},{callback:"function"}],
            function(match,id,rev,callback) {   
                if(match !== undefined) {
                    rev = JSON.stringify(rev||id);
                    if(match) return db['raw']({method:'GET',headers:{"if-match":rev}},path+id,callback);
                    else return db['raw']({method:'GET',headers:{"if-none-match":rev}},path+id,callback);
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
        "list":params([{vertex:"string"},{direction:"string"},{callback:"function"}],
            function(vertex,direction,callback) {
                direction = direction ? direction : "any";
                var options = '?vertex='+vertex+'&direction='+direction;
                return db['get'](ypath+db.name+options,callback);
            }
        )    
    };

    return EdgeAPI;
}

module.exports = closure;
