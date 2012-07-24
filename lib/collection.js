var Collection = function(connection){
  var path = "/_api/collection/" + connection.config.collection;
  return {
    create: function(data,on_ret) {
      connection.request.post(path,data,on_ret);
      return connection;
    },
    get: function(on_ret) {
      connection.request.get(path,null,on_ret);   
      return connection;
    }
  }
};

module.exports = Collection;
