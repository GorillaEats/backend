const { serial: test } = require('ava');
const request = require('supertest');

require('../util/absolutePath');
const { PATH } = require('src/api/routes/restaurant');
const TestApp = require('test/util/app');

test.beforeEach(async (t) => {
  const app = new TestApp();
  await app.setup();

  // eslint-disable-next-line no-param-reassign
  t.context = { app };
});

test.afterEach(async (t) => {
  await t.context.app.cleanup();
});

test(`GET ${PATH}/:id should return restaurant by id`, async (t) => {
  const { app } = t.context;
  const restaurant = JSON.parse(JSON.stringify(app.testDb.data.Restaurant[0]));

  const res = await request(app.expressApp)
    .get(`${PATH}/5edd5c283b22bb4f1437c827`);

  const resRestaurant = res.body.restaurant;

  // eslint-disable-next-line no-underscore-dangle
  t.is(restaurant._id, resRestaurant._id);
});
