var extend = require('node.extend')
  , util = require('util');

module.exports = function(connection){
  self = this;
  
  function init(callback) {
    var path = "/_admin/user-manager/session";
    connection.post(path,null,callback);
  }
  
  function hashPass(word) {
    var crypto = require('crypto');
    return word.length > 0 ? crypto.createHash('sha256')
	            .update(word).digest('hex') : "";  
  }
  
  return {
    login: function(callback) {               
      init(function(err,ret){
        if(err) callback(err,ret);
        if(connection.config.user && connection.config.user.length > 0) { 
         var path = "/_admin/user-manager/session/" + ret.sid + "/login"
            , data = {"user": connection.config.user, 
                      "password": connection.config.pass};  
          connection.put(path,data,function(err,ret){
            if(!err) {
              connection._sid = ret.sid;
              connection._rights = ret.rights;
            } 
            callback.apply(this,arguments);
          });  
        } else callback(0,ret);
      });
    },
    logout: function(callback) {
      var path = "/_admin/user-manager/session/" + connection._sid + "/logout";
      connection.put(path,null,function(){
        connection._sid = undefined;
        connection._rights = undefined;
        callback.apply(this,arguments);
      });
    },
    users: function(callback) {
      var path = "/_admin/user-manager/users";
      connection.get(path,callback);
    },
    /* TODO: redo when arangodb has fixed this API */
    createUser: function(role,user,pass,callback){
      var path = "/_admin/user-manager/user/" + user
        , password = hashPass(pass) 
        , data = {"role": role, 
                  "password": password};  
     connection.post(path,data,callback);                      
    },
    changePassword: function(pass,callback) {
      var path = "/_admin/user-manager/session/" + connection._sid + "/password"; 
      connection.put(path,{password:hashPass(pass)},callback);
    } 
  }
};

