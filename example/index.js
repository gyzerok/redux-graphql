var fs = require('fs');

try {
  fs.statSync(__dirname + '/.tmp/bundle.js');
} catch (ex) {
  console.error('You must build the client first using `npm run build`');
  process.exit(1);
}

global.__CLIENT__ = false;
require('babel/register')({
  stage: 0,
});
require('./src/server');
// require('./src/server/test');
