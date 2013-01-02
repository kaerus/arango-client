var Promise = require('../lib/promise');

exports.fulfilled = function(value) {
	var promise = new Promise();
  	promise.fulfill(value);
  	return promise;
},

exports.rejected = function(reason) {
	var promise = new Promise();
	promise.reject(reason);
	return promise;
},

exports.pending = function() {
  var promise = new Promise;
  return {
  	promise: promise,
  	fulfill: function(value) {
  		promise.fulfill(value);
  	},
  	reject: function(error){
		promise.reject(error);
  	}
  }
}
