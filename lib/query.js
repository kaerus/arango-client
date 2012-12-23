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

var utils = require('./utils');

return function(db) {
  function Aql(){
    var keywords = ['for','in','filter','from','include','collect','into','sort','limit','let','return']
      , aql = this;
     
    keywords.forEach(function(key){
      aql[key] = function(){
        if(!aql.struct) aql.struct = {};
        if(!arguments.length) return aql.struct[key];
        var args = Array.prototype.slice.call(arguments);
        if(typeof args[0] === 'function') {
           aql.struct[key] = (function(func){
             var faql = new Aql();
             func.apply(faql);
              return faql.struct;
            })(args[0]);
        } else {
          if(key === 'filter' || key === 'let') {
            if(!aql.struct[key]) aql.struct[key] = [];
            aql.struct[key].push(args.join(' '));
          } else aql.struct[key] = args.join(' ');   
        }    
        return aql;
      }
    });
        
    function structToString(s) {
      var struct = s || aql.struct;
      return keywords.filter(function(key) {
        return struct[key] ? true : false;
      }).map(function(q){
        var keyword = q.toUpperCase(), value = struct[q];
        switch(keyword) {
          case 'FROM': keyword = 'IN'; break;
          case 'INCLUDE': keyword = ''; break;
          case 'FILTER': value = value.join(' && '); break;
          case 'LET': value = value.join(' LET '); break;
          default: break;
        }   
        if(typeof value === 'object') { 
          var nested = structToString(value);
          if( q === 'in' ) 
            return keyword + ' ( ' +  nested + ' )';
          else 
            return keyword + ' ' + nested;
        } else return keyword + ' ' + value;
      }).join(' ');
    }
    
    aql.toString = structToString;
  }
  
  function Query(){ 
    var query = this;
    
    Aql.call(this);

    query.new = function(){
      return new Aql();
    }
     
    Object.defineProperty(query,"string",{
      query: null,
      get: function(){
        if(query.struct) {
          this.query = query.toString();
          delete query.struct;
        }

        return this.query;
      },
      set: function(val) {
        this.query = val;
        delete query.struct;

        return this.query;
      }
    });

    query.options = {};
    
    query.count = function(num) {
      query.options.count = num > 0 ? true : false;
      query.options.batchSize = num > 0 ? num : undefined;
      
      return query;
    }
    
    function exec_cursor(method,args) {
      var q = {}, i = 0, a = Array.prototype.slice.call(args);

      /* use query object */
      if(a[i] instanceof Query) {
        q.query = a[i].toString();
        q.options = a[i].options;
        i++;
      } 
      /* use query string */
      else if(typeof a[i] === 'string') {
        q.query = a[i++];
        q.options = query.options;
      } else {
        q = {query: query.string, options: query.options};
      }  

      /* merge with object */
      if(typeof a[i] === 'object') {
        if(a[i].hasOwnProperty('bindVars'))
          utils.extend(true, q, a[i++])
        else q.bindVars = a[i++];
      }  

      return db.cursor[method](q,a[i]);
    }
    
    query.test = function() {
      return exec_cursor("query",arguments);
    }
    
    query.explain = function() {
      return exec_cursor("explain",arguments);
    }
    
    query.exec = function() { 
      var on_result = function(retval){
        var result = retval.result;
        
        if(result.hasMore) {
          result.next = function() {
            return db.cursor.get(result.id).then(on_result);
          }
        } else delete result.next;

        return result;
      } 

      return exec_cursor("create",arguments).then(on_result);
    }
    
  }
  
  utils.inherit(Query,Aql);
  
  return new Query();
};

});

