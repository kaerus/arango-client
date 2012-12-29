var testrunner = require("qunit");

var tests = [
//    'ajax.js',
    'promise.js',
    'arango.js',
    'api/collection.js',
    'api/document.js',
    'api/index.js',
    'api/cursor.js',
    'api/edge.js',
    'api/key.js'
];

testrunner.run( tests.map(function(t){
    return {code:'../lib/'+t, tests: t}
}), function(err, report) {
    console.dir(report);
});
