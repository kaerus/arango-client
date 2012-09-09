
require(['../lib/arango'], function(arango){
    var db = new arango.Connection("http://127.0.0.1:8529/testcursor");

	console.log("db ", db.config);
	db.document.list(function(err,ret,hdr){
		console.log("hdr:",hdr);
		console.log("err(%s):",err,ret);
	});   
 
});