var extend = require('node.extend')
  , util = require('util');

module.exports = function(connection){
  self = this;
  
  function init(on_session) {
    var path = "/_admin/user-manager/session";
    return connection.request.post(path,null,function(res){
        on_session(0,res);
    }).on('error',function(e){ 
      on_session(e.code,e.errorMessage); 
    });
  }
  
  function hashPass(word) {
    var crypto = require('crypto');
    return word.length > 0 ? crypto.createHash('sha256')
	            .update(word).digest('hex') : "";  
  }
  
  return {
    login: function(on_login) {               
      init(function(err,ret){
        if(err) on_login(err,ret);
        var credentials = connection.config;
        if(credentials.user && credentials.user.length > 0) { 
         var path = "/_admin/user-manager/session/" + ret.sid + "/login"
            , data = {"user": credentials.user, 
                      "password": credentials.pass};  
          connection.request.put(path,data,function(res){
            connection._sid = res.sid;
            connection._rights = res.rights;
            on_login(0,res);
          }).on('error',function(e){
            on_login(e.code,e.errorMessage);
          });  
        } else on_login(0,ret);
      });
    },
    logout: function(on_logout) {
     var path = "/_admin/user-manager/session/" + connection._sid + "/logout";
     connection.request.put(path,null,function(res){
      connection._sid = undefined;
      connection._rights = undefined;
      on_logout(0,res);
     }).on('error',function(e) {
        on_logout(e.code,e.errorMessage);
     });
    },
    users: function(on_users) {
      var path = "/_admin/user-manager/users";
      connection.request.get(path,function(res){
        on_users(0,res);
      }).on('error',function(e){
        on_users(e.code,e.errorMessage);
      });
    },
    /* TODO: redo when arangodb has fixed this API */
    createUser: function(role,user,pass,on_createUser){
      var path = "/_admin/user-manager/user/" + user
        , password = hashPass(pass) 
        , data = {"role": role, 
                  "password": password};  
     connection.request.post(path,data,function(res){
      on_createUser(0,res);
      console.log("createuser:",util.inspect(res) );
     }).on('error',function(e){ 
        on_createUser(e.code,e.errorMessage); 
      });                       
    },
    changePassword: function(pass,on_changePassword) {
      var path = "/_admin/user-manager/session/" + connection._sid + "/password";
      
      connection.request.put(path,{password:hashPass(pass)},function(res){
        on_changePassword(0,res);
      }).on('error',function(e){
        on_changePassword(e.code,e.errorMessage);
      });
    } 
  }
};

