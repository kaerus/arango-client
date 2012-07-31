

module.exports = function(db){
  
  function init(callback) {
    var path = "/_admin/user-manager/session";
    db.post(path,null,callback);
  }
  
  return {
    login: function(callback) {               
      init(function(err,ret){
        if(err) callback(err,ret);
        if(db.config.user && db.config.user.length > 0) { 
         var path = "/_admin/user-manager/session/" + ret.sid + "/login"
            , data = {"user": db.config.user, 
                      "password": db.config.pass};  
          return db.put(path,data,function(err,ret){
            if(!err) {
              db._sid = ret.sid;
              db._rights = ret.rights;
            } 
            if(callback) callback.apply(this,arguments);
          });  
        } else if(callback) callback(0,ret);
      });
    },
    logout: function(callback) {
      var path = "/_admin/user-manager/session/" + db._sid + "/logout";
      return db.put(path,null,function(){
        db._sid = undefined;
        db._rights = undefined;
        callback.apply(this,arguments);
      });
    },
    users: function(callback) {
      var path = "/_admin/user-manager/users";
      return db.get(path,callback);
    },
    /* TODO: redo when arangodb has fixed this API */
    createUser: function(role,user,pass,callback){
      var path = "/_admin/user-manager/user/" + user
        , password = db.hashPass(pass) 
        , data = {"role": role, 
                  "password": password};  
     return db.post(path,data,callback);                      
    },
    changePass: function(word,callback) {
      var path = "/_admin/user-manager/session/" + db._sid + "/password"; 
      return db.put(path,{password:db.hashPass(word)},callback);
    } 
  }
};

