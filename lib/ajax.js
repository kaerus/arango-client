if (typeof define !== 'function') { var define = require('amdefine')(module) }
define(function (require) {
  var BROWSER = (typeof window === 'object')
    , Emitter = require('./emitter')
    , extend = require('./extend'); 

  function AjaxError(type,details) {
    var ERR = {
      'OK':           [0,'ok'],
      'NOXHR':        [1000,'Ajax is not supported'],
      'TIMEDOUT':     [1001,'operation timed out'],
      'UNIMPLEMENTED':[1002,'no such feature']
    };
    return {
      name: "Ajax",
      type: type,
      code: ERR[type][0],
      message: ERR[type][1] + details ? ':' + details : ''
    };  
  }
 
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
  }()) : 'node';

  var UNSAFE_HEADERS = [
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

  function Ajax(params,callback) {

    if(Xhr === 'node') {
      var xhr = require(params.protocol||'http').request;
      Ajax = function(params,callback) {
        /* illegal option in node */
        delete params.protocol;
        return xhr(params,callback);
        
      }
      return Ajax(params,callback);
    }

    var ajax = this, res, data;
    ajax.xhr = new Xhr;
    ajax.buffer = []; 

    /* timeout handler */
    ajax.xhr.timeout = 5000;
    ajax.xhr.ontimeout = function(err) {
      var err = AjaxError('TIMEDOUT', 'after ' + ajax.xhr.timeout + 'ms');
      if(ajax._events['error'])
        ajax.emit('error',err);
      else
        throw err;
    };
      
    /* response object */
    function Response(callback) {
      /* response data buffer */
      this.data = [];
      /* size of data */
      this.data.size = 0;
       if(callback) this.on('response',callback);
    }

    Response.prototype = new Emitter();

    Response.prototype.write = function(data) {
      this.data.push(data);
      /* emit only if we have listeners */
      if(this._events['data'])
        this.emit('data',this.data[this.data.length-1]);
      this.data.size += data.length;
    }; 

    Response.prototype.writeChunk = function(data) {
      if(data.length > this.data.size)
        this.write(data.slice(res.data.size));     
    }
    
    if(!res) res = new Response(callback);
    res.emit('response',res);

    /* readyState handler */
    ajax.xhr.onreadystatechange = function(){
      switch(ajax.xhr.readyState) {
        case 4:
          console.log("Ajax Response",ajax.xhr);
          if(!res.statusCode)
              res.statusCode = ajax.xhr.status;
          if(!res.headers) 
              res.headers = ajax.parseHeaders();
          res.writeChunk(ajax.xhr.responseText);       
          res.emit('end');
          break;
        case 3:
          if (!res.statusCode) {
              res.statusCode = ajax.xhr.status;
              res.headers = ajax.parseHeaders();
              res.emit('ready');
          }
          res.writeChunk(ajax.xhr.responseText);
          break;
        case 2:
          if(ajax.xhr.status) {
            res.statusCode = ajax.xhr.status;
            res.headers = ajax.parseHeaders();
            res.emit('ready');
          }
          break;
        case 1: 
          break; 
      }
    };
      var url = params.protocol + "://" + params.hostname + ":" + params.port + params.path;
      /* prepare async request */
      console.log("Ajax Request %s %s",params.method,url);
      ajax.xhr.open(params.method,url,true);
      /* set request headers, ignore unsafe headers */
      Object.keys(params.headers).forEach(function(header){
        if(!(header in UNSAFE_HEADERS))
          ajax.xhr.setRequestHeader(header,params.headers[header]);
      });
  }
  Ajax.prototype = new Emitter();

  Ajax.prototype.write = function(data) {
    this.buffer.push(data);
  };

  Ajax.prototype.end = function(data) {
    this.xhr.send(this.buffer.length > 0 ? this.buffer : null);
  };

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
  return Ajax;
});