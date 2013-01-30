/* 
* Copyright (c) 2012 Kaerus (kaerus.com), Anders Elo <anders @ kaerus com>.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use db file except in compliance with the License.
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
        extend = require('../utils').extend,
        path = "/_api/document";


    function optionsToUrl(o){
        if(typeof o !== 'object') return '';

        return Object.keys(o).reduce(function(a,b,c){
                c = b + '=' + o[b];
                return !a ? '?' + c : a + '&' + c;
            },'');
    }

    var DocumentAPI = {
        "create": params([{data:"object"},{options:"object"},{callback:"function"}],
            function(data,options,callback) {
                options = options ? options : {};
                options.collection = options.collection ? options.collection : db.name;
               
                return db['post'](path+optionsToUrl(options),data,callback);
            }
        ),
        "get": params([{id:"string"},{options:"object"},{callback:"function"}],
            function(id,options,callback) {
                var headers;
                options = options ? options : {};
                if(options.match !== undefined) {
                    options.rev = JSON.stringify(options.rev||id);
                    if(options.match) headers = {"if-match":options.rev};
                    else headers = {"if-none-match":options.rev};
                    delete options.match;
                    delete options.rev;
                }
                if(!headers) return db['get'](path+'/'+id+optionsToUrl(options),callback);
                else return db['raw']({method:'GET',headers:headers},path+'/'+id+optionsToUrl(options),callback);
            }
        ),
        "put": params([{id:"string"},{data:"object"},{options:"object"},{callback:"function"}],
            function(id,data,options,callback) {
                var headers; 
                options ? options : {};
                /* use headers for rev matching */
                if(options.match !== undefined) {
                    options.rev = JSON.stringify(options.rev||id);
                    if(options.match) headers = {"if-match":options.rev};
                    else headers = {"if-none-match":options.rev};
                    delete options.match;
                    delete options.rev;
                }
                if(!headers) return db['put'](path+'/'+id+optionsToUrl(options),data,callback);
                else return db['raw']({method:'PUT',headers:headers},path+'/'+id+optionsToUrl(options),callback);
            }
        ),
        "patch": params([{id:"string"},{data:"object"},{options:"object"},{callback:"function"}],
            function(id,data,options,callback) {
                var headers;
                options = options ? options : {};

                if(options.match !== undefined) {
                    options.rev = JSON.stringify(options.rev||id);
                    if(options.match) headers = {"if-match":options.rev};
                    else headers = {"if-none-match":options.rev};
                    delete options.match;
                    delete options.rev;
                }
                if(!headers) return db['patch'](path+'/'+id+optionsToUrl(options),data,callback);
                else return db['raw']({method:'PATCH',headers:headers},path+'/'+id+optionsToUrl(options),callback);
            }
        ),
        "delete": params([{id:"string"},{options:"object"},{callback:"function"}],
            function(id,options,callback) {
                var headers;
                options = options ? options : {};

                if(options.match !== undefined) {
                    options.rev = JSON.stringify(options.rev||id);
                    if(options.match) headers = {"if-match":options.rev};
                    else headers = {"if-none-match":options.rev};
                    delete options.match;
                    delete options.rev;
                }
                if(!headers) return db['delete'](path+'/'+id+optionsToUrl(options),callback);
                else return db['raw']({method:'DELETE',headers:headers},path+'/'+id+optionsToUrl(options),callback);
            }
        ),
        "head": params([{id:"string"},{options:"object"},{callback:"function"}],
            function(id,options,callback) {
                var headers;
                options = options ? options : {};

                if(options.match !== undefined) {
                    options.rev = JSON.stringify(options.rev||id);
                    if(options.match) headers = {"if-match":options.rev};
                    else headers = {"if-none-match":options.rev};
                    delete options.match;
                    delete options.rev;
                }
                if(!headers) return db['head'](path+'/'+id+optionsToUrl(options),callback);
                else return db['raw']({method:'HEAD',headers:headers},path+'/'+id+optionsToUrl(options),callback);
            }    
        ),
        "list": params([{collection:"string"},{callback:"function"}], 
            function(collection,callback) {
                collection = collection ? collection : db.name;
                return db['get'](path+"?collection="+collection,callback);
            }
        )     
    };

    return DocumentAPI;
}    


module.exports = closure;

