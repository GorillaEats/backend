const sinon = require('sinon');
const proxyquire = require('proxyquire').noPreserveCache();

require('./absolutePath');
const { setupMongodbConnection, closeMongodbConnection } = require('test/util/mongoose');

class TestApp {
  async setup() {
    this.mongod = await setupMongodbConnection({ seed: true });
    const mongoUri = await this.mongod.getUri();

    if (process.env.MONGODB_CONNECTION_URL) {
      this.envStub = sinon.stub(process.env.MONGODB_CONNECTION_URL).value(mongoUri);
    } else {
      process.env.MONGODB_CONNECTION_URL = mongoUri;
    }

    this.expressApp = proxyquire('index', {});
  }

  async cleanup() {
    await closeMongodbConnection(this.mongod);

    if (this.envStub) {
      this.envStub.restore();
    } else {
      delete process.env.MONGODB_CONNECTION_URL;
    }
  }
}

module.exports = TestApp;
