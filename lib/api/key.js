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
        path = "/_api/key/",
        xpath = "/_api/keys/";

    function KeyAPI(){}

    KeyAPI.prototype = {
        "get":function(key,callback) {
            return db['get'](path+db.name+'/'+key,callback);
        },
        "create":params([{key:"string"},{expire:"string"},{options:"object"},{data:"object"},{callback:"function"}],
            function(key,expire,options,data,callback) {
                var headers = {};

                if(options.expires) {
                    if(typeof options.expires === 'object') expiry = options.expires;
                    else expiry = new Date(Date.parse(options.expires,"yyyy-MM-dd HH:MM:SS"));
                    headers['x-voc-expires'] = expiry.toISOString();
                } else if(expire) {
                    expiry = new Date(Date.parse(expire,"yyyy-MM-dd HH:MM:SS"));
                    headers['x-voc-expires'] = expiry.toISOString();  
                } 

                if(options.extended) headers['x-voc-extended'] = JSON.stringify(options.extended);    
                else if(options) headers['x-voc-extended'] = JSON.stringify(options);

                return db['raw']({"method":"POST",headers:headers},path+db.name+'/'+key,data,callback);
            }
        ),
        "put":params([{key:"string"},{expire:"string"},{options:"object"},{data:"object"},{callback:"function"}],
            function(key,expire,options,data,callback) {
                var headers = {};

                if(options.expires) {
                    if(typeof options.expires === 'object') expiry = options.expires;
                    else expiry = new Date(Date.parse(options.expires,"yyyy-MM-dd HH:MM:SS"));
                    headers['x-voc-expires'] = expiry.toISOString();
                } else if(expire) {
                    expiry = new Date(Date.parse(expire,"yyyy-MM-dd HH:MM:SS"));
                    headers['x-voc-expires'] = expiry.toISOString();  
                } 

                if(options.extended) headers['x-voc-extended'] = JSON.stringify(options.extended);    
                else if(options) headers['x-voc-extended'] = JSON.stringify(options);

                return db['raw']({"method":"PUT",headers:headers},path+db.name+'/'+key+'?create=1',data,callback);
            }
        ),
        "delete": function(key,callback) {
            return db['delete'](path+db.name+'/'+key,callback);
        },
        "list": function(key,callback) {
            return db['get'](xpath+db.name+'/'+key,callback);
        }
    };

    return new KeyAPI;
}

module.exports = closure;
