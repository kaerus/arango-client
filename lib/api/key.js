module.exports = function(db){
  var path = "/_api/key/"
    , xpath = "/_api/keys/";
  
  function setKey(method,path,options,data,callback){
      var headers = {};
      headers['x-voc-expires'] = new Date(Date.parse(options.expires)).toISOString();
      if(options.extended) headers['x-voc-extended'] = JSON.stringify(options.extended);
      return db.raw({"method":method,headers:headers},path,data,callback);
  }
  
  return {
    "get": function(collection,key,callback) {
      return db.get(path+collection+'/'+key,callback);
    },
    "create": function(collection,key,options,data,callback) {
      return setKey("POST",path+collection+'/'+key,options,data,callback);
    },
    "put": function(collection,key,options,data,callback) {
      var create = '?create=1';
      return setKey("PUT",path+collection+'/'+key+create,options,data,callback);
    },
    "list": function(collection,key,callback) {
      return db.get(xpath+collection+'/'+key,callback);
    },
    "delete": function(collection,key,callback) {
      return db.delete(path+collection+'/'+key,callback);
    }
  }
};