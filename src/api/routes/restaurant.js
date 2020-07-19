const express = require('express');
const { celebrate, Joi, Segments } = require('celebrate');

const Restaurant = require('src/models/restaurant.js');

const PATH = '/restaurant';

const router = express.Router();

router.get('/:id',
  celebrate({
    [Segments.PARAMS]: Joi.object().keys({
      id: Joi.string().custom((id, helpers) => {
        if (!id || !String(id).match(/^[0-9a-fA-F]{24}$/)) { return helpers.error('any.invalid'); }

        return id;
      }, 'custom validation'),
    }),
  }),
  async (req, res) => {
    const { id } = req.params;

    const restaurant = await Restaurant
      .findById(id)
      .lean();

    res.json({ restaurant });
  });

module.exports = {
  router,
  PATH,
};
