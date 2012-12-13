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
            this.submit = {};
        }

    // Defines an action */
    Action.prototype.define = function(o){
        var that = this;

        if(typeof o !== 'object')
            throw new Error("Action object unspecified");

        if(!o.name)
            throw new Error("Action name missing");

        if(!(o.url = utils.parseUrl(o.url))) 
            throw new URIError("Action url invalid");

        var options = {};

        /* setup xhr options */
        options.method = o.method ? o.method.toUpperCase() : 'GET';
        options.protocol = o.url.protocol ? o.url.protocol : db.server.protocol;
        options.hostname = o.url.hostname ? o.url.hostname : db.server.hostname;
        options.port = o.url.port ? parseInt(o.url.port,10) : db.server.port; 

        /* Pass through user defined xhr options                  */
        /* Note: options.timeout sets a request timeout in ms     */
        /* options.headers sets ajax headers such as content-type */
        if(o.options) utils.extend(true,options,o.options); 

        function action() {
            var args = Array.prototype.splice.call(arguments);

            /* insert path */
            args.unshift(o.url.path ? (o.url.path.string ? o.url.path.string : o.url.path) :'');
            /* and options */
            args.unshift(options);

            /* note: o.result, o.error are called whenever the promise has been fullfiled or rejected. */
            /* However callback passed as argument has precedence. Unspecified result/error handlers   */
            /* are ignored so that users can specify their own methods when invoking the action........*/
            /* options, path, data, callback */
            return X.raw.apply(that,args).then(o.result,o.error);
        }

        /* bind this action to a name */
        this.submit[o.name] = action;

        return this; 
    }

    /* Executes an action and returns a promise */
    Action.prototype.invoke = function(){
        var args = Array.prototype.slice.call(arguments),
            name = args.shift();

        /* calls action handler, returns a promise */
        return this.submit[name].apply(null,args);
    }

    return new Action();
}

});