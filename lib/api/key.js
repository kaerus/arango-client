if (typeof define !== 'function') { var define = require('amdefine')(module) }
define(function (require) {

return function(db){
  var path = "/_api/key/"
    , xpath = "/_api/keys/";
  
  function setKey(method,path,options,data,callback){
      var headers = {}, expiry;
      if(options.expires === 'object') expiry = options.expires;
      else expiry = new Date(Date.parse(options.expires,"yyyy-MM-dd HH:MM:SS"));
      
      headers['x-voc-expires'] = expiry.toISOString();
      if(options.extended) headers['x-voc-extended'] = JSON.stringify(options.extended);
      return db.raw({"method":method,headers:headers},path,data,callback);
  }
  function stripKey(key) {
    return key.replace(/^[.\/]*/,'');
  }
  
  return {
    "get": function() {
      var collection = db.config.name, key, callback, i = 0;
      if(typeof arguments[i+1] === 'string') collection = arguments[i++];
      if(typeof arguments[i] === 'string') key = arguments[i++];
      if(typeof arguments[i] === 'function') callback = arguments[i++];
      return db.get(path+collection+'/'+stripKey(key),callback);
    },
    "create": function() {
      var collection = db.config.name, key, options = {}, data = {}, callback, i = 0;
      if(typeof arguments[i+1] === 'string') collection = arguments[i++];
      if(typeof arguments[i] === 'string') key = arguments[i++];
      options = arguments[i++];
      data = arguments[i++];
      if(typeof arguments[i] === 'function') callback = arguments[i++];
    
      return setKey("POST",path+collection+'/'+stripKey(key),options,data,callback);
    },
    "put": function() {
      var collection = db.config.name, key, options = {}, data = {}, callback, i = 0;
      if(typeof arguments[i+1] === 'string') collection = arguments[i++];
      if(typeof arguments[i] === 'string') key = arguments[i++];
      options = arguments[i++];
      data = arguments[i++];
      if(typeof arguments[i] === 'function') callback = arguments[i++];

      return setKey("PUT",path+collection+'/'+stripKey(key)+'?create=1',options,data,callback);
    },
    "list": function() {
      var collection = db.config.name, key, callback, i = 0;
      if(typeof arguments[i+1] === 'string') collection = arguments[i++];
      if(typeof arguments[i] === 'string') key = arguments[i++];
      if(typeof arguments[i] === 'function') callback = arguments[i++];
 
      return db.get(xpath+collection+'/'+stripKey(key),callback);
    },
    "delete": function() {
      var collection = db.config.name, key, callback, i = 0;
      if(typeof arguments[i+1] === 'string') collection = arguments[i++];
      if(typeof arguments[i] === 'string') key = arguments[i++];
      if(typeof arguments[i] === 'function') callback = arguments[i++];
 
      return db.delete(path+collection+'/'+stripKey(key),callback);
    }
  }
};

});