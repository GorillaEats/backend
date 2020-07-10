const { serial: test } = require('ava');

require('../../util/absolutePath');
const TestDB = require('test/util/mongoose');
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
  const restaurant = t.context.testDb.data.Restaurant[0];
  const rating = 2;
  const ratingCount = 1;

  await Restaurant.updateVeganRating(restaurant.id, rating, ratingCount);

  const newRestaurant = await Restaurant.findOne({ _id: restaurant.id });

  t.is(
    restaurant.reviewMeta.veganRatingTotal + rating,
    newRestaurant.reviewMeta.veganRatingTotal,
  );
  t.is(
    restaurant.reviewMeta.veganRatingCount + ratingCount,
    newRestaurant.reviewMeta.veganRatingCount,
  );
});

test('Virtual property reviewMeta.veganRating should return 0 if no vegan ratings', async (t) => {
  const restaurant = t.context.testDb.data.Restaurant[0];

  t.is(restaurant.reviewMeta.veganRating, 0);
});

test('Virtual property reviewMeta.veganRating should give average', async (t) => {
  const restaurant = t.context.testDb.data.Restaurant[0];
  const total = 20;
  const count = 5;
  const average = total / count;

  restaurant.reviewMeta.veganRatingTotal = total;
  restaurant.reviewMeta.veganRatingCount = count;

  t.is(restaurant.reviewMeta.veganRating, average);
});
