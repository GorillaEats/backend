const test = require('ava');
const sinon = require('sinon');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

require('../../util/absolutePath');
const setupDB = require('src/loaders/mongoose');

test.beforeEach((t) => {
  const mongod = new MongoMemoryServer();

  // eslint-disable-next-line no-param-reassign
  t.context = {
    mongod,
  };
});

test.afterEach(async (t) => {
  await t.context.mongod.stop();
  sinon.restore();
});

test('should setup mongoose connection with proper uri', async (t) => {
  const dbSpy = sinon.spy(mongoose, 'connect');
  const uri = await t.context.mongod.getUri();

  sinon.stub(process, 'env').value({
    MONGODB_CONNECTION_URL: uri,
  });

  await setupDB();

  t.true(dbSpy.calledOnceWith(uri));
});
