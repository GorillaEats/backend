const test = require('ava');

require('../util/absolutePath');
const { setupMongodbConnection, closeMongodbConnection } = require('test/util/mongoose');
const Restaurant = require('src/models/restaurant');

test.beforeEach(async (t) => {
  const mongod = await setupMongodbConnection();

  const restaurant = new Restaurant({
    name: 'Chipotle',
    url: 'https://locations.chipotle.com/',
    allowedDomain: 'locations.chipotle.com',
    allow: '(/|(/[a-z]{2}(|\\.html|(/[a-zA-Z]+(?:[-][a-zA-Z]+)*(|\\.html|/[a-zA-Z0-9-]+(|\\.html))))))$',
  });
  await restaurant.save();

  // eslint-disable-next-line no-param-reassign
  t.context = {
    fixture: {
      restaurant,
    },
    mongod,
  };
});

test.afterEach(async (t) => {
  await closeMongodbConnection(t.context.mongod);
});

test('static method updateVeganRating should properly increment vegan rating values', async (t) => {
  const { restaurant } = t.context.fixture;
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
  const { restaurant } = t.context.fixture;

  t.is(restaurant.reviewMeta.veganRating, 0);
});

test('Virtual property reviewMeta.veganRating should give average', async (t) => {
  const { restaurant } = t.context.fixture;
  const total = 20;
  const count = 5;
  const average = total / count;

  restaurant.reviewMeta.veganRatingTotal = total;
  restaurant.reviewMeta.veganRatingCount = count;

  t.is(restaurant.reviewMeta.veganRating, average);
});
