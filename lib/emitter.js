if (typeof define !== 'function') { var define = require('amdefine')(module) }
define(function(require) {

  function Emitter(emitter) {
    if(!(this instanceof Emitter)) {
      return new Emitter();
    }  

    this._events = {};
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

  Emitter.prototype.off = function(event,handler) {
    if(!this._events[event]) {
      return this;
    }

    var i = this._events[event].indexOf(handler);
    
    /* remove the handler */
    if (i >= 0) {
      this._events[event].splice(i, 1);
    
      /* remove event if empty */
      if (this._events[event].length === 0) {
        delete this._events[event];
      }  
    }

    return this;
  }

  Emitter.prototype.emit = function(event) {
    if(!this._events[event]) { 
      return false;
    } 
    var args = Array.prototype.slice.call(arguments,1);

    for (var i = 0, l = this._events[event].length; i < l; i++) {
      /* stop propagation on false */
      if( this._events[event][i].apply(this,args) === false ) {
        break;
      } 
    }

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

  return Emitter;
});