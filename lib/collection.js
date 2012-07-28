var Collection = function(db){
  var path = "/_api/collection/";

  return {
    "create": function(data,callback) {
      return db.post(path,data,callback);
    },
    "get": function(id,callback) {
      return db.get(path+id,callback);   
    },
    "delete": function(id,callback) {
      return db.delete(path+id,callback);
    }
  }
};

module.exports = Collection;
