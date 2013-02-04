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

"use strict"

var setImmediate = (function(root){
    if(!root.setImmediate || typeof root.setImmediate !== 'function') {
        if(root.process && typeof root.process.nextTick === 'function') {
            return root.process.nextTick;
        } else if (root.MessageChannel && typeof root.MessageChannel === "function") {
            var fifo = [], channel = new root.MessageChannel();
            channel.port1.onmessage = function () { fifo.shift()() };
            return function (task){ fifo[fifo.length] = task; channel.port2.postMessage(); };
        } else {
            return root.setTimeout;
        }    
    } else return root.setImmediate;
}(this));

var PROMISE = 0, FULFILLED = 1, REJECTED = 2;

function Promise() {
    if(!(this instanceof Promise))
        return new Promise;
}

Promise.prototype.resolve = function() {
    var then, promise,
        state = this.state,
        value = this.resolved;  

    while(then = this.calls.shift()) {
        promise = then[PROMISE];

        if(then[this.state] !== undefined) {
            if(typeof then[this.state] === 'function') {
                try {
                    value = then[this.state](this.resolved);  
                } catch(e) {
                    promise.reject(e); 

                    continue;   
                }
            } else value = then[this.state];    

            if(value instanceof Promise || (value && value.then) )  {
                value.then(function(v){
                    promise.fulfill(v); 
                }, function(r){
                    promise.reject(r);
                });

                continue;
            } else {
                state = FULFILLED;
            }  
        }
        promise.state = state;
        promise.resolved = value;
        if(promise.calls) promise.resolve();
    }
}       

Promise.prototype.then = function(onFulfill,onReject) {
    var self = this, promise = new Promise();

    if(!this.calls) this.calls = [];   

    this.calls[this.calls.length] = [promise, onFulfill, onReject];

    if(this.resolved) {
        setImmediate(function(){
            self.resolve();
        });
    }    

    return promise;
}

Promise.prototype.spread = function(onFulfill,onReject) {

    function spreadFulfill(value) {
        if(!Array.isArray(value)) 
            value = [value];

        return onFulfill.apply(null,value);
    }   

    return this.then(spreadFulfill,onReject);
}

Promise.prototype.include = function(value) {
    var self = this, promise = new Promise();

    if(!this.calls) this.calls = [];

    function includeFulfill(resolved) {
        if(typeof value === 'function') value = value(resolved);

        if(value instanceof Promise || (value && value.then)) {
            value.then(function(newValue){
                promise.fulfill([resolved,newValue]);
            },function(reason){
                promise.reject(reason);
            });
        } else {
            promise.fulfill([resolved,value]);
        }    
    }

    this.calls[this.calls.length] = [this, includeFulfill]

    if(this.resolved) {
        setImmediate(function(){
            self.resolve();
        });
    }

    return promise;
}

Promise.prototype.fulfill = function(value) {
    if(this.state) return;
    /* Constructs an array of fulfillment values */
    /* if more than one argument was provided... */
    if(arguments.length > 1) 
        value = [].slice.call(arguments);

    this.state = FULFILLED;
    this.resolved = value;

    if(this.calls) this.resolve();

    return this;
}

Promise.prototype.reject = function(reason) {
    if(this.state) return;

    this.state = REJECTED;
    this.resolved = reason;

    if(this.calls) this.resolve();   

    return this;        
}


module.exports = Promise;