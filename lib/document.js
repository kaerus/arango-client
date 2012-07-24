var Document = function(db){
 
  return {
    create: function(data,callback) {
      var path = "/_api/document?collection=" + db.config.name + "&createCollection=true";
      db.post(path,data,callback);
    },
    get: function(id,callback) {
      var path = "/_api/document/" + id;
      db.get(path,callback);
    },
    put: function(id,data,callback) {
       var path = "/_api/document/" + id;
       db.put(path,data,callback);
    },
    patch: function(id,data,callback) {
      var path = "/_api/document/" + id;
      db.patch(path,data,callback);
    },
    delete: function(id,callback) {
      var path = "/_api/document/" + id;
      db.delete(path,callback);
    }
  }
};

module.exports = Document;
