const sinon = require('sinon');
const proxyquire = require('proxyquire').noPreserveCache();

require('./absolutePath');
const TestDB = require('test/util/mongoose');

class TestApp {
  async setup() {
    const testDb = new TestDB();
    await testDb.setup({ seed: true });

    const mongoUri = await testDb.mongod.getUri();

    if (process.env.MONGODB_CONNECTION_URL) {
      this.envStub = sinon.stub(process.env.MONGODB_CONNECTION_URL).value(mongoUri);
    } else {
      process.env.MONGODB_CONNECTION_URL = mongoUri;
    }

    this.expressApp = proxyquire('index', {});
    this.testDb = testDb;
  }

  async cleanup() {
    await this.testDb.cleanup();

    if (this.envStub) {
      this.envStub.restore();
    } else {
      delete process.env.MONGODB_CONNECTION_URL;
    }
  }
}

module.exports = TestApp;
