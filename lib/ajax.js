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

var Emitter = require('./emitter'),
    inherit = require('./utils').inherit;


function AjaxError(type,details) {
    var ERR = {
        'NOXHR':        [1000,'Ajax is not supported'],
        'REQUEST':      [1001,'Operation failed'],
        'UNIMPLEMENTED':[1002,'Not implemented'] 
    };

  return {
        name: "Ajax",
        type: type,
        code: ERR[type][0],
        message: ERR[type][1] + (details ? ': ' + details : '')
    };  
}


/* Get browser xhr object */
var Xhr = (function() {
    if(typeof window.XMLHttpRequest !== 'undefined' ) {
        return window['XMLHttpRequest'];
    } else if(typeof window.ActiveXObject !== 'undefined') {
        ['Msxml2.XMLHTTP.6.0','Msxml2.XMLHTTP.3.0','Microsoft.XMLHTTP'].forEach(function(x) {
            try { return window.ActiveXObject(x) } catch (e) {}
        }); 
        throw AjaxError('NOXHR','XHR ActiveXObject failed');
    } 
    throw AjaxError('NOXHR','XHR support not found');
}());


/* ReadyState status codes */
var XHR_CLOSED = 0,
    XHR_OPENED = 1,
    XHR_SENT = 2,
    XHR_RECEIVED = 3,
    XHR_DONE = 4, 

/* headers to be filtered out */
    UNSAFE_HEADERS = [
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
    Emitter.call(this);
    /* response data buffer */
    this.data = [];
    /* size of data */
    this.data.size = 0;
    /* invoke callback on response */
    this.on('response',callback);
    /* emit close after end or error */
    this.after('end', function(){request.close()});
    this.after('error', function(){request.close()});
}

inherit(Response, Emitter);

Response.prototype.write = function(data) {
    this.data.push(data);
    this.data.size += data.length;
    this.emit('data',this.data[this.data.length-1]);
}; 

Response.prototype.writeChunk = function(data) {
    if(data.length > this.data.size) {
        this.write(data.slice(this.data.size));
    }         
}

/* Ajax request constructor */
function Ajax(options,callback) { 
    if(!(this instanceof Ajax))
        return new Ajax(options,callback);

    var ajax = this;
    ajax._send = []; 
    ajax.status = '';

    ajax.xhr = new Xhr;

    Emitter.call(this);

    /* timeout handler */
    if(options.timeout) {
        ajax._timeout = options.timeout;
        delete options.timeout;
    } else {
        ajax._timeout = 5000;
    }    

    ajax.timeoutHandler = function() {
        ajax.status = 'TIMEDOUT';
        ajax.xhr.abort();
    }

    ajax.response = new Response(ajax,callback);
    /* emit response object to handler */ 
    ajax.response.emit('response',ajax.response);

    /* handle readystates */
    ajax.xhr.onreadystatechange = function() {
        switch(ajax.xhr.readyState) {
            case XHR_DONE:  
                if(!ajax.xhr.status) { 
                    ajax.response.emit('error',AjaxError('REQUEST', ajax.xhr.statusText || ajax.status));
                } else {
                    ajax.response.statusCode = ajax.xhr.status;
                    if(!ajax.response.headers) 
                        ajax.response.headers = ajax.parseHeaders();
                    /* setup error response on error */
                    if(ajax.xhr.status > 399) {
                        ajax.response.error = true;
                        ajax.response.message = ajax.xhr.statusText;
                    } else {
                        ajax.response.writeChunk(ajax.xhr.responseText);
                    }
                    ajax.response.emit('end');
                }
                break;
            case XHR_RECEIVED: 
                ajax.response.headers = ajax.parseHeaders();
                ajax.response.writeChunk(ajax.xhr.responseText);
                break;
            case XHR_SENT: 
                ajax.emit('ready');
                break;
            case XHR_OPENED: 
                break; 
                case XHR_CLOSED: 
                break;  
        }
    };

    /* setup timers */
    ajax.on('open',ajax.startTimer);
    ajax.on('close',ajax.clearTimer);

    /* send request */
    ajax.request(options,callback);

} /* Ajax() */

inherit(Ajax,Emitter);

/* write data to buffer */
Ajax.prototype.write = function(data) {
    this._send.push(data);
    return this;
}

/* sends data */
Ajax.prototype.end = function(data) {
    if(data) this._send.push(data);
    this.xhr.send(this._send.length > 0 ? this._send.join('') : null);
}

Ajax.prototype.close = function() {
    this.emit('close');
}

Ajax.prototype.parseHeaders = function() {
    var headers = {}, key, value, i, 
        h = this.xhr.getAllResponseHeaders();

    h.split('\n').forEach(function(header) {
        i = header.indexOf(':');
        key = header.slice(0,i).replace(/^[\s]+|[\s]+$/g,'').toLowerCase();
        value = header.slice(i+1,header.length).replace(/^[\s]+|[\s]+$/g,'');
        if(key && key.length) headers[key] = value;
    });

    return headers;
}

Ajax.prototype.request = function(options) {
    /* Check if we have a file instead of a proper URL.          */
    /* It is an ugly hack to get requests to work, under certain */
    /* condiftions, when browsing from the local filesystem.     */ 
    /* Note that this is a development feature and should only   */
    /* be used when debugging/developing the application. */
    var isFile = options.protocol === 'file',
        url = isFile ? "http://127.0.0.1:8529" + options.path : 
                options.protocol + '://' + 
                options.hostname + ":" + 
                options.port + 
                options.path;
   
    options.method = options.method ? options.method : 'GET';

    if(!options.headers) options.headers = {};

    /* NOTE: headers in lowercase */
    /* Set default content-type.  */
    if(!options.headers["content-type"]) 
        options.headers["content-type"] = "application/json";

    /* prepare async request */
    this.xhr.open(options.method,url,true);
    this.emit('open',options.method,url);

    /* set request headers, ignore unsafe headers */
    Object.keys(options.headers).forEach(function(header) {
        header = header.toLowerCase();
        if(UNSAFE_HEADERS.indexOf(header) < 0)
            this.xhr.setRequestHeader(header,options.headers[header]);
    },this);
}

Ajax.prototype.startTimer = function() {
    this.timer = setTimeout(this.timeoutHandler, this._timeout);
}

Ajax.prototype.clearTimer = function() {
    clearTimeout(this.timer);
}

Ajax.prototype.resetTimer = function() {
    clearTimeout(this.timer);
    this.startTimer();
}

module.exports = {request: Ajax};
