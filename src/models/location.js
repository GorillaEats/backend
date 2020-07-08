const mongoose = require('mongoose');
const validator = require('validator');

const Restaurant = require('./restaurant');

const { model, Schema } = mongoose;

const schema = new Schema({
  geo: {
    type: {
      type: String,
      enum: ['Point'],
      required: true,
    },
    coordinates: {
      type: [Number],
      required: true,
    },
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
    required: true,
  },
  restaurantId: {
    type: mongoose.ObjectId,
    required: true,
    index: true,
    ref: 'Restaurant',
  },
  reviewMeta: {
    veganRatingTotal: {
      type: Number,
      default: 0,
      min: 0,
      validate: Number.isInteger,
    },
    veganRatingCount: {
      type: Number,
      default: 0,
      min: 0,
      validate: Number.isInteger,
    },
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

schema.index({ geo: '2dsphere' });

schema.statics.updateVeganRating = function updateVeganRating(
  _id, restaurantId, ratingTotal, ratingCount,
) {
  return Promise.all([
    Restaurant.updateVeganRating(restaurantId, ratingTotal, ratingCount),
    this.updateOne(
      { _id },
      {
        $inc: {
          'reviewMeta.veganRatingTotal': ratingTotal,
          'reviewMeta.veganRatingCount': ratingCount,
        },
      },
    ),
  ]);
};

schema.virtual('reviewMeta.veganRating').get(function getVeganRating() {
  if (this.reviewMeta.veganRatingCount === 0) {
    return 0;
  }

  return this.reviewMeta.veganRatingTotal / this.reviewMeta.veganRatingCount;
});

module.exports = model('Location', schema);
