
/********************************************************************************************************************
 *
 * This implementation is based upon the Promises/A+ proposal found at https://github.com/promises-aplus/promises-spec   
 *
 * ## General
 * 
 * A promise represents a value that may not be available yet. 
 * The primary method for interacting with a promise is its `then` method.
 * 
 * ## Terminology
 * 
 * 1. "promise" is an object or function that defines a `then` method.
 * 1. "value" is any legal JavaScript value (including `undefined` or a promise).
 * 1. "reason" is a value that indicates why a promise was rejected.
 * 1. "must not change" means immutable identity (i.e. `===`), but does not imply deep immutability.
 * 
 * ## Requirements
 * 
 * ### Promise States
 * 
 * A promise must be in one of three states: pending, fulfilled, or rejected.
 * 
 * 1. When in pending, a promise:
 * 
 *   1. may transition to either the fulfilled or rejected state.
 * 
 * 1. When in fulfilled, a promise:
 * 
 *   1. must not transition to any other state.
 *   1. must have a value, which must not change.
 * 
 * 1. When in rejected, a promise:
 * 
 *   1. must not transition to any other state.
 *   1. must have a reason, which must not change.
 *
 * ### The `then` Method
 * 
 * A promise must provide a `then` method to access its current or eventual fulfillment value or rejection reason.
 * 
 * A promise's `then` method accepts two arguments:
 * 
 * ```
 * promise.then(onFulfilled, onRejected)
 * ```
 * 
 * 1. Both `onFulfilled` and `onRejected` are optional arguments:
 *   1. If `onFulfilled` is not a function, it must be ignored.
 *   1. If `onRejected` is not a function, it must be ignored.
 * 1. If `onFulfilled` is a function:
 *   1. it must be called after `promise` is fulfilled, with `promise`'s fulfillment value as its first argument.
 *   1. it must not be called more than once.
 *   1. it must not be called if `onRejected` has been called.
 * 1. If `onRejected` is a function,
 *   1. it must be called after `promise` is rejected, with `promise`'s rejection reason as its first argument.
 *   1. it must not be called more than once.
 *   1. it must not be called if `onFulfilled` has been called.
 * 1. `then` must return before `onFulfilled` or `onRejected` is called [[4.1](#notes)].
 * 1. `then` may be called multiple times on the same promise.
 *   1. If/when `promise` is fulfilled, respective `onFulfilled` callbacks must execute in the order of their originating calls to `then`.
 *   1. If/when `promise` is rejected, respective `onRejected` callbacks must execute in the order of their originating calls to `then`.
 * 1. `then` must return a promise [[4.2](#notes)].
 * 
 *   ```
 *   promise2 = promise1.then(onFulfilled, onRejected);
 *   ```
 *
 *   1. If either `onFulfilled` or `onRejected` returns a value that is not a promise, `promise2` must be fulfilled with that value.
 *   1. If either `onFulfilled` or `onRejected` throws an exception, `promise2` must be rejected with the thrown exception as the reason.
 *   1. If either `onFulfilled` or `onRejected` returns a promise (call it `returnedPromise`), 
 *      `promise2` must assume the state of `returnedPromise` [[4.3](#notes)]:
 *       1. If `returnedPromise` is pending, `promise2` must remain pending until `returnedPromise` is fulfilled or rejected.
 *       1. If/when `returnedPromise` is fulfilled, `promise2` must be fulfilled with the same value.
 *       1. If/when `returnedPromise` is rejected, `promise2` must be rejected with the same reason.
 *   1. If `onFulfilled` is not a function and `promise1` is fulfilled, `promise2` must be fulfilled with the same value.
 *   1. If `onRejected` is not a function and `promise1` is rejected, `promise2` must be rejected with the same reason.
 *
 * ## Notes
 *
 * 1. In practical terms, an implementation must use a mechanism such as `setTimeout`, `setImmediate`, 
 *    or `process.nextTick` to ensure that `onFulfilled` and `onRejected` are not invoked in the same 
 *    turn of the event loop as the call to `then` to which they are passed.
 *
 * 1. Implementations may allow `promise2 === promise1`, provided the implementation meets all requirements. 
 *    Each implementation should document whether it can produce `promise2 === promise1` and under what conditions.
 * 
 * 1. The mechanism by which `promise2` assumes the state of `returnedPromise` is not specified.  
 *   One reasonable approach is to call `returnedPromise.then(fulfillPromise2, rejectPromise2)`, where:
 *   1. `fulfillPromise2` is a function which fulfills `promise2` with its first parameter.
 *   1. `rejectPromise2` is a function which rejects `promise2` with its first parameter.
 *
 *   Given that `returnedPromise` may not be Promises/A+-compliant, but could instead be any object 
 *   with a `then` method, it isn't always possible to satisfy the requirement of `promise2` assuming 
 *   the same state as `returnedPromise`. Thus, the procedure here represents a best-faith effort.
 *******************************************************************************************************************/
