const test = require('ava');
const sinon = require('sinon');
const request = require('supertest');
const express = require('express');

require('../../../util/absolutePath');
const httpLogger = require('src/api/middleware/httpLogger.js');
const logger = require('src/logger');

test('morgan', async (t) => {
  const METHOD = 'GET';
  const PATH = '/';
  const STATUS = '404';

  const loggerstub = sinon.stub(logger, 'info');
  const app = express();
  app.use(httpLogger);
  await request(app)
    .get('/');

  const args = loggerstub.getCall(0).firstArg.split(' ');
  t.true(args[0] === METHOD && args[1] === PATH && args[2] === STATUS);
});
