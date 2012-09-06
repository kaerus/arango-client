if (typeof define !== 'function') { var define = require('amdefine')(module) }
define(function (require) {

module.exports = function(db){
  var path = "/_api/cursor/";
  
  return {
    "get": function(id,callback) {
      return db.put(path+id,{},callback);
    },
    "create": function(data,callback) {
      return db.post(path,data,callback);
    },
    "query": function(data,callback) {
      return db.post("/_api/query",data,callback);
    },
    "explain": function(data,callback) {
      return db.post("/_api/explain",data,callback);
    },
    "delete": function(id,callback) {
      return db.delete(path+id,callback);
    }
  }
};

});