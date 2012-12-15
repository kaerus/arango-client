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

        if(typeof setImmediate !== 'function') {
            if(typeof process === 'function' && 
                typeof process.nextTick === 'function')
                    setImmediate = process.nextTick;
            else setImmediate = setTimeout;
        }

        function Promise(){
            if(!(this instanceof Promise))
                return new Promise.apply(null,arguments);

            utils.Emitter.call(this);
        }

        utils.inherit(Promise,utils.Emitter);

        Promise.prototype.valueOf = function() {
            return this.resolved;
        }

        Promise.prototype.then = function(onFullfilled,onRejected) {
            var self = this, 
                promise = new Promise;


            function resolve(args) {
                self.off('rejected');
                     
                if(typeof onFullfilled !== 'function') {
                    promise.pending = {resolved: args};
                } else try {
                    self.resolved = onFullfilled.apply(null,args);
                    delete self.pending;
               
                    if(self.resolved instanceof Promise) {
                        self.resolved.then(function(){
                            promise.resolve.apply(null,arguments); 
                        }, function(){
                            promise.reject.apply(null,arguments);
                        });
                    } else {
                        if(typeof self.resolved === 'undefined') 
                            self.resolved = args[0];

                        promise.resolve(self.resolved);
                    }    
                } catch(e) {
                    self.reject(e);
                }    
            }

            function reject(args) {
                self.off('resolved');

                if(typeof onRejected !== 'function') {
                    promise.pending = {rejected: args};
                } else try {
                    self.rejected = onRejected.apply(null,args);
                    delete self.pending;
                    if(self.rejected instanceof Promise) {
                        self.rejected.then(function(){
                            promise.resolve.apply(null,arguments);
                        }, function(){
                            promise.reject.apply(null,arguments);
                        });
                    } else {
                        if(typeof self.rejected === 'undefined')
                            self.rejected = args[0];

                        delete self.pending;
                        promise.reject(self.rejected);
                    }    
                } catch(e) {
                    self.rejected = e;
                    promise.reject(e);    
                }
            }

            this.once('resolved',resolve);
            this.once('rejected',reject); 

            /* handle pending resolutions immediately */
            if(self.pending){ 
                if(self.pending.hasOwnProperty('resolved'))
                    this.emit('resolved',self.pending.resolved);
                else if(self.pending.hasOwnProperty('rejected')) 
                    this.emit('rejected',self.pending.rejected);
            }

            return promise;
        }

        Promise.prototype.resolve = function() {
            var self = this,
                args = Array.prototype.slice.call(arguments);

            if(self.hasEvent('resolved')) {
                setImmediate(function(){
                    self.emit('resolved',args);
                });
            } else { 
                self.pending = {resolved: args};
            }
                
            return this;
        }

        Promise.prototype.reject = function() {
            var self = this,
                args = Array.prototype.slice.call(arguments);

            if(self.hasEvent('rejected')) { 
                setImmediate(function(){
                    self.emit('rejected',args);
                });
            } else {
                self.pending = {rejected: args};
            }        

            return this;
        }

        return Promise;
   });