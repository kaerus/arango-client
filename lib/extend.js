/* 
 * Extends object with source object, rightmost source has precedence.
 * extend(deep,target,source-n...) 
 * Example: extending {a:1,b:2},{a:2,b:3},{b:{a:1,b:2}} 
 * yields the object {a:2,b:{a:1,b:2}}
 */ 
function extend() {
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

module.exports = extend;