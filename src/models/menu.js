const mongoose = require('mongoose');

const { model, Schema } = mongoose;

const schema = new Schema({
  items: [{
    name: { type: String, required: true },
    modifications: { type: [String], required: true },
    tags: { type: [String], default: [] },
    category: {
      type: String,
      enum: ['Entree', 'Side', 'Dessert'],
      required: true,
    },
  }],
  source: { type: String, required: true },
  restaurantId: {
    type: mongoose.ObjectId,
    required: true,
    index: true,
    ref: 'Restaurant',
  },
});

module.exports = model('Menu', schema);
