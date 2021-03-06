const mongoose = require('mongoose');
const validator = require('validator');

const Restaurant = require('./restaurant');

const { model, Schema } = mongoose;

const schema = new Schema({
  address: {
    addressLocality: {
      type: String,
      required: true,
    },
    streetAddress: {
      type: String,
      required: true,
    },
    addressRegion: {
      type: String,
      required: true,
    },
    postalCode: {
      type: String,
      required: true,
      validate: (value) => validator.isPostalCode(value, 'any'),
    },
    addressCountry: {
      type: String,
      required: true,
      validate: validator.isISO31661Alpha2,
    },
  },
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
    type: [{
      start: {
        type: Number,
        min: 0,
        max: 7 * 24 * 60,
        required: true,
        validate: Number.isInteger,
      },
      end: {
        type: Number,
        min: 0,
        max: 7 * 24 * 60,
        required: true,
        validate: Number.isInteger,
      },
    }],
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
schema.index({ address: 1 });

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
