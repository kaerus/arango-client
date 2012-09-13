if (typeof define !== 'function') { var define = require('amdefine')(module) }
define(function (require) {

return function(db){
  var path = "/_admin/";

  return {
  	"status": function(callback) {
  	  return db.get(path+"status",callback);	
  	},
    "log": function() {
   	  var serverity = "", callback, i = 0;
   	  if(typeof arguments[i] === 'string')
   	  	severity = "?level="+arguments[i++];
   	  if(typeof arguments[i] === 'object') {
   	  	Object.keys(arguments[i++]).forEach(function(param){
   	  		severity += severity.length ? '&' : '?';
   	  		severity += param+'='+arguments[i][param];
   	  	});
   	  }
   	  if(typeof arguments[i] === 'function')
   	  	callback = arguments[i++];		
      return db.get(path+"log"+severity,callback);   
    },
    "getConfig": function(callback) {
      return db.get(path+'config/configuration',callback);
    },
    "describeConfig": function(callback) {
      return db.get(path+'config/description',callback);
    },
    "listUsers": function(callback) {
      return db.get(path+'user-manager/users',callback);
    },
    "getUser": function(id,callback) {
      return db.get(path+'user-manager/user/'+id,callback);
    }
  };

}

});