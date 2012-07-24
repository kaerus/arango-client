
module.exports = function(db){
  self = this;
  
  function init(callback) {
    var path = "/_admin/user-manager/session";
    db.post(path,null,callback);
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
        if(db.config.user && db.config.user.length > 0) { 
         var path = "/_admin/user-manager/session/" + ret.sid + "/login"
            , data = {"user": db.config.user, 
                      "password": db.config.pass};  
          db.put(path,data,function(err,ret){
            if(!err) {
              db._sid = ret.sid;
              db._rights = ret.rights;
            } 
            callback.apply(this,arguments);
          });  
        } else callback(0,ret);
      });
    },
    logout: function(callback) {
      var path = "/_admin/user-manager/session/" + db._sid + "/logout";
      db.put(path,null,function(){
        db._sid = undefined;
        db._rights = undefined;
        callback.apply(this,arguments);
      });
    },
    users: function(callback) {
      var path = "/_admin/user-manager/users";
      db.get(path,callback);
    },
    /* TODO: redo when arangodb has fixed this API */
    createUser: function(role,user,pass,callback){
      var path = "/_admin/user-manager/user/" + user
        , password = hashPass(pass) 
        , data = {"role": role, 
                  "password": password};  
     db.post(path,data,callback);                      
    },
    changePassword: function(pass,callback) {
      var path = "/_admin/user-manager/session/" + db._sid + "/password"; 
      db.put(path,{password:hashPass(pass)},callback);
    } 
  }
};

