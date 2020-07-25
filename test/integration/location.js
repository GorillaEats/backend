const { serial: test } = require('ava');
const request = require('supertest');

require('../util/absolutePath');
const { PATH } = require('src/api/routes/location');
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

test(`GET ${PATH} should return open locations if field is set`, async (t) => {
  const { app } = t.context;
  const location = JSON.parse(JSON.stringify(app.testDb.data.Location[0]));

  const res = await request(app.expressApp)
    .get(PATH)
    .query({
      'filter.lat': location.geo.coordinates[1],
      'filter.long': location.geo.coordinates[0],
      'filter.radius': 0,
      'filter.open': location.openingHours[0].start,
    });

  const resLocation = res.body.locations[0];

  // eslint-disable-next-line no-underscore-dangle
  t.is(location._id, resLocation._id);
});

test(`GET ${PATH} should return locations with proper rating`, async (t) => {
  const { app } = t.context;
  const location = JSON.parse(JSON.stringify(app.testDb.data.Location[0]));

  const res = await request(app.expressApp)
    .get(PATH)
    .query({
      'filter.lat': location.geo.coordinates[1],
      'filter.long': location.geo.coordinates[0],
      'filter.radius': 0,
      'filter.veganRating': 3.5,
    });

  t.is(res.body.locations.length, 0);
});
