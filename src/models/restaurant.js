const mongoose = require('mongoose');
const validator = require('validator');

const { model, Schema } = mongoose;

const schema = new Schema({
  defaultMenuId: {
    type: mongoose.ObjectId,
    required: true,
    ref: 'Menu',
  },
  name: {
    type: String,
    required: true,
    index: true,
    unique: true,
  },
  spider: {
    url: {
      type: String,
      index: true,
      validate: validator.isURL,
    },
    allowedDomain: {
      type: String,
      index: true,
      validate: validator.isURL,
    },
    allow: String,
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
  locationCount: {
    type: Number,
    default: 0,
    min: 0,
    validate: Number.isInteger,
  },
});

schema.index({ name: 'text' });

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

schema.virtual('reviewMeta.veganRating').get(function getVeganRating() {
  if (this.reviewMeta.veganRatingCount === 0) {
    return 0;
  }

  return this.reviewMeta.veganRatingTotal / this.reviewMeta.veganRatingCount;
});

module.exports = model('Restaurant', schema);
