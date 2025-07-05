const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  worker: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  client: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  service: { type: mongoose.Schema.Types.ObjectId, ref: 'Service', required: true },
  comment: { type: String, required: true },
  stars: { type: Number, min: 1, max: 5, required: true },
  date: { type: Date, default: Date.now },
  publicClientName: { type: String },
});

module.exports = mongoose.model('Review', reviewSchema);
