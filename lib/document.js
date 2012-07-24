var Document = function(db){
  return {
    fetch: function(on_fetch) {
//    > curl --data @- -X PUT --dump - http://localhost:8529/_api/simple/first-example
// { "collection" : "666351134", "example" : [ "a.j", 1, "a.k", 1 ] }
      var clbk 
        , collection = db.config.name
        , buf = ""
        , post_data = JSON.stringify({"collection": collection,
                      "example": ["name", "index.html"] })
        , params = {
          "method": "PUT",
          "path": "/_api/simple/first-example/" + collection,
          "headers": {
            "Content-Type": "application/json",
            "Content-Length": post_data.length
          }
        };
        var req = db.request(params, function(res){  
          res.on('data', function (data) {
            buf += data;
          }).on('end',function(){
            var retval = JSON.parse(buf);
            if(res.statusCode === 200) {
              on_fetch(retval.document ? retval.document : retval);
            } else {
              db.emit("error",retval);
            }
          });
        }).on('error', function(err) {
            db.emit('error',err);
        });
          
       req.write(post_data);   
       req.end();   

      return db;
    }
  }
};

module.exports = Document;
