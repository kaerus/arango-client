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
            channel.port1.onmessage = function () { fifo.shift()() };
            setImmediate = function (task) { fifo.push(task); channel.port2.postMessage(); };
        } else {
            setImmediate = setTimeout;
        }    
    }

    var PROMISE = 0, FULFILLED = 1, REJECTED = 2;

    function Promise() {
        if(!(this instanceof Promise))
            return new Promise;
    }

    Promise.prototype.resolve = function() {
        var then, value, promise, state = this.state;  

        while(then = this.on.shift()) {
            promise = then[PROMISE];

            if(typeof then[this.state] === 'function') {
                try {
                    value = then[this.state].apply(null,this.resolved);  
                } catch(e) {
                    promise.reject(e); 

                    continue;   
                }

                if(value instanceof Promise || (value && value.then) )  {
                    value.then(function(){
                        promise.fulfill.apply(promise,arguments); 
                    }, function(x){
                        promise.reject.apply(promise,arguments);
                    });

                    continue;
                } else if(value !== undefined) {
                    this.resolved = [value]; 
                    /* return value fulfills promise */
                    state = FULFILLED;
                }   
            }
            promise.state = state;
            promise.resolved = this.resolved;
            if(promise.on) promise.resolve();
        }
    }       

    Promise.prototype.then = function(onFulfill,onReject) {
        var self = this, promise = new Promise();

        if(!this.on) this.on = [];

        this.on.push([promise, onFulfill, onReject]);

        if(this.resolved) {
            setImmediate(function(){
                self.resolve();
            });
        }  

        return promise;
    }

    Promise.prototype.fulfill = function() {
        if(this.state) return;

        this.state = FULFILLED;
        this.resolved = arguments;

        if(this.on) this.resolve();

        return this;
    }

    Promise.prototype.reject = function(reason) {
        if(this.state) return;

        this.state = REJECTED;
        this.resolved = arguments;

        if(this.on) this.resolve();   

        return this;        
    }

    return Promise;
});