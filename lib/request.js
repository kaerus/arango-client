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

var BROWSER = (typeof window === 'object'),
    Promise = require('./promise'),
    utils = require('./utils'), 
    Ajax = {};

/* Bring in Xhr support for nodejs or browser */
if(!BROWSER) {
    Ajax.request = function(options,callback) {
        var request = (require)(options.protocol).request;
  
        delete options.protocol;

        if(options.timeout) {
            request.socket.setTimeout(options.timeout);
            delete options.timeout;
        }

        return request(options,callback);    
    }
} else Ajax = require('./ajax');   


function transport(options,data,callback) {
    var promise = new Promise();

    var xhr = Ajax.request(options,function(res) {
        var response = {}, error;

        if(typeof res.data !== 'object') {
            res.data = [];
            res.on('data',function(data){
                res.data[res.data.length] = data;
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
            } else if(res.statusCode > 399) {
                error = {code: res.statusCode, message: res.statusText};
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

function request(db,options,path,data,callback) { 
    if(typeof options === 'string')
        options = {method:options.toUpperCase()};

    /* no data on these */
    switch(options.method){
        case "GET":
        case "DELETE":
        case "HEAD":
            data = null;    
            break;
    }

    try {
         /* convert to Buffer to workaround issue with wrong json length */
        data = data && !data.length ? new Buffer(JSON.stringify(data)) : data;
    } catch(e) {
        data = JSON.stringify(data);  
    } 

    options = utils.extend(true,{
        "path" : path,
        "headers" : {"content-length": data ? data.length : 0 }
    }, db.server, options);

    return transport(options,data,callback);
}

module.exports = request;        
