const express = require('express');
const { celebrate, Joi, Segments } = require('celebrate');
const validator = require('validator');

const Location = require('src/models/location.js');

const PATH = '/locations';
const MAX_DOCUMENTS = 25;
const MAX_DISTANCE_METERS = 20 * 1609;

const router = express.Router();

router.get('/',
  celebrate({
    [Segments.QUERY]: Joi.object().keys({
      filter: Joi.object().keys({
        geo: Joi.object().keys({
          $nearSphere: Joi.object().keys({
            $geometry: Joi.object().keys({
              type: Joi.string().valid('Point').default('Point'),
              coordinates: Joi
                .array()
                .items(Joi.number())
                .length(2)
                .required()
                .custom((value, helpers) => {
                  if (validator.isLatLong(`${value[1]},${value[0]}`)) {
                    return value;
                  }
                  return helpers.error('any.invalid');
                }),
            }),
            $minDistance: Joi.number().valid(0).default(0),
            $maxDistance: Joi
              .number()
              .max(MAX_DISTANCE_METERS)
              .min(0)
              .required(),
          }),
        }),
      }),
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
    const locations = await Location.find(filter, null, options);
    res.json({ locations });
  });

module.exports = {
  router,
  PATH,
};
