const test = require('ava');
const sinon = require('sinon');

require('../util/absolutePath');
const { setupMongodbConnection, closeMongodbConnection } = require('test/util/mongoose');
const Location = require('src/models/location');
const Restaurant = require('src/models/restaurant');

test.beforeEach(async (t) => {
  const mongod = await setupMongodbConnection();

  const location = new Location({
    address: {
      addressLocality: 'Cheyenne Laramie',
      streetAddress: '1508 Dell Range Blvd',
      addressRegion: 'WY',
      postalCode: '82009',
      addressCountry: 'US',
    },
    geo: {
      type: 'Point',
      coordinates: [
        -104.80569895096562,
        41.160718013799844,
      ],
    },
    lastScraperRun: Date.now(),
    menuId: '5edd5e127b9d38823bba8533',
    name: 'Chipotle Cheyenne',
    openingHours: [
      [645, 1260],
      [2085, 2700],
      [3525, 4140],
      [4965, 5580],
      [6405, 7020],
      [7845, 8460],
      [9285, 9900],
    ],
    priceRange: '$',
    restaurantId: '5edd5e127b9d38823bba8533',
    telephone: '(307) 632-6200',
    url: 'https://locations.chipotle.com/wy/cheyenne/1508-dell-range-blvd',
  });
  await location.save();

  // eslint-disable-next-line no-param-reassign
  t.context = {
    fixture: {
      location,
    },
    mongod,
  };
});

test.afterEach(async (t) => {
  await closeMongodbConnection(t.context.mongod);
});

test('Static method updateVeganRating should properly increment vegan rating values', async (t) => {
  const { location } = t.context.fixture;
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
  const { location } = t.context.fixture;

  t.is(location.reviewMeta.veganRating, 0);
});

test('Virtual property reviewMeta.veganRating should give average', async (t) => {
  const { location } = t.context.fixture;
  const total = 20;
  const count = 5;
  const average = total / count;

  location.reviewMeta.veganRatingTotal = total;
  location.reviewMeta.veganRatingCount = count;

  t.is(location.reviewMeta.veganRating, average);
});
