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
            
            Object.defineProperty(this,'_status',{
                enumerable: false,
                writable: true,
                value: null
            });
        }

        Promise.prototype.valueOf = function() {
            return this.resolved;
        }

        Promise.prototype.resolve = function(args) {
            if(!this._status) return;

            var self = this,
                fn = this._status > 0 ? this._onFullfilled : this._onRejected;

            if(typeof fn === 'function') {
                delete this.pending;
                try {
                    this.resolved = fn.apply(null,args);   
                } catch(e) {
                    if(this._status > 0)
                        this.rejected(e);
                    return;
                }

                if(this.resolved instanceof Promise) {
                    self._status = 0;
                    this.resolved.then(function(){
                        self.fullfilled.apply(self,arguments); 
                    }, function(){
                        self.rejected.apply(self,arguments);
                    });
                } else {
                    if(typeof this.resolved === 'undefined') 
                        this.resolved = args;
                } 
            }     
        }       

        Promise.prototype.then = function(onFullfilled,onRejected) {

            if(typeof onFullfilled === 'function') {
                Object.defineProperty(this,'_onFullfilled',{
                    enumerable: false,
                    value: onFullfilled
                });
            }    

            if(typeof onRejected === 'function') {
                Object.defineProperty(this,'_onRejected',{
                    enumerable: false,
                    value: onRejected
                });
            }    

            if(this._status === null) {
                this._status = 0;
            } else {
                if(this.pending) { 
                    this.resolve(this.pending);
                }
            }    

            return this;
        }

        Promise.prototype.fullfilled = function() {
            var self = this,
                args = Array.prototype.slice.call(arguments);

            if(this._status === null){ 
                this._status = 1;
                this.pending = args;
            } else if(this._status === 0) {
                this._status = 1;
                setImmediate(function(){
                    self.resolve(args);
                });
            } 

            return this;
        }

        Promise.prototype.rejected = function() {
            var self = this,
                args = Array.prototype.slice.call(arguments);

            if(this._status === null){ 
                this._status = -1;
                this.pending = args;
            } else if(this._status >= 0) {
                self._status = -1;
                setImmediate(function(){
                    self.resolve(args);
                });
            }

            return this;        
        }

        return Promise;
   });