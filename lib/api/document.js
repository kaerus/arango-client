if (typeof define !== 'function') { var define = require('amdefine')(module) }
define(function (require) {

return function(db){
  var path = "/_api/document/";
  var xpath = "/_api/document?collection=";
  
  function getMatched(type,path,rev,callback){
    var headers = {};
    headers[type] = JSON.stringify(rev);
    return db.raw({headers:headers},path,null,callback);
  }
  
  function putMatched(type,path,rev,data,callback){
    var headers = {};
    headers[type] = JSON.stringify(rev);;
    return db.raw({"method":"PUT",headers:headers},path,data,callback);
  }
  
  return {
    "create": function() {
      var collection = db.config.name, data = {}, options = "", callback, i = 0;
      if(typeof arguments[i] === "boolean"){ 
        options = "&createCollection=true";
        i++;
      } 
      if(typeof arguments[i] === "string") collection = arguments[i++];
      if(typeof arguments[i] === "object") data = arguments[i++];
      if(typeof arguments[i] === "function") callback = arguments[i++];
      return db.post(xpath+collection+options,data,callback);
    },
    "create_": function() {
      var collection = db.config.name, data = {}, callback, i = 0;
      if(typeof arguments[i] === "string") collection = arguments[i++];
      if(typeof arguments[i] === "object") data = arguments[i++];
      if(typeof arguments[i] === "function") callback = arguments[i++];      
      return db.post(xpath+collection+"&createCollection=true",data,callback);
    },
    "get": function(id,callback) {
      return db.get(path+id,callback);
    },
    "getIfNoneMatch": function(id,rev,callback) {
      return getMatched("If-None-Match",path+id,rev,callback);
    },
    "getIfMatch": function(id,rev,callback) {
      return getMatched("If-Match",path+id,rev,callback);
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
      var collection = db.config.name, callback, i = 0;
      if(typeof arguments[i] === "string") collection = arguments[i++];
      if(typeof arguments[i] === "function") callback = arguments[i++];
      return db.get(xpath+collection,callback);
    }
  }
};

});
