
module.exports.extend = require('./extend');

module.exports.request = require('./request');

module.exports.transport = function(protocol) {
  return protocol === 'https' ? require('https') : require('http');
};

module.exports.api = {
  "cursor": require('./api/cursor'),
  "collection": require('./api/collection'),
  "document": require('./api/document'),
  "index": require('./api/index'),
  "session": require('./api/session')
};

