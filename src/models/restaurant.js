const { model, Schema } = require('mongoose');
const validator = require('validator');

const schema = new Schema({
  name: {
    type: String,
    required: true,
    index: true,
    unique: true,
  },
  url: {
    type: String,
    required: true,
    index: true,
    unique: true,
    validate: {
      validator: (value) => validator.isURL(value, {
        protocols: ['http', 'https'],
        require_protocol: true,
      }),
      message: (props) => `${props.value} is not a proper URL`,
    },
  },
  allowedDomain: {
    type: String,
    required: true,
    index: true,
    unique: true,
    validate: {
      validator: (value) => validator.isURL(value, {
        require_protocol: false,
      }),
      message: (props) => `${props.value} is not a proper URL`,
    },
  },
  allow: { type: String, required: true },
  reviewMeta: {
    veganRatingTotal: {
      type: Number,
      default: 0,
      min: 0,
      validate: {
        validator: Number.isInteger,
        message: (props) => `${props.value} is not an integer value`,
      },
    },
    veganRatingCount: {
      type: Number,
      default: 0,
      min: 0,
      validate: {
        validator: Number.isInteger,
        message: (props) => `${props.value} is not an integer value`,
      },
    },
  },
  locationCount: {
    type: Number,
    default: 0,
    min: 0,
    validate: {
      validator: Number.isInteger,
      message: (props) => `${props.value} is not an integer value`,
    },
  },
});

schema.index({ name: 'text' });

module.exports = model('Restaurants', schema);
