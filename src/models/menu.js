const { model, Schema } = require('mongoose');

const schema = new Schema({
  items: [{
    name: { type: String, required: true },
    modifications: { type: [String], required: true },
    tags: { type: [String], required: true },
  }],
  source: { type: String, required: true },
});

module.exports = model('Menu', schema);
