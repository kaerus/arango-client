var Collection = function(connection){
  return {
    fetch: function(on_fetch) {
      //> curl -X GET --dump - http://localhost:8529/_api/collection
      var clbk 
        , collection = connection.db
        , buf = ""
        , params = {
          "method": "GET",
          "path": "/_api/collection/" + connection.name,
          "headers": {
            "Content-Type": "application/json",
            "Content-Length": 0
          }
        };
        var req = connection.request(params, function(res){  
          res.on('data', function (data) {
            buf += data;
          }).on('end',function(){
            var retval = JSON.parse(buf);
            if(res.statusCode === 200) {
              on_fetch(retval);
            } else {
              connections.emit("error",retval);
            }
          });
        }).on('error', function(err) {
            connection.emit('error',err);
        });
          
       req.end();   
      return connection;
    }
  }
};

module.exports = Collection;
