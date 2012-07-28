var Document = function(db){
  var path = "/_api/document/";
  
  return {
    "create": function(data,callback) {
      var xpath = "/_api/document?collection=" + db.config.name;
      return db.post(xpath,data,callback);
    },
    "create!": function(collection,data,callback) {
      var xpath = "/_api/document?collection=" + collection + "&createCollection=true";
      return db.post(xpath,data,callback);
    },
    "get": function(id,callback) {
      return db.get(path+id,callback);
    },
    "put": function(id,data,callback) {
      return db.put(path+id,data,callback);
    },
    "patch": function(id,data,callback) {
      return db.patch(path+id,data,callback);
    },
    "delete": function(id,callback) {
      return db.delete(path+id,callback);
    }
  }
};

module.exports = Document;
