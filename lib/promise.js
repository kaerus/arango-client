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

    if(typeof setImmediate !== 'function') {
        if(typeof process === 'function' && 
            typeof process.nextTick === 'function')
                setImmediate = process.nextTick;
        else setImmediate = setTimeout;
    }

    function Promise(){
        if(!(this instanceof Promise))
            return new Promise;
    }

    Promise.prototype.valueOf = function() {
        return this.resolved;
    }

    Promise.prototype.resolve = function(args) {
        if(!this.status) return;

        var promise = this.promise,
            fn = this.status > 0 ? this.onFullfilled : this.onRejected;

        if(!args) args = this.pending;
        
        delete this.pending;

        if(fn !== undefined) {
    
            try {
                this.resolved = fn.apply(null,args);  
            } catch(e) {
                if(this.status > 0) {
                    this.status = -1;
                    this.resolve([e]);
                } else promise.rejected(e);

                return;
            }

            if(this.resolved instanceof Promise) {
                this.resolved.then(function(){
                    promise.fullfilled.apply(promise,arguments); 
                }, function(){
                    promise.rejected.apply(promise,arguments);
                });

                return;
            } else {
                if(this.resolved === undefined) 
                    this.resolved = args;
                else if(Object.prototype.toString.call(this.resolved) !== '[object Array]')
                    this.resolved = [this.resolved];
            } 
        } else {
            this.resolved = args;
        }    

        /* forward promise */
        if(this.status > 0)
            promise.fullfilled.apply(promise,this.resolved);
        else 
            promise.rejected.apply(promise,this.resolved);
         
    }       

    Promise.prototype.then = function(onFullfilled,onRejected) {
        this.promise = new Promise();

        if(this.onFullfilled === undefined)
            this.onFullfilled = onFullfilled;

        if(this.onRejected === undefined)
            this.onRejected = onRejected;

        if(this.pending) this.resolve();
        else this.status = 0;   

        return this.promise;
    }

    Promise.prototype.fullfilled = function() {
        var self = this,
            args = Array.prototype.slice.call(arguments);

        if(this.status === undefined){ 
            this.status = 1;
            this.pending = args;
        } else if(this.status === 0) {
            this.status = 1;
            setImmediate(function(){
                self.resolve(args);
            });
        } 

        return this;
    }

    Promise.prototype.rejected = function() {
        var self = this,
            args = Array.prototype.slice.call(arguments);

        if(this.status === undefined){ 
            this.status = -1;
            this.pending = args;
        } else if(this.status === 0) {
            this.status = -1;
            setImmediate(function(){
                self.resolve(args);
            });
        }

        return this;        
    }

    return Promise;
});