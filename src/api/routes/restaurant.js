const express = require('express');
const { celebrate, Joi, Segments } = require('celebrate');

const PATH = '/restaurant';

const router = express.Router();

router.get('/:id',
  celebrate({
    [Segments.PARAMS]: Joi.object().keys({
      id: Joi.string().custom((value, helpers) => {
        if (!value || !String(value).match(/^[0-9a-fA-F]{24}$/)) { return helpers.error('any.invalid'); }

        return { value };
      }, 'custom validation'),
    }),
  }),
  (req, res) => {
    res.send('works');
  });

module.exports = {
  router,
  PATH,
};
