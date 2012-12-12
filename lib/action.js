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

	function Action() {
		this._action = {};
	}

	Action.prototype.define = function(o){
	    var that = this;

	    if(typeof o !== 'object')
	        throw new Error("Missing action objective");

	    if(!o.name)
	    	throw new Error("Action name required");

	    if(!(o.url = utils.parseUrl(o.url))) 
	    	throw new URIError("not a valid url");

	    var options = {};

	    options.method = o.method ? o.method.toUpperCase() : 'GET';
	    options.protocol = o.url.protocol || 'http';
	    options.hostname = o.url.hostname || '127.0.0.1';
	    options.port = parseInt(o.url.port,10) || 80;  

	    function action() {
	      var args = Array.prototype.splice.call(arguments);

	      if(args[0] && typeof args[0] === 'object') 
	      	utils.extend(true,options,args.shift());

	      args.unshift(o.url.path ? (o.url.path.string ? o.url.path.string : o.url.path) :'');
	      args.unshift(options);

	      return X.raw.apply(that,args).then(o.result,o.error);
	    }

	    this._action[o.name] = action;

	    return this; 
	}

	Action.prototype.invoke = function(){
		var args = Array.prototype.slice.call(arguments),
			name = args.shift();

		return this._action[name].apply(null,args);
	}


	return new Action();
}
});