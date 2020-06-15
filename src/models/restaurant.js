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
      validator: validator.isURL,
    },
  },
  allowedDomain: {
    type: String,
    required: true,
    index: true,
    unique: true,
    validate: {
      validator: validator.isURL,
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
      },
    },
    veganRatingCount: {
      type: Number,
      default: 0,
      min: 0,
      validate: {
        validator: Number.isInteger,
      },
    },
  },
  locationCount: {
    type: Number,
    default: 0,
    min: 0,
    validate: {
      validator: Number.isInteger,
    },
  },
});

schema.statics.updateVeganRating = function updateVeganRating(_id, ratingTotal, ratingCount) {
  return this.updateOne(
    { _id },
    {
      $inc: {
        'reviewMeta.veganRatingTotal': ratingTotal,
        'reviewMeta.veganRatingCount': ratingCount,
      },
    },
  );
};

schema.index({ name: 'text' });

module.exports = model('Restaurants', schema);
