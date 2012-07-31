var Collection = function(db){
  var path = "/_api/collection/";
  
  return {
    "create": function() {
      var collection = db.config.name, data = {}, callback, i = 0;
      if(typeof arguments[i] === "string") collection = arguments[i++];
      if(typeof arguments[i] === "object") data = arguments[i++];
      if(typeof arguments[i] === "function") callback = arguments[i++];
      if(!data.name) data.name = collection;
      return db.post(path,data,callback);
    },
    "get": function(id,callback) {
      return db.get(path+id,callback);   
    },
    "delete": function(id,callback) {
      return db.delete(path+id,callback);
    },
    "truncate": function(id,callback) {
      return db.put(path+id+'/truncate',null,callback);
    },
    "count": function(id,callback) {
      return db.get(path+id+'/count',callback);
    },
    "figures": function(id,callback) {
      return db.get(path+id+'/figures',callback);
    },
    "list": function(callback) {
      return db.get(path,callback);
    },
    "load": function(id,callback) {
      return db.put(path+id+'/load',null,callback);
    },
    "unload": function(id,callback) {
      return db.put(path+id+'/unload',null,callback);
    },
    "rename": function(id,data,callback) {
      return db.put(path+id+'/rename',data,callback);
    },
    "getProperties": function(id,callback) {
      return db.get(path+id+'/properties',callback);
    },
    "setProperties": function(id,data,callback) {
      return db.put(path+id+'/properties',data,callback);
    }
    
  }
};

module.exports = Collection;
