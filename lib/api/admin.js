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
  var X = db.request
    , path = "/_admin/";

  return {
  	"status": function(callback) {
  	  return X.get(path+"status",callback);	
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
      return X.get(path+"log"+severity,callback);   
    },
    "getConfig": function(callback) {
      return X.get(path+'config/configuration',callback);
    },
    "describeConfig": function(callback) {
      return X.get(path+'config/description',callback);
    },
    "listUsers": function(callback) {
      return X.get(path+'user-manager/users',callback);
    },
    "getUser": function(id,callback) {
      return X.get(path+'user-manager/user/'+id,callback);
    },
    "routes": function(callback) {
      return X.get(path+"routing/routes", callback);
    },
    "routesReload": function(callback){
      return X.get(path+"routing/reload", callback);
    }
  };

}

});