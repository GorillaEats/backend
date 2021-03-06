const proxyquire = require('proxyquire').noPreserveCache();

require('./absolutePath');
const TestDB = require('test/util/mongoose');

const expressApp = proxyquire('index', { 'src/loaders/mongoose': () => {} });

class TestApp {
  async setup() {
    const testDb = new TestDB();
    await testDb.setup({ seed: true });

    this.expressApp = expressApp;
    this.testDb = testDb;
  }

  async cleanup() {
    await this.testDb.cleanup();
  }
}

module.exports = TestApp;
