const test = require('ava');
const request = require('supertest');

require('../util/absolutePath');
const { PATH } = require('src/api/routes/location');
const TestApp = require('test/util/testApp');

test.beforeEach(async (t) => {
  const app = new TestApp();
  await app.setup();

  // eslint-disable-next-line no-param-reassign
  t.context = { app };
});

test.afterEach(async (t) => {
  await t.context.app.cleanup();
});

test(`GET ${PATH} should return open locations if field is set`, async (t) => {
  const { app } = t.context;

  const res = await request(app.expressApp)
    .get(PATH);

  t.fail();
});
