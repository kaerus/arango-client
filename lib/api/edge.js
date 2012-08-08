module.exports = function(db){
  var path = "/_api/edge/"
    , xpath = "/_api/edge?collection="
    , ypath = "/_api/edges/";

  function getMatched(type,path,rev,callback){
    var headers = {};
    headers[type] = JSON.stringify(rev);
    return db.raw({headers:headers},path,null,callback);
  }
  
  function putMatched(type,path,rev,data,callback){
    var headers = {};
    headers[type] = JSON.stringify(rev);
    return db.raw({"method":"PUT",headers:headers},path,data,callback);
  }
  
  return {
    "get": function(id,callback) {
      return db.get(path+id,callback);
    },
    "getIfNoneMatch": function(id,rev,callback) {
      return getMatched("If-None-Match",path+id,rev,callback);
    },
    "getIfMatch": function(id,rev,callback) {
      return getMatched("If-Match",path+id,rev,callback);
    },
    "create": function() {
      var collection, from, to, data = {}, callback, i = 0;
      if(typeof arguments[i] === "string") collection = arguments[i++];
      if(typeof arguments[i] === "string") from = arguments[i++];
      if(typeof arguments[i] === "string") to = arguments[i++];
      if(typeof arguments[i] === "object") data = arguments[i++];
      if(typeof arguments[i] === "function") callback = arguments[i++];
      if(!to) {
        to = from;
        from = collection
        collection = db.config.name;  
      }
      return db.post(xpath+collection+'&from='+from+'&to='+to,data,callback);
    },
    "put": function(id,data,callback) {
      return db.put(path+id,data,callback);
    },
    "putIfNoneMatch": function(id,rev,data,callback) {
      return putMatched("if-none-match",path+id,rev,data,callback);
    },
    "putIfMatch": function(id,rev,data,callback) {
      return putMatched("if-match",path+id,rev,data,callback);
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
    "list": function() {
      var collection, vertex, direction, callback, i = 0;
      if(arguments.length > 0) {
        if(typeof arguments[i] === "string") collection = arguments[i++];
        if(typeof arguments[i] === "string") vertex = arguments[i++];
        if(typeof arguments[i] === "string") direction = arguments[i++];
        if(typeof arguments[i] === "function") callback = arguments[i++];
      }
      if(!direction) {
        direction = vertex || 'any';
        vertex = collection;
        collection = db.config.name;
      }
      var options = '?vertex='+vertex+'&direction='+direction;
      return db.get(ypath+collection+options,callback);
    }
  }
};