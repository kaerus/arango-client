module.exports = function(db) { 
  var Query = function(){ 
    var AQL = ['for','in','filter','collect','into','sort','limit','return']
      , query = this; 
    
    query.string = {}; 
    
    query.toString = function() {
      return AQL.filter(function(q) {
        return query.string[q] ? true: false;
      }).map(function(q){ 
        return q.toUpperCase() + ' ' + query.string[q];
      }).join(' ');
    };
    
    AQL.forEach(function(q){
      this[q] = function(){
        if(!arguments.length) return this.string[q];
        this.string[q] = arguments[0];
        return this;
      };
    }, query);
    
    query.test = function(callback) {
      return db.cursor.query({query: query.toString()},callback);
    };
    
    query.exec = function(callback) {
      return db.cursor.create({query: query.toString()},callback);
    };
    
  };
  
  return new Query();
};