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

var root;

try{root = global} catch(e){try {root = window} catch(e){root = this}};

var setImmediate = root.setImmediate;

if(!setImmediate){
    if(root.process && typeof root.process.nextTick === 'function') {
        setImmediate = root.process.nextTick;
    } else if (root.MessageChannel && typeof root.MessageChannel === "function") {
        var fifo = [], channel = new root.MessageChannel();
        channel.port1.onmessage = function () { fifo.shift()() };
        setImmediate = function (task){ fifo[fifo.length] = task; channel.port2.postMessage(); };
    } else if(root.setTimeout) {
        setImmediate = root.setTimeout;
    } else throw Error("No candidate for setImmediate");  
} 

var PROMISE = 0, FULFILLED = 1, REJECTED = 2;

function Promise(resolver) {

    if(!(this instanceof Promise))
        return new Promise(resolver);

    Object.defineProperty(this,'calls',{
        enumerable: false,
        writable: false,
        value: []
    });

    if(resolver){
        var resolve = Resolver.bind(this);

        if(typeof resolver !== 'function') 
            throw TypeError("Promise resolver must be a function");

        try {
            var value = resolver(resolve);
            if(value !== undefined) resolve.fulfill(value);
        } catch (error) {
            if(error instanceof Error)
                console.log("Resolver error:", error.stack||error);

            /* catched rejection */ 
            resolve.reject(error);
        }    

    }    
}

Resolver.call(Promise.prototype);

function Resolver(){
    var promised = this;

    this.resolve = function() {
        var then, promise, res,
            state = this.state,
            value = this.value;

        if(!state) return;

        while(then = this.calls.shift()) {
            promise = then[PROMISE];

            if((res = then[state]) != null) {
                if(typeof res === 'function') {
                    try {
                        value = res.call(promise,this.value);  
                    } catch(error) {
                        if(promise.catch) promise.catch(error,this.value);
                        else promise.reject(error); 

                        continue;   
                    }  

                    if(value instanceof Promise || (value && typeof value.then === 'function') )  {
                        /* assume value is thenable */
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
            } 

            promise.state = state;
            promise.value = value;
            promise.resolve();
        }
    }

    this.fulfill = function(value) {
        if(this.state) return;
 
        if(arguments.length > 1)
            value = [].slice.call(arguments);

        this.state = FULFILLED;
        this.value = value;

        this.resolve();
    }

    this.reject = function(reason) {
        if(this.state) return;

        this.state = REJECTED;
        this.value = reason;

        this.resolve();
    }

    if(arguments.length) {
        this.fulfill.apply(this,arguments);
    }   
}       

Promise.prototype.then = function(onFulfill,onReject) {
    var self = this, promise = new Promise();

    this.calls[this.calls.length] = [promise, onFulfill, onReject];

    if(this.state) {
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

Promise.prototype.attach = function(handle) {
    this.attached = handle;

    return this;
}


module.exports = Promise;