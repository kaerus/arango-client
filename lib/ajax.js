/*
 * Copyright (c) 2012 Kaerus, Anders Elo <anders @ kaerus com>.
 
 * Permission is hereby granted, free of charge, to any person obtaining a 
 * copy of this software and associated documentation files (the "Software"), 
 * to deal in the Software without restriction, including without limitation 
 * the rights to use, copy, modify, merge, publish, distribute, sublicense, 
 * and/or sell copies of the Software, and to permit persons to whom the 
 * Software is furnished to do so, subject to the following conditions:

 * The above copyright notice and this permission notice shall be included in 
 * all copies or substantial portions of the Software.

 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR 
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, 
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE 
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER 
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING 
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER 
 * DEALINGS IN THE SOFTWARE.
 */

if (typeof define !== 'function') { var define = require('amdefine')(module) }
define(function (require) {
  var BROWSER = (typeof window === 'object')
    , kore = require('./kore');

  function AjaxError(type,details) {
    var ERR = {
      'NOXHR':        [1000,'Ajax is not supported'],
      'REQUEST':      [1001,'Request operation failed'],
      'UNIMPLEMENTED':[1002,'no such feature'] 
    };
    return {
      name: "Ajax",
      type: type,
      code: ERR[type][0],
      message: ERR[type][1] + (details ? ': ' + details : '')
    };  
  }
 
  /* get browser xhr object or assume 'nodejs' */
  var Xhr = BROWSER ? (function(){
    var xhr, xp;
    if(typeof window.XMLHttpRequest !== 'undefined' ) {
      return window['XMLHttpRequest'];
    } 
    else if(typeof window.ActiveXObject !== 'undefined') {
      xhr = 'ActiveXObject';
      var ver = ['Msxml2.XMLHTTP.6.0','Msxml2.XMLHTTP.3.0','Microsoft.XMLHTTP'];
      for (var i = 0, l = ver.length; i < l; i++) {
       try {
          /* test constructor */
          new window.ActiveXObject(ver[i]);
          return window.ActiveXObject(ver[i]);
        } catch (e) {}
      }
      throw AjaxError('NOXHR','XHR ActiveXObject failed');
    } 
    throw AjaxError('NOXHR','XHR support not found');
  }()) : 'nodejs';

  /* ReadyState status codes */
  var XHR_CLOSED = 0
    , XHR_OPENED = 1
    , XHR_SENT = 2
    , XHR_RECEIVED = 3
    , XHR_DONE = 4 
  /* headers to be filtered out */
    , UNSAFE_HEADERS = [
    "accept-charset",
    "accept-encoding",
    "access-control-request-headers",
    "access-control-request-method",
    "connection",
    "content-length",
    "cookie",
    "cookie2",
    "content-transfer-encoding",
    "date",
    "expect",
    "host",
    "keep-alive",
    "origin",
    "referer",
    "te",
    "trailer",
    "transfer-encoding",
    "upgrade",
    "user-agent",
    "via"
  ];

  /* Response object */
  function Response(request,callback) {
    kore.Emitter.call(this);
    /* response data buffer */
    this.data = [];
    /* size of data */
    this.data.size = 0;
    /* invoke callback on response */
    this.on('response',callback);
    /* emit close after end or error */
    this.after('end', function(){request.close();});
    this.after('error', function(){request.close();});
  }

  kore.inherit(Response, kore.Emitter);

  Response.prototype.write = function(data) {
    this.data.push(data);
    /* emit only if we have listeners */
    if(this._events['data'])
      this.emit('data',this.data[this.data.length-1]);
    this.data.size += data.length;
  }; 

  Response.prototype.writeChunk = function(data) {
    if(data.length > this.data.size)
      this.write(data.slice(this.data.size));     
  }

  /* Ajax request constructor */
  function Ajax(params,callback) {
    if(!(this instanceof Ajax))
        return new Ajax(params,callback);

    var ajax = this;
    ajax._send = []; 

/*
    if(Xhr === 'nodejs') {
      var xhr = require(params.protocol||'http').request;
      Ajax = function(params,callback) {
        delete params.protocol;
        if(params.timeout){
          xhr.socket.setTimeout(params.timeout);
          delete params.timeout;
        }
        return xhr(params,callback);
      }
      return Ajax(params,callback);
    }
*/  
    ajax.xhr = new Xhr;

    kore.Emitter.call(this);

    /* timeout handler */
    if(params.timeout){
      console.log("Ajax timeout: ", params.timeout);
      ajax._timeout = params.timeout;
      delete params.timeout;
    } else ajax._timeout = 5000;
    
    ajax.timeoutHandler = function(){
      ajax.xhr.abort();
    }

    ajax.response = new Response(ajax,callback);
    /* emit response object to handler */ 
    ajax.response.emit('response',ajax.response);

    /* readyState handler */
    /* NOTE: "If the response is an HTTP redirect 
    /* (status code 301, 302, 303 or 307), 
    /* then it must be transparently followed" */
    ajax.xhr.onreadystatechange = function(){
      /* reset timeout handler */
      console.log("status", ajax.xhr.readyState);
      switch(ajax.xhr.readyState) {
        case XHR_DONE: 
          ajax.response.statusCode = ajax.xhr.status;
          if(!ajax.response.headers) 
            ajax.response.headers = ajax.parseHeaders();
          ajax.response.writeChunk(ajax.xhr.responseText);
          /* request finished */    
          console.log("Xhr:", ajax.xhr);   
          if(!ajax.xhr.status){ 
            ajax.response.emit('error',AjaxError('REQUEST', ajax.xhr.statusText));
          }
          else ajax.response.emit('end');
          break;
        case XHR_RECEIVED:  
          ajax.response.headers = ajax.parseHeaders();
          /* get response data */
          ajax.response.writeChunk(ajax.xhr.responseText);
          break;
        case XHR_SENT: 
          /* request sent */
          ajax.emit('ready');
          break;
        case XHR_OPENED: 
          break; 
        case XHR_CLOSED: 
          break;  
      }
    };

    /* handle timeout */
    ajax.on('open',ajax.startTimer);
    ajax.on('close',ajax.clearTimer);
    ajax.request(params,callback);
  }

  kore.inherit(Ajax,kore.Emitter);

  Ajax.prototype.write = function(data) {
    this._send.push(data);
    return this;
  };

  Ajax.prototype.end = function(data) {
    if(data) this._send.push(data);
    this.xhr.send(this._send.length > 0 ? this._send.join() : null);
    console.log("Send:", this._send.join());
  };

  Ajax.prototype.close = function() {
    this.emit('close');
  }

  Ajax.prototype.parseHeaders = function() {
    var headers = {}, key, value, i
      , h = this.xhr.getAllResponseHeaders();
    h.toLowerCase().split('\n').forEach(function(header){
      i = header.indexOf(':');
      key = header.slice(0,i).replace(/^[\s]+|[\s]+$/g,'');
      value = header.slice(i+1,header.length).replace(/^[\s]+|[\s]+$/g,'');
      if(key && key.length) headers[key] = value;
    });
    return headers;
  }

  Ajax.prototype.request = function(params,callback) {
    var isFile = params.protocol === 'file' && BROWSER
      , url = isFile ? "http://127.0.0.1:8529/" + params.path : 
              params.protocol + '://' + params.hostname + ":" + params.port + '/' + params.path;

    params.method = params.method || 'GET';
    if(!params.headers) params.headers = {};
    /* NOTE: headers in lowercase */
    if(!params.headers["content-type"]) params.headers["content-type"] = "application/json";

    /* prepare async request */
    console.log("Ajax Request %s %s",params.method,url);
    this.xhr.open(params.method,url,true);
    this.emit('open',params.method,url);

    /* set request headers, ignore unsafe headers */
    Object.keys(params.headers).forEach(function(header){
      header = header.toLowerCase();
      if(!BROWSER || UNSAFE_HEADERS.indexOf(header) < 0)
        this.xhr.setRequestHeader(header,params.headers[header]);
    },this);
  }

  Ajax.prototype.startTimer = function() {
    this.timer = setTimeout(this.timeoutHandler, this._timeout);
    console.log("Starting timer:", this.timer);
  }

  Ajax.prototype.clearTimer = function() {
    clearTimeout(this.timer);
    console.log("removing timer: ", this.timer);
  }

  Ajax.prototype.resetTimer = function() {
    clearTimeout(this.timer);
    this.startTimer();
  }

  return {request: Ajax};
});