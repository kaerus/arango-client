if (typeof define !== 'function') { var define = require('amdefine')(module) }
define(function (require) {

return function(db) {
  function Aql(){
    var keywords = ['for','in','filter','from','include','collect','into','sort','limit','return']
      , aql = this;
        
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
    
    this.toString = structToString;
    
    keywords.forEach(function(key){
      this[key] = function(){
        if(!this.struct) this.struct = {};
        if(!arguments.length) return this.struct[key];
        var args = Array.prototype.slice.call(arguments);
        if(typeof args[0] === 'function') {
           this.struct[key] = (function(func){
             var aql = new Aql();
             func.apply(aql);
              return aql.struct;
            })(args[0]);
        } else this.struct[key] = args.join(' ');  
        return this;
      };
    }, this);
  }
  
  function Query(){ 
    var query = this;
    
    this.string = {};
    this.new = function(){
      return new Aql();
    };
    
    this.__defineGetter__("string",function(){
      return query.struct ? query.toString() : this._string;
    });
  
    this.__defineSetter__("string",function(val){
      this._string = val;
      query.struct = null;
    });
     
    this.options = {};
    
    this.count = function(num) {
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
    
    this.test = function() {
      return exec_cursor("query",arguments);
    };
    
    this.explain = function() {
      return exec_cursor("explain",arguments);
    };
    
    this.exec = function() {
    
      var on_next = function(res){
        this.next = function(callback) {
          return res.id ? db.cursor.get(res.id,callback).on('result',on_next) : false;
        }  
      };
      
      return exec_cursor("create",arguments).on('result', on_next);
    };
    
  };
  
  Query.prototype = new Aql();
  
  return new Query();
};

});

