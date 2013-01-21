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
        path = "/_admin/";

    function AdminAPI(){}

    AdminAPI.prototype = {
        "status": function(callback) {
            return db['get'](path+"status",callback);  
        },
        "log":params([{severity:"string"},{options:"object"},{callback:"function"}], 
            function(severity,options,callback) {
                serverity = severity ? "?level="+severity : "";

                Object.keys(options).forEach(function(param){
                    severity += severity.length ? '&' : '?';
                    severity += param+'='+options[param];
                });

                return db['get'](path+"log"+severity,callback);   
            }
        ),
        "getConfig": function(callback) {
            return db['get'](path+'config/configuration',callback);
        },
        "describeConfig": function(callback) {
            return db['get'](path+'config/description',callback);
        },
        "listUsers": function(callback) {
            return db['get'](path+'user-manager/users',callback);
        },
        "getUser": function(id,callback) {
            return db['get'](path+'user-manager/user/'+id,callback);
        },
        "routes": function(callback) {
            return db['get'](path+"routing/routes", callback);
        },
        "routesReload": function(callback){
            return db['get'](path+"routing/reload", callback);
        }
    };

    return new AdminAPI;
}

module.exports = closure;
