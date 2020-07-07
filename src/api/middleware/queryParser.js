const qs = require('qs');

function queryParser(str) {
  return qs.parse(str, {
    allowDots: true,
  });
}

module.exports = queryParser;
