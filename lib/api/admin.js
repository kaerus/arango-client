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

    /* snippet from ArangoDB */
    function encodePassword(password) {
        var salt, encoded;

        salt = db.crypto.SHA256("time:" + Date.now()).toString();
        salt = salt.substr(0,8);

        encoded = "$1$" + salt + "$" + db.crypto.SHA256(salt + password);
        return encoded;
    }

    var AdminAPI = {
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
        "getUser": function(user,callback) {
            return db.query
                .for('u')
                .in('_users')
                .filter('u.user == @username')
                .return('u')
                .exec({username:user}).then(function(u){
                    u = u[0];
                    if(!u) throw "user " + user + " not found";
                    return u;
                });   
        },
        "createUser": function(user,password,active,callback) {
            var data = {user:user,password:encodePassword(password),active:active||false};

            return db['post']('/_api/document?collection=_users',data,callback);
        },
        "updateUser": function(user,password,active,callback){
            return db.query
                .for('u')
                .in('_users')
                .filter('u.user == @username')
                .return('u')
                .exec({username:user}).then(function(u){
                    u = u[0];
                    if(!u) throw "user " + user + " not found";
                    return db.document.patch(u._id, {
                            password: password ? encodePassword(password) : u.password,
                            active: typeof active === 'boolean' ? active : u.active
                        },callback);
                });
        },
        "routes": function(callback) {
            return db['get'](path+"routing/routes", callback);
        },
        "routesReload": function(callback){
            return db['get'](path+"routing/reload", callback);
        },
        "modulesFlush": function(callback){
            return db['get'](path+"modules/flush", callback);
        }
    };

    return AdminAPI;
}

module.exports = closure;