if (typeof define !== 'function') { var define = require('amdefine')(module) }

var libs = [
  '../lib/promise',
  './lib/qunit-1.10.js'
];

define(libs,function(Promise){ 

module = QUnit.module;

module('Promise');

test('Promise methods', 4, function(){ 
	this.promise = new Promise;  
    equal(typeof Promise,'function',"Promise()");
    equal(typeof this.promise.then,'function',"then()"); 
    equal(typeof this.promise.fulfill,'function',"fulfilled()");
    equal(typeof this.promise.reject,'function',"rejected()");   
});

asyncTest('call onfulfilled on fulfilled',1, function(){
	this.promise = new Promise;
	this.promise.fulfill(true)
		.then(function(f){
			equal(f,true,"onfulfilled");
			start();

		},function(r){
			ok(r,"onRejected");
		});
});

asyncTest('call onRjected on rejected',1, function(){
	this.promise = new Promise;
	this.promise.reject(true)
		.then(function(f){
			ok(r,"onfulfilled");
		},function(r){
			equal(r,true,"onRejected");
			start();
		});
});

asyncTest('fullfill chain',3, function(){
	this.promise = new Promise;
	this.promise.fulfill(true)
		.then(function(f){
			equal(f,true,"onfulfilled1");
			return true;
		},undefined)
		.then(function(f){
			equal(f,true,"onfulfilled2");
			return true;
		},undefined)
		.then(function(f){
			equal(f,true,"onfulfilled3");
			start();
		},undefined);
});

asyncTest('rejected return fullfills chain',3, function(){
	this.promise = new Promise;
	this.promise.reject(true)
		.then(undefined,function(f){
			equal(f,true,"onRejected1");
			return true;
		})
		.then(function(f){
			equal(f,true,"onFulfill2");
			return true;
		})
		.then(function(f){
			equal(f,true,"onFulfill3");
			start();
		},undefined);
});

asyncTest('multiple fullfillment values',5, function(){
	this.promise = new Promise;
	this.promise.fulfill(1,"a",{a:1},function(){return true})
		.then(function(a){
			equal(a[0],1,"1");
			equal(a[1],"a","a");
			deepEqual(a[2],{a:1},"{a:1}");
			equal(typeof a[3],'function',"function()");
			equal(a[3](),true,"function returns true");
			start();

		},function(r){
			ok(r,"onRejected");
		});
});

asyncTest('nested fullfillments',3, function(){
	this.promise = new Promise;
	this.promise.fulfill(1)
		.then(function(f){
			equal(f,1,"onfulfilled1");
			var p = new Promise;
			return p.fulfill(2);
		},undefined)
		.then(function(f){
			equal(f,2,"onfulfilled2");
			var p = new Promise;
			return p.fulfill(3);
		},undefined)
		.then(function(f){
			equal(f,3,"onfulfilled3");
			start();
		},undefined);
});

asyncTest('nested rejections',3, function(){
	this.promise = new Promise;
	this.promise.reject(1)
		.then(undefined,function(f){
			equal(f,1,"onRejected1");
			var p = new Promise();
			return p.reject(2);
		})
		.then(undefined,function(f){
			equal(f,2,"onRejected2");
			var p = new Promise();
			return p.reject(3);
		},undefined)
		.then(undefined,function(f){
			equal(f,3,"onRejected3");
			start();
		});
});

asyncTest('nested fullfillments & rejections',3, function(){
	this.promise = new Promise;
	this.promise.fulfill(1)
		.then(function(f){
			equal(f,1,"onfulfilled1");
			var p = new Promise;
			return p.reject(2);
		},function(r){
			ok(r,"should not be called");
		})
		.then(function(r){
			ok(r,"should not be called");
		},function(f){
			equal(f,2,"onRejected2");
			var p = new Promise;
			return p.fulfill(3);
		})
		.then(function(f){
			equal(f,3,"onfulfilled3");
			start();
		},function(r){
			ok(r,"should not be called");
		});
});


asyncTest('ignore undefined onfulfilled',1, function(){
	this.promise = new Promise;
	this.promise.reject(true).then(undefined,function(r){
		ok(r,"onfulfilled is undefined");
		start();
	});
});

asyncTest('ignore undefined onRejected',1, function(){
	this.promise = new Promise;
	this.promise.fulfill(true).then(function(r){
		ok(r,"onRejected is undefined");
		start();
	}, undefined);
});

asyncTest('undefined onfulfilled forwards fulfillment',1, function(){
	this.promise = new Promise;
	this.promise.fulfill(true)
		.then(undefined, undefined)
		.then(function(r){
			ok(r,"next onfulfilled then");
			start();
		},undefined);
});

asyncTest('undefined onRejected forwards rejection',1, function(){
	this.promise = new Promise;
	this.promise.reject(true)
		.then(undefined, undefined)
		.then(undefined,function(r){
			ok(r,"next onRejected then");
			start();
		});
});


asyncTest('forward return value',3, function(){
	this.promise = new Promise;
	this.promise.fulfill(true).then(function(r){
		ok(r,true,"fulfilled true");
		return "abc";
	}, undefined)
	.then(function(r){
		equal(r,"abc","returned abc");
		return 123;
	},undefined)
	.then(function(r){
		equal(r,123,"returned 123");
		start();
	},undefined);
});

asyncTest('rejection value fulfills promise',3, function(){
	this.promise = new Promise;
	this.promise.reject(true).then(undefined,function(r){
		ok(r,true,"rejected true");
		return "abc";
	})
	.then(function(r){
		equal(r,"abc","returned abc");
		return 123;
	},undefined)
	.then(function(r){
		equal(r,123,"returned 123");
		start();
	},undefined);
});

asyncTest('fulfilled only once',1, function(){
	this.promise = new Promise;

	this.promise.then(function(f){
		ok(f,"onFullfill");
		start();
	}, function(r){
		ok(r,"rejected");
	});

	this.promise.fulfill(true);
	this.promise.fulfill(false);
});

asyncTest('rejected only once',1, function(){
	this.promise = new Promise;

	this.promise.then(function(f){
		ok(f,"fulfilled");
	}, function(r){
		ok(r,"onRejected");
		start();
	});

	this.promise.reject(true);
	this.promise.reject(false);
});

asyncTest('can not reject after fulfillment',1, function(){
	this.promise = new Promise;

	this.promise.then(function(f){
		ok(f,"onFullfill");
		start();
	}, function(r){
		ok(r,"rejected");
	});

	this.promise.fulfill(true);
	this.promise.reject(false);
});

asyncTest('can not fulfill after rejection',1, function(){
	this.promise = new Promise;

	this.promise.then(function(f){
		ok(f,"onFullfill");
	}, function(r){
		ok(r,"rejected");
		start();
	});

	this.promise.reject(true);
	this.promise.fulfill(false);
});

asyncTest('Forwards exceptions',2, function(){
	this.promise = new Promise;

	this.promise.fulfill(true).then(function(f){
		ok(f,"fulfilled1");
		_x_x_x /* undefined variable */
	},function(r){
		/* not reached */
		ok(r,"rejected1");
	})
	.then(undefined,undefined) // ignored 
	.then(function(r){
		/* not reached */
		ok(r,"fulfilled2")
	},function(e){
		/* exception caught here */
		ok(e instanceof Error,"Error");
		start();
	});

});


asyncTest('multiple onFullfill',2, function(){
	this.promise = new Promise;

	this.promise.then(function(f){
		ok(f,"onFullfill");
	}, function(r){
		ok(r,"rejected");
	});

	this.promise.then(function(f){
		ok(f,"onFullfill");
		start();
	}, function(r){
		ok(r,"rejected");
	});

	this.promise.fulfill(true);
});

asyncTest('multiple onReject',2, function(){
	this.promise = new Promise;

	this.promise.then(undefined,function(f){
		ok(f,"onReject");
	});

	this.promise.then(undefined,function(f){
		ok(f,"onReject");
		start();
	});

	this.promise.reject(true);
});

asyncTest('multiple then handlers',4, function(){
	this.promise = new Promise();
	this.promise.fulfill(1);
	this.promise.then(function(a){
		equal(a,1,"handler called with value");
		return a+1
	});
	this.promise.then(function(a){
		equal(a,1,"handler called with value");
		return a+1
	});
	this.promise.then(function(a){
		equal(a,1,"handler called with value");
		return a+1
	});
	this.promise.then(function(a){
		equal(a,1,"handler called with value");
		start();
	});

});



});
