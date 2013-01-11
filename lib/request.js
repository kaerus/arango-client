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

if (typeof define !== 'function') { var define = require('amdefine')(module) }

define(function (require) {

    var utils = require('./utils'),
        Ajax = require('./ajax'),
        Promise = require('./promise');

    function transport(options,data,callback) {
        var promise = new Promise();

        var xhr = Ajax.request(options,function(res) {
            var response = {}, error;

            if(typeof res.data !== 'object') {
                res.data = [];
                res.on('data',function(data){
                    res.data.push(data);
                });
            }   

            res.on('end',function(){
                if(res.data.length > 0) {
                    try {  
                        response = JSON.parse(res.data.join(''));
                    } catch(e) {
                        response = res.data.join('');
                    } 
                }  

                if(response.error) {
                    error = {code: response.code, message: response.errorMessage};
                } else if(res.error) {
                    error = {code: res.statusCode, message: response.message};
                } else if(!res) {
                    error = {code: 500, message: "internal error"};
                }

                if(error) {
                    promise.reject(error);
                } else {
                    if(!response) response = {};

                    Object.defineProperty(response,'_status_',{
                        configurable: true,
                        value: res.statusCode
                    });
                    Object.defineProperty(response,'_headers_',{
                        configurable: true,
                        value: res.headers
                    });
                    promise.fulfill(response)
                }
            });
        }).on('error',function(error) { 
            promise.reject(error)
        });   

        if(data) xhr.write(data);
        xhr.end();              

        if(callback) {
            promise.then(function(response) {
                return callback(null,response);
            },function(err) {
                return callback(err.code,err.message);
            });
        }    

        return promise;
    }


    return function(db){ 

        function request(options,path,data,callback) { 
            /* try converting to Buffer to workaround issue with wrong json length */
            try {
                data = data && !data.length ? new Buffer(JSON.stringify(data)) : data;
            } catch(e) {
                data = JSON.stringify(data);  
            } 

            options = utils.extend(true,{
                "path" : path,
                "headers" : {"content-length": data ? data.length : 0 }
            }, db.server, options);

            /* include authorization */
            if(db.auth) options.headers['authorization'] = db.auth;

            return transport(options,data,callback);
        }


        return {  
            "post": function(path,data,callback) {
                return request({"method":"POST"},path,data,callback);
            },
            "get": function(path,callback) {
                return request({"method":"GET"}, path, null, callback );
            }, 
            "put": function(path,data,callback) {
                return request({"method":"PUT"},path,data,callback);
            },
            "delete": function(path,callback) {
                return request({"method":"DELETE"},path,null,callback);
            },
            "patch": function(path,data,callback) {
                return request({"method":"PATCH"},path,data,callback);
            },
            "head": function(path,callback) {
                return request({"method":"HEAD"},path,null,callback);
            },
            "raw": function(options,path,data,callback) {
                return request(options,path,data,callback);
            }
        }
    } 
});