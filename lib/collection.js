var Collection = function(db){
  var path = "/_api/collection/" + db.config.name;

  return {
    create: function(data,callback) {
      db.post(path,data,callback);
    },
    get: function(callback) {
      db.get(path,null,callback);   
    }
  }
};

module.exports = Collection;
