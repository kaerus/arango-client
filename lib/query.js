/*
 * Copyright (c) 2012 Kaerus, Anders Elo <anders @ kaerus com>.
 
 * Permission is hereby granted, free of charge, to any person obtaining a 
 * copy of this software and associated documentation files (the "Software"), 
 * to deal in the Software without restriction, including without limitation 
 * the rights to use, copy, modify, merge, publish, distribute, sublicense, 
 * and/or sell copies of the Software, and to permit persons to whom the 
 * Software is furnished to do so, subject to the following conditions:

 * The above copyright notice and this permission notice shall be included in 
 * all copies or substantial portions of the Software.

 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR 
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, 
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE 
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER 
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING 
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER 
 * DEALINGS IN THE SOFTWARE.
 */

if (typeof define !== 'function') { var define = require('amdefine')(module) }
define(function (require) {

var kore = require('./kore');

return function(db) {
  function Aql(){
    var keywords = ['for','in','filter','from','include','collect','into','sort','limit','return']
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
        } else aql.struct[key] = args.join(' ');  
        return aql;
      };
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
    };
    
    aql.toString = structToString;
  }
  
  function Query(){ 
    var query = this;
    
    Aql.call(this);

    query.string = {};

    query.new = function(){
      return new Aql();
    };
    
    Object.defineProperty(this,"string",{
      get: function () {
        return query.struct ? query.toString() : this._string;
      },
      set: function (val) {
        this._string = val;
        query.struct = null;
      }
    });
     
    query.options = {};
    
    query.count = function(num) {
      query.options.count = num > 0 ? true : false;
      query.options.batchSize = num > 0 ? num : undefined;
      
      return query;
    };
    
    function exec_cursor(method,args) {
      var cmd, i = 0, a = Array.prototype.slice.call(args);
      if(query.string)
        cmd = db.extend({query: query.string },query.options);
      else if(typeof a[i] === 'string')
        cmd = db.extend({query: a[i++]},query.options);
      else if(typeof a[i] === 'object' && a[i].struct)
        cmd = db.extend({query: a[i++].struct.toString()},query.options);
      else
        cmd = db.extend({query: a[i++].toString()},query.options);
      if(typeof a[i] === 'object') db.extend(cmd,{bindVars: a[i++]});
      
      return db.cursor[method](cmd,a[i]);
    }
    
    query.test = function() {
      return exec_cursor("query",arguments);
    };
    
    query.explain = function() {
      return exec_cursor("explain",arguments);
    };
    
    query.exec = function() {
    
      var on_next = function(res){
        this.next = function(callback) {
          return res.id ? db.cursor.get(res.id,callback).on('result',on_next) : false;
        }  
      };
      
      return exec_cursor("create",arguments).on('result', on_next);
    };
    
  };
  
  kore.inherit(Query,Aql);
  
  return new Query();
};

});

