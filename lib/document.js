var Document = function(db){
  var path = "/_api/document/";
  
  function getMatched(type,rev,path,callback){
    return db.raw({"headers":{type:rev}},path,null,callback);
  }
  
  function putMatched(type,rev,path,data,callback){
    return db.raw({"method":"PUT","headers":{type:rev}},path,data,callback);
  }
  
  return {
    "create": function(data,callback) {
      var xpath = "/_api/document?collection=" + db.config.name;
      return db.post(xpath,data,callback);
    },
    "create_": function(collection,data,callback) {
      var xpath = "/_api/document?collection=" + collection + "&createCollection=true";
      return db.post(xpath,data,callback);
    },
    "get": function(id,callback) {
      return db.get(path+id,callback);
    },
    "getIfNoneMatch": function(id,rev,callback) {
      return getMatched("if-none-match",rev,path+id,callback);
    },
    "getIfMatch": function(id,rev,callback) {
      return getMatched("if-match",rev,path+id,callback);
    },
    "put": function(id,data,callback) {
      return db.put(path+id,data,callback);
    },
     "putIfNoneMatch": function(id,rev,data,callback) {
      return putMatched("if-none-match",rev,path+id,data,callback);
    },
     "putIfMatch": function(id,rev,data,callback) {
      return putMatched("if-match",rev,path+id,data,callback);
    },
    "head": function(id,callback) {
      return db.head(path+id,callback);
    },
    "patch": function(id,data,callback) {
      return db.patch(path+id,data,callback);
    },
    "delete": function(id,callback) {
      return db.delete(path+id,callback);
    },
    "list": function(collection,callback) {
      var xpath = "/_api/document?collection=" + collection;
      return db.get(xpath,callback);
    }
  }
};

module.exports = Document;
