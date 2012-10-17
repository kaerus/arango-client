/* 
 * Copyright (c) 2012 Kaerus (kaerus.com), Anders Elo <anders @ kaerus com>.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
 
if (typeof define !== 'function') { var define = require('amdefine')(module) }
define(function (require) {

return function(db){
  
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

});
