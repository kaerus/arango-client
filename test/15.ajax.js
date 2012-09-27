if (typeof define !== 'function') { var define = require('amdefine')(module) }
  
var libs = [
  '../lib/ajax',
  './lib/qunit-1.10.js'
];

define(libs,function(Ajax){ 
  var params = {protocol:'http',hostname:"127.0.0.1",port:8529,path:"_admin/status"}, request, data;
  module = QUnit.module;

  module('Ajax');

  test('has Ajax', 1, function(){   
    ok(Ajax,"Has Ajax");    
  });
  
  data = [];
  asyncTest("Connect",4,function(){
    new Ajax.request(params,function(res){  
      res.on('data',function(buffer){
        data.push(buffer);
        ok(data,"We got data");
      }).on('end',function(){
        data = JSON.parse(res.data);
        ok(data,"we have JSON");
        start();
      }).on('error',function(err){
        console.log("Response error: ", err);
      }); 
    }).on('ready',function(){
      ok(1,"Request ready");
    }).on('close',function(){
      ok(1,"Connection closed");
      console.log("Closed");
    }).on('error',function(err){
      console.log("Request error: ", err);
    }).end();

  });

  /* NOTE: This test acts differently without a network connection */
  asyncTest("Timeout",1, function(){
    params.hostname = "1.2.3.4";
    params.timeout = 2000;
    new Ajax.request(params,function(response){
      response.on('error',function(err){
        equal(err.type,'REQUEST',err.type + ':' + err.message);
        start();
      });
    }).end();
  });



});