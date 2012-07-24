var extend = require('node.extend')
  , util = require('util');

module.exports = function(connection){
  var self = this;
    function new_session(on_session) {
      var path = "/_admin/user-manager/session";
      return connection.request.post(path,null,function(res){
        self.session = res;
        on_session();
      });
    }

  return {
    login: function(on_login) {               
      return new_session(function(){
        var credentials = connection.config.credentials;
        if(credentials.user && credentials.user.length > 0) { 
         var path = "/_admin/user-manager/session/" + self.session.sid + "/login"
            , data = {"user": credentials.user, 
                      "password": credentials.pass};  
          return connection.request.put(path,data,function(res){
            self.session = extend({},self.session,res);
            on_login(self.session);
          });  
        } else on_login(self.session);
      });
    }
  }
};

