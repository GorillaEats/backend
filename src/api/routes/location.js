const express = require('express');
const { celebrate, Joi, Segments } = require('celebrate');

const Location = require('src/models/location.js');

const PATH = '/locations';
const MAX_DOCUMENTS = 25;
const MAX_DISTANCE_METERS = 20 * 1609;

const router = express.Router();

router.get('/',
  celebrate({
    [Segments.QUERY]: Joi.object().keys({
      filter: Joi.object().keys({
        lat: Joi.number().max(90).min(-90).required(),
        long: Joi.number().max(180).min(-180).required(),
        radius: Joi.number().max(MAX_DISTANCE_METERS).min(0).required(),
        veganRating: Joi.number().valid(2.5, 3.5, 4.5),
        open: Joi.number().integer().max(7 * 24 * 60).min(0),
      }).required(),
      options: Joi.object().keys({
        limit: Joi
          .number()
          .integer()
          .max(MAX_DOCUMENTS)
          .min(0)
          .default(MAX_DOCUMENTS),
      }),
    }),
  }),
  async (req, res) => {
    const { filter, options } = req.query;
    const mongoFilter = {};

    // Required filters
    mongoFilter.geo = {
      $nearSphere: {
        $geometry: {
          type: 'Point',
          coordinates: [filter.long, filter.lat],
        },
        $maxDistance: filter.radius,
        $minDistance: 0,
      },
    };

    // Optional filters
    if (filter.open) {
      mongoFilter.openingHours = {
        $elemMatch: {
          start: { $lte: filter.open },
          end: { $gte: filter.open },
        },
      };
    }

    if (filter.veganRating) {
      mongoFilter.$expr = {
        $gte: [
          {
            $cond: [
              {
                $eq: ['$reviewMeta.veganRatingCount', 0],
              },
              0,
              {
                $divide: ['$reviewMeta.veganRatingTotal', '$reviewMeta.veganRatingCount'],
              },
            ],
          },
          filter.veganRating,
        ],
      };
    }

    const locations = await Location
      .find(mongoFilter, null, options)
      .lean();
    res.json({ locations });
  });

module.exports = {
  router,
  PATH,
};
