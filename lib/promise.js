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
        if(typeof process !== 'undefined' && process && typeof process.nextTick === 'function') {
                setImmediate = process.nextTick;
        } else if (typeof MessageChannel !== "undefined") {
            var fifo = [], channel = new MessageChannel();
            channel.port1.onmessage = function () {
                var task = fifo.shift();
                if(task) task();
            };
            setImmediate = function (task) {
                fifo.push(task);
                channel.port2.postMessage();
            };
        } else {
            setImmediate = setTimeout;
        }    
    }

    function Promise(){
        if(!(this instanceof Promise))
            return new Promise;
    }

    Promise.prototype.valueOf = function(n) {
        return this.isFulfilled ? (n ? this.resolved[n] : this.resolved) : undefined; 
    }

    Promise.prototype.resolve = function(args) {
        if(!this.isWaiting) return;

        var promise = this.promise,
            fn = this.isFulfilled ? this.onFulfilled : this.onRejected;

        this.isWaiting = false;

        if(!args) args = this.resolved;

        if(fn !== undefined) {
            try {
                this.resolved = fn.apply(null,args);  
            } catch(e) {
                promise.rejected(e);    

                return;
            }

            if(this.resolved instanceof Promise) {
                this.resolved.then(function(){
                    promise.fulfilled.apply(promise,arguments); 
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

        this.onFulfilled = this.onRejected = undefined;

        /* forward promise */
        if(this.isFulfilled)
            promise.fulfilled.apply(promise,this.resolved);
        else 
            promise.rejected.apply(promise,this.resolved);
         
    }       

    Promise.prototype.then = function(onFulfilled,onRejected) {
        var self = this;

        this.promise = new Promise();

        if(this.onFulfilled === undefined && typeof onFulfilled === 'function')
            this.onFulfilled = onFulFilled;

        if(this.onRejected === undefined && typeof onRejected === 'function')
            this.onRejected = onRejected;

        if(this.resolved) {
            setImmediate(function(){
                self.resolve();
            });
        } else this.isWaiting = true;   

        return this.promise;
    }

    Promise.prototype.fulfilled = function() {
        var self = this,
            args = Array.prototype.slice.call(arguments);

        this.isFulfilled = true;

        if(this.isWaiting === undefined){ 
            this.resolved = args;
        } else if(this.isWaiting === true) {
            setImmediate(function(){
                self.resolve(args);
            });
        } 

        return this;
    }

    Promise.prototype.rejected = function() {
        var self = this,
            args = Array.prototype.slice.call(arguments);

        this.isRejected = true;

        if(this.isWaiting === undefined){ 
            this.resolved = args;
        } else if(this.isWaiting === true) {
            setImmediate(function(){
                self.resolve(args);
            });
        }

        return this;        
    }

    return Promise;
});