/*
 * Copyright (c) 2012 Kaerus, Anders Elo <anders @ kaerus com>.
 
 * Permission is hereby granted, free of charge, to any person obtaining a 
 * copy of this software and associated documentation files (the "Software"), 
 * to deal in the Software without restriction, including without limitation 
 * the rights to use, copy, modify, merge, publish, distribute, sublicense, 
 * and/or sell copies of the Software, and to permit persons to whom the 
 * Software is furnished to do so, subject to the following conditions:
 
 * The above copyright notice and this permission notice shall be included in 
 * all copies or substantial portions of the Software.
 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR 
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, 
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE 
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER 
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING 
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER 
 * DEALINGS IN THE SOFTWARE.
 */

if (typeof define !== 'function') { var define = require('amdefine')(module) }
define(function (require) {

return function(db){
  
  function init(callback) {
    var path = "_admin/user-manager/session";
    db.post(path,null,callback);
  }
  
  return {
    login: function(callback) {               
      init(function(err,ret){
        if(err) callback(err,ret);
        if(db.config.user && db.config.user.length > 0) { 
         var path = "_admin/user-manager/session/" + ret.sid + "/login"
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
      var path = "_admin/user-manager/session/" + db._sid + "/logout";
      return db.put(path,null,function(){
        db._sid = undefined;
        db._rights = undefined;
        callback.apply(this,arguments);
      });
    },
    users: function(callback) {
      var path = "_admin/user-manager/users";
      return db.get(path,callback);
    },
    /* TODO: redo when arangodb has fixed this API */
    createUser: function(role,user,pass,callback){
      var path = "_admin/user-manager/user/" + user
        , password = db.hashPass(pass) 
        , data = {"role": role, 
                  "password": password};  
     return db.post(path,data,callback);                      
    },
    changePass: function(word,callback) {
      var path = "_admin/user-manager/session/" + db._sid + "/password"; 
      return db.put(path,{password:db.hashPass(word)},callback);
    } 
  }
};

});
