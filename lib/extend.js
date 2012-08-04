var util = require('util');

module.exports = function() {
  var deep = false, target = {}, i = 0;
  if(typeof arguments[i] === "boolean") deep = arguments[i++];
  if(typeof arguments[i+1] === "object") target = arguments[i++];
  
  for(var source; source = arguments[i]; i++){    
    target = Object.keys(source).reduce(function(obj,key) {
      if(deep && typeof source[key] === 'object')
        obj[key] = extend(true,obj[key],source[key]);
      else
        obj[key] = source[key];
      return obj;
    }, target);
    
  }
  
  return target;
};