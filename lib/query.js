module.exports = function(db) { 
  var Query = function(){ 
    var AQL = ['for','in','filter','collect','into','sort','limit','return']
      , query = this;
      
    query.aql = {};
    query.string = {};
    
    query.__defineGetter__("string",function(){
      return this._string;
    });
  
    query.__defineSetter__("string",function(val){
      this._string = val;
      query.aql = null;
    });
    
    query.options = {};
    
    query.toString = function() {
      if(!query.aql) return query.string;
      
      return query.string = AQL.filter(function(q) {
        return query.aql[q] ? true : false;
      }).map(function(q){ 
        return q.toUpperCase() + ' ' + query.aql[q];
      }).join(' ');
    };
    
    AQL.forEach(function(q){
      this[q] = function(){
        if(!this.aql) this.aql = {};
        if(!arguments.length) return this.aql[q];
        var arg0 = arguments[0];
        if(typeof arg0 === 'object') this.aql[q] = JSON.stringify(arg0);
        else if(typeof arg0 === 'array') this.aql[q] = JSON.stringify(arg0);
        else this.aql[q] = arg0;
        
        return this;
      };
    }, query);
    
    query.count = function(num) {
      query.options.count = num > 0 ? true : false;
      query.options.batchSize = num > 0 ? num : undefined;
      
      return query;
    };
    
    query.test = function() {
      var aql = db.extend({query: query.toString()},query.options), i = 0;
      if(typeof arguments[i] === 'object') db.extend(aql,{bindVars: arguments[i++]});
      
      return db.cursor.query(aql,arguments[i]);
    };
    
    query.exec = function() {
      var aql = db.extend({query: query.toString()},query.options), i = 0;
      if(typeof arguments[i] === 'object') db.extend(aql,{bindVars: arguments[i++]});
      
      return db.cursor.create(db.extend(aql,query.options),arguments[i]);
    };
    
  };
  
  return new Query();
};