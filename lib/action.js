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

var utils = require('./utils');

return function(db) {
	var X = db.request;

	function Action() {

	}

	Action.prototype.define = function(method,url,options){
	    var that = this;

	    if(typeof method !== 'string' || typeof url !== 'string')
	        return false;

	    if(!(url = utils.parseUrl(url))) return false;

	    if(!options) options = {};
	    options.method = options.method ? options.method.toUpperCase() : 'GET';
	    options.protocol = url.protocol || 'http';
	    options.hostname = url.hostname || '127.0.0.1';
	    options.port = parseInt(url.port,10) || 80;  

	    function action() {
	      var args = Array.prototype.splice.call(arguments);
	      if(args[0] && typeof args[0] === 'object') utils.extend(true,options,args.shift());
	      args.unshift(url.path ? (url.path.string ? url.path.string : url.path) :'');
	      args.unshift(options); 
	      return X.raw.apply(that,args);
	    }

	    this[method] = action;

	    return this; 
	}

	return new Action();

}
});