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

  const loggerstub = sinon.stub(logger, 'info');
  const app = express();
  app.use(httpLogger);
  const response = await request(app)
    .get(PATH);

  const statusCode = response.res.statusCode.toString();

  const args = loggerstub.getCall(0).firstArg.split(' ');
  t.true(args[0] === METHOD && args[1] === PATH && args[2] === statusCode);
});
