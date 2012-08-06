var util = require('util');

module.exports = function(db) {
  function Aql(){
    var keywords = ['for','in','filter','from','include','collect','into','sort','limit','return']
      , aql = this;
        
    var toString = function() {    
      return keywords.filter(function(key) {
        return aql.struct[key] ? true : false;
      }).map(function(q){
        var keyword = q.toUpperCase();
        switch(keyword) {
          case 'FROM': keyword = 'IN'; break;
          case 'INCLUDE': keyword = ''; break;
          default: break;
        }
        if(typeof aql.struct[q] === 'object') 
          return keyword + '( ' + aql.struct[q].struct.toString() + ' )';
        else return keyword + ' ' + aql.struct[q];
      }).join(' ');
    };
    
    keywords.forEach(function(key){
      this[key] = function(){
        if(!this.struct) this.struct = {toString: toString};
        if(!arguments.length) return this.struct[key];
        if(typeof arguments[0] === 'function') {  
          this.struct[key] = arguments[0].apply(new Aql());
        } 
        else this.struct[key] = arguments[0];
        
        return this;
      };
    }, this);
    
  }
  
  function Query(){ 
    var query = this;
    Aql.call(this);
    
    this.string = {};
    this.new = function(){
      return new Aql();
    };
    
    this.__defineGetter__("string",function(){
      return query.struct ? query.struct.toString() : this._string;
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
    
    this.exec = function() {
    
      var on_next = function(res){
        this.next = function(callback) {
          return res.id ? db.cursor.get(res.id,callback).on('result',on_next) : false;
        }  
      };
      
      return exec_cursor("create",arguments).on('result', on_next);
    };
    /*
    this.next = function(callback) {
      return query.id ? db.cursor.get(query.id,callback) : false;
    }*/
    
  };
  util.inherits(Query,Aql);
  
  return new Query();
};