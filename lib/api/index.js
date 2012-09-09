if (typeof define !== 'function') { var define = require('amdefine')(module) }
define(function (require) {

return function(db){
  var path = "/_api/index/"
    , xpath = "/_api/index?collection=";
  
  return {
    "get": function(id,callback) {
      return db.get(path+id,callback);
    },
    "create": function() {
      var collection = db.config.name, data = {}, callback, i = 0;
      if(typeof arguments[i] === "string") collection = arguments[i++];
      if(typeof arguments[i] === "object") data = arguments[i++];
      if(typeof arguments[i] === "function") callback = arguments[i++];
      return db.post(xpath+collection,data,callback);
    },
    "delete": function(id,callback) {
      return db.delete(path+id,callback);
    },
    "list": function() {
      var collection = db.config.name, callback, i = 0;
      if(arguments.length > 0) {
        if(typeof arguments[i] === "string") collection = arguments[i++];
        if(typeof arguments[i] === "function") callback = arguments[i++];
      }
      return db.get(xpath+collection,callback);
    }
  }
};

});