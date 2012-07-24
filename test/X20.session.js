var assert = require('chai').assert 
  , arango = require('../index')
  , crypto = require('crypto')
  , util = require('util');

suite('Arango session', function(){
  var db = new arango.Connection;

  test('set user credentials & validate hashed password', function(done){
    var user = "test", pass = "password";
    db.config.user = user;
    db.config.pass = pass;
    assert.equal(db.config.user,user,'validating username');
    pass = crypto.createHash('sha256').update("password").digest('hex');
    assert.equal(db.config.pass,pass,"validating hashed password");
    done();
  });
  
  test('attempt login with no password',function(done){
    db.config.pass = undefined;
    db.session.login(function(err,ret){
      assert(err);
      done();
    });
  });
 
  test('attempt login with wrong username',function(done){
    db.config.user = "xyzrandom42";
    db.session.login(function(err,ret){
      assert(err);
      done();
    });
  });
 
  test('attempt successful login',function(done){
    db.config.user = "manager";
    db.config.pass = "";
    db.session.login(function(err,ret){
      assert(!err,ret);
      assert(db._sid,"has session");
      assert(db._rights,"has rights");
      assert.deepEqual(db._rights,ret.rights,"validating rights");
      assert.equal(db._sid,ret.sid,"Validating sid");
      done();
    });
  });
  
  test('get all users', function(done){
    db.session.users(function(err,ret){
      assert(!err);
      done();
    });
  });
 
 test('change password', function(done){
  db.session.changePassword("test",function(err,ret){
    assert(!err);
    done();
  });
 });
 
  test('logout from session',function(done){
    db.session.logout(function(err,ret){
      assert(!err);
      assert(!db._sid);
      assert(!db._rights);
      done();
    });
  });

  test('login with new password', function(done) {
    db.config.pass = "test";
    db.session.login(function(err,ret){
      assert(!err);
      assert(db._sid,"has session");
      assert(db._rights,"has rights");
      assert.deepEqual(db._rights,ret.rights,"validating rights");
      assert.equal(db._sid,ret.sid,"Validating sid");
      done();
    });
  });

  test('change to empty password', function(done){
  db.session.changePassword("",function(err,ret){
    assert(!err);
    done();
  });
 });
  
  test('create a user',function(done){
    db.session.createUser("admin","lille","lalu",function(err,ret){
      assert(!err);
      done();
    });
  });
   
  test('login with new user',function(done){
    db.config.user = "lille";
    db.config.pass = "lalu";
    
    db.session.login(function(err,ret){
      assert(!err);
      assert(db._sid,"has session");
      assert(db._rights,"has rights");
      assert.deepEqual(db._rights,ret.rights,"validating rights");
      assert.equal(db._sid,ret.sid,"Validating sid");
      done();
    });
  }); 
 
  
});