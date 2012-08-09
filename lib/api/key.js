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
    "get": function() {
      var collection = db.config.name, key, callback, i = 0;
      if(typeof arguments[i+1] === 'string') collection = arguments[i++];
      if(typeof arguments[i] === 'string') key = arguments[i++];
      if(typeof arguments[i] === 'function') callback = arguments[i++];
      return db.get(path+collection+'/'+key,callback);
    },
    "create": function() {
      var collection = db.config.name, key, options = {}, data = {}, callback, i = 0;
      if(typeof arguments[i+1] === 'string') collection = arguments[i++];
      if(typeof arguments[i] === 'string') key = arguments[i++];
      options = arguments[i++];
      data = arguments[i++];
      if(typeof arguments[i] === 'function') callback = arguments[i++];
    
      return setKey("POST",path+collection+'/'+key,options,data,callback);
    },
    "put": function() {
      var collection = db.config.name, key, options = {}, data = {}, callback, i = 0;
      if(typeof arguments[i+1] === 'string') collection = arguments[i++];
      if(typeof arguments[i] === 'string') key = arguments[i++];
      options = arguments[i++];
      data = arguments[i++];
      if(typeof arguments[i] === 'function') callback = arguments[i++];

      return setKey("PUT",path+collection+'/'+key+'?create=1',options,data,callback);
    },
    "list": function() {
      var collection = db.config.name, key, callback, i = 0;
      if(typeof arguments[i+1] === 'string') collection = arguments[i++];
      if(typeof arguments[i] === 'string') key = arguments[i++];
      if(typeof arguments[i] === 'function') callback = arguments[i++];
 
      return db.get(xpath+collection+'/'+key,callback);
    },
    "delete": function() {
      var collection = db.config.name, key, callback, i = 0;
      if(typeof arguments[i+1] === 'string') collection = arguments[i++];
      if(typeof arguments[i] === 'string') key = arguments[i++];
      if(typeof arguments[i] === 'function') callback = arguments[i++];
 
      return db.delete(path+collection+'/'+key,callback);
    }
  }
};