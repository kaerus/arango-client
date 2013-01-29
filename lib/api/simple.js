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

    var path = "/_api/simple/";

    function SimpleAPI(){}

    function applyOptions(o,data,attributes) {
        if(typeof attributes === 'object') {
            Object.keys(attributes).forEach(function(option){
                switch(option){
                    case 'from': data.left = attributes[option];
                        data.closed = true;
                        break;
                    case 'to': data.right = attributes[option];
                        data.closed = true;
                        break;
                    default:
                        data[option] = attributes[option];
                        break;          
                }   
                /* apply skip/limit preferences */
                if(o._skip && !data.skip) data.skip = o._skip;
                if(o._limit && !data.limit) data.limit = o._limit;
            });
        }

        return data;
    }

    SimpleAPI.prototype = {
        "list": function(attributes,callback) {
            var data = {collection: db.name};
            return db['put'](path+'all',applyOptions(this,data,attributes),callback);
        },
        "example": function(example,attributes,callback) {
            var data = {collection: db.name, example:example};
            return db['put'](path+'by-example',applyOptions(this,data,attributes),callback);
        },
        "first": function(example,callback) {
            var data = {collection: db.name, example:example};
            return db['put'](path+'first-example',data,callback);    
        },
        "range": function(attributes,callback) {
            var data = {collection: db.name};
            return db['put'](path+'range',applyOptions(this,data,attributes),callback);
        },
        "near": function(attributes,callback) {
            var data = {collection: db.name};
            return db['put'](path+'near',applyOptions(this,data,attributes),callback);
        },
        "within": function(attributes,callback) {
            var data = {collection: db.name};
            return db['put'](path+'within',applyOptions(this,data,attributes),callback);
        },
        "skip": function(val) {
            this._skip = val;
        },
        "limit": function(val) {
            this._limit = val;
        }
    };

    return new SimpleAPI;
}

module.exports = closure;
