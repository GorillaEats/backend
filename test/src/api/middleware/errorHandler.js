const { serial: test } = require('ava');
const sinon = require('sinon');
const HttpStatus = require('http-status-codes');

require('../../../util/absolutePath');
const { errorHandler } = require('src/api/middleware');

test.beforeEach((t) => {
  // eslint-disable-next-line no-param-reassign
  t.context.fixture = {
    error: new Error('test'),
    res: {
      status: sinon.stub(),
      json: sinon.stub(),
    },
  };
});

test('should send error message and error status', (t) => {
  const { error, res } = t.context.fixture;

  errorHandler(error, null, res, null);

  t.true(res.status.calledOnceWithExactly(HttpStatus.INTERNAL_SERVER_ERROR));
  t.true(res.json.calledOnceWith({
    error: { message: error.message },
  }));
});

test('should send status attached to error if it exists', (t) => {
  const { error, res } = t.context.fixture;
  error.status = HttpStatus.NOT_FOUND;

  errorHandler(error, null, res, null);

  t.true(res.status.calledOnceWithExactly(HttpStatus.NOT_FOUND));
  t.true(res.json.calledOnceWith({
    error: { message: error.message },
  }));
});
