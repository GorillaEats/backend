const express = require('express');

const Location = require('src/models/location.js');

const PATH = '/locations';
const MAX_DOCUMENTS = 25;
const MAX_DISTANCE_METERS = 20 * 1609;

const router = express.Router();

router.get('/', async (req, res) => {
  const { filter, options } = req.query;
  const checkedFilter = {};
  const checkedOptions = { limit: MAX_DOCUMENTS };

  if (filter) {
    if (filter.geo) {
      checkedFilter.geo = {
        $nearSphere: {
          $geometry: {
            type: 'Point',
            coordinates: filter.geo.$near.$geometry.coordinates,
          },
          $maxDistance: Math.min(filter.geo.$near.$maxDistance, MAX_DISTANCE_METERS),
          $minDistance: 0,
        },
      };
    }
  }

  if (options) {
    if (options.limit) {
      checkedOptions.limit = Math.min(MAX_DOCUMENTS, options.limit);
    }
  }

  const locations = await Location.find(checkedFilter, null, checkedOptions);

  res.json({ locations });
});

module.exports = {
  router,
  PATH,
};
