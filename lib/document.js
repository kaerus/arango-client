var Document = function(connection){
  return {
    fetch: function(on_fetch) {
//    > curl --data @- -X PUT --dump - http://localhost:8529/_api/simple/first-example
// { "collection" : "666351134", "example" : [ "a.j", 1, "a.k", 1 ] }
      var clbk 
        , collection = connection.db
        , buf = ""
        , post_data = JSON.stringify({"collection": connection.db,
                      "example": ["name", "index.html"] })
        , params = {
          "method": "PUT",
          "path": "/_api/simple/first-example" + connection.db,
          "headers": {
            "Content-Type": "application/json",
            "Content-Length": post_data.length
          }
        };
        var req = connection.request(params, function(res){  
          res.on('data', function (data) {
            buf += data;
          }).on('end',function(){
            var retval = JSON.parse(buf);
            if(res.statusCode === 200) {
              on_fetch(retval.document ? retval.document : retval);
            } else {
              connection.emit("error",retval);
            }
          });
        }).on('error', function(err) {
            connection.emit('error',err);
        });
          
       req.write(post_data);   
       req.end();   

      return connection;
    }
  }
};

module.exports = Document;
