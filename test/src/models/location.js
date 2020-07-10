const test = require('ava');
const sinon = require('sinon');

require('../../util/absolutePath');
const TestDB = require('test/util/mongoose');
const Location = require('src/models/location');
const Restaurant = require('src/models/restaurant');

test.beforeEach(async (t) => {
  const testDb = new TestDB();
  await testDb.setup({ seed: true });

  // eslint-disable-next-line no-param-reassign
  t.context = {
    testDb,
  };
});

test.afterEach(async (t) => {
  await t.context.testDb.cleanup();
});

test('Static method updateVeganRating should properly increment vegan rating values', async (t) => {
  const location = t.context.testDb.data.Location[0];
  const rating = 2;
  const ratingCount = 1;

  const rVeganRatingStub = sinon.stub(Restaurant, 'updateVeganRating').returns();

  await Location.updateVeganRating(location.id, location.restaurantId, rating, ratingCount);

  const newLocation = await Location.findOne({ _id: location.id });

  t.true(rVeganRatingStub.calledOnceWithExactly(location.restaurantId, rating, ratingCount));
  t.is(
    location.reviewMeta.veganRatingTotal + rating,
    newLocation.reviewMeta.veganRatingTotal,
  );
  t.is(
    location.reviewMeta.veganRatingCount + ratingCount,
    newLocation.reviewMeta.veganRatingCount,
  );
});

test('Virtual property reviewMeta.veganRating should return 0 if no vegan ratings', async (t) => {
  const location = t.context.testDb.data.Location[0];

  t.is(location.reviewMeta.veganRating, 0);
});

test('Virtual property reviewMeta.veganRating should give average', async (t) => {
  const location = t.context.testDb.data.Location[0];
  const total = 20;
  const count = 5;
  const average = total / count;

  location.reviewMeta.veganRatingTotal = total;
  location.reviewMeta.veganRatingCount = count;

  t.is(location.reviewMeta.veganRating, average);
});
