const test = require('ava');
const sinon = require('sinon');
const winston = require('winston');
const { LoggingWinston } = require('@google-cloud/logging-winston');

function requireUncached(module) {
  delete require.cache[require.resolve(module)];

  // eslint-disable-next-line import/no-dynamic-require, global-require
  return require(module);
}

test('should use winston console logger if not in production', (t) => {
  sinon.stub(process.env, 'NODE_ENV').value('development');

  const tempLogger = requireUncached('src/logger');

  t.is(tempLogger.transports.length, 1);
  t.true(tempLogger.transports[0] instanceof winston.transports.Console);
});

test('should use google logger if in production', (t) => {
  sinon.stub(process.env, 'NODE_ENV').value('production');

  const tempLogger = requireUncached('src/logger');

  t.is(tempLogger.transports.length, 1);
  t.true(tempLogger.transports[0] instanceof LoggingWinston);
});
