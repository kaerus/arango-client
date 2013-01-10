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

    function Emitter() {
        if(!(this instanceof Emitter)) {
            return new Emitter();
        }  

        Object.defineProperty(this,'_events',{
            enumerable: false,
            value: {}
        });
    }

    Emitter.prototype.on = function(event,handler) {
        /* create event handler array if non-existent */
        if(!(event in this._events)) {
            this._events[event] = [];
        } 

        /* event handler is unique */
        if(this._events[event].indexOf(handler) < 0) {
            this._events[event].push(handler);
        }

        return this;
    }

    Emitter.prototype.hasEvent = function(name) {
        return this._events.hasOwnProperty(name);
    }

    Emitter.prototype.off = function(event,handler) {
        if(this._events[event]) {
            if(!handler) {
                /* remove all handlers */
                delete this._events[event];
            } else {
                /* remove specific handler */
                var i = this._events[event].indexOf(handler);
      
                if (i >= 0) {
                    this._events[event].splice(i, 1);

                    /* remove event if empty */
                    if (this._events[event].length === 0) {
                        delete this._events[event];
                    }  
                }
            }
        }     

        return this;
    }

    Emitter.prototype.emit = function(event) {
        if(!this._events[event]) { 
            return false;
        } 
        var args = Array.prototype.slice.call(arguments,1),
            handler, after = [], stop = false;

        for (var i = 0, l = this._events[event].length; i < l; i++) {
            handler = this._events[event][i];
            if( typeof handler === 'function' ) {
                /* stop propagation on false */
                if( handler.apply(this,args) === false ) {
                    stop = true;
                    break;
                }
            } else if(typeof handler === 'object') {
                if(typeof handler.after === 'function') after.push(handler.after);
            } else throw "No valid event handler found";   
        }

        after.forEach(function(handler){
            if(!stop) {
                if(handler.apply(this,args) === false ) {
                    stop = true;
                }
            }  
        });  

        return this;
    }

    Emitter.prototype.once = function(event,handler) {
        var self = this;

        this.on(event, function h() {
            self.off(event, h);
            handler.apply(this, arguments);
        });

        return this;
    }


    Emitter.prototype.after = function(event,handler) {
        /* create event handler array if non-existent */
        if(!(event in this._events)) {
            this._events[event] = [];
        } 

        /* event handler is unique */
        if(this._events[event].indexOf({after:handler}) < 0) {
            this._events[event].push({after:handler});
        }

        return this;  
    }

    return Emitter;
});