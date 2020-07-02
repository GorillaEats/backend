const mongoose = require('mongoose');
const validator = require('validator');

const { model, Schema } = mongoose;

const schema = new Schema({
  active: {
    type: Boolean,
    required: true,
  },
  geo: {
    latitude: {
      type: {
        type: String,
        enum: ['Point'],
        required: true,
      },
      coordinates: {
        type: [Number],
        required: true,
        index: '2dsphere',
      },
    },
    longitude: {},
  },
  lastScraperRun: {
    type: Date,
    required: true,
  },
  menuId: {
    type: mongoose.ObjectId,
    required: true,
    ref: 'Menu',
  },
  name: {
    type: String,
    required: true,
  },
  openingHours: {
    type: [[Number]],
    required: true,
  },
  priceRange: {
    type: String,
  },
  restaurantId: {
    type: mongoose.ObjectId,
    required: true,
    index: true,
    ref: 'Restaurant',
  },
  telephone: {
    type: String,
    required: true,
    validate: validator.isMobilePhone,
  },
  url: {
    type: String,
    required: true,
    validate: validator.isURL,
  },
});

module.exports = model('Location', schema);
