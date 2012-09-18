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