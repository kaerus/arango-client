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

function extend() {
  var deep = false, target, i = 0;
  if(typeof arguments[i] === "boolean") deep = arguments[i++];
  target = arguments[i++] || {};
  
  for(var source; source = arguments[i]; i++){    
    target = Object.keys(source).reduce(function(obj,key) {
      if(source.hasOwnProperty(key)) {  
        if(typeof source[key] === 'object') {
          if(deep) obj[key] = extend(true,obj[key],source[key]);
        } else if(source[key]) obj[key] = source[key];
      }    
      return obj;
    }, target);
    
  }
  
  return target;
};

/* Prototypal inheritance (from nodejs) */
function inherit(self, parent) {
  self.super_ = parent;
  self.prototype = Object.create(parent.prototype, {
    constructor: {
      value: self,
      enumerable: false,
      writable: true,
      configurable: true
    }
  });
}

function parseUrl(str) {
  var url = /^(?:([A-Za-z]+):)(\/{0,3})(?:([^\x00-\x1F\x7F:]+)?:?([^\x00-\x1F\x7F:]*)@)?([0-9.\-A-Za-z]+)(?::(\d+))?(?:\/([^\x00-\x1F\x7F]+))?$/
    , u = url.exec(str);
  if(!u) return false;
  var path = /^([\w\-]+)?(?:#([\w\-]+))?(?:\:([\w\-]+))?(?:\?(.*))?$/
    , p = u[7] ? path.exec(u[7]) : null;    
  return u ? {uriparts:u,
              protocol:u[1],
              username:u[3],
              password:u[4],
              hostname:u[5],
              port:u[6],
              path:p?{
                first:p[1],
                hash:p[2],
                base:p[3],
                query:p[4],
                string:u[7]
              }:u[7]} : false;   
}

function isArray(a) {
    return Object.prototype.toString.call(a) === '[object Array]'
}

return{ extend: extend, 
        inherit: inherit, 
        parseUrl: parseUrl,
        isArray: isArray }


});