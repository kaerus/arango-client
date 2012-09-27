if (typeof define !== 'function') { var define = require('amdefine')(module) }

var libs = [

	'./lib/qunit-1.10.js',
	'./10.arango.js',
	'./15.ajax.js',
	'./20.session.js',
	'./25.collection.js'
];

var jsdom = require('jsdom');




define(libs,function(){

// Runs once at the very beginning.
 
QUnit.begin = function() {
  console.log("Running Test Suite");
};
 
// Runs once at the very end.
 
QUnit.done = function(failures, total) {
  console.info("Suite: %d failures / %d tests", failures, total);
};
 
// Runs once after each assertion.
 
QUnit.log = function(result, message) {
  console[ result ? "log" : "error" ](message);
};
 
// Runs before each test.
 
QUnit.testStart = function(name) {
  console.group("Test: " + name);
};
 
// Runs after each test.
 
QUnit.testDone = function(name, failures, total) {
  console.info("Test: %d failures / %d tests", failures, total);
  console.groupEnd();
};
 
// Runs before each module.
 
QUnit.moduleStart = function(name) {
  console.group("Module: " + name);
};
 
// Runs after each module.
 
QUnit.moduleDone = function(name, failures, total) {
  console.info("Module: %d failures / %d tests", failures, total);
  console.groupEnd();
};
 
// Runs after each test group. Redefining this function will
// override the built-in #qunit-fixture reset logic.
 
QUnit.reset = function() {
  console.log("Test done!");
};
	
});

