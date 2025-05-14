const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
  requester: String,
  phone: String,
  address: String,
  workingHours: String,
  serviceType: String,
  details: String,
  reportDate: String,
  observations: { type: [String], default: [] },
  estimatedDuration: String,
  backgroundColor: String,
  takenBy: String
}, { timestamps: true });

module.exports = mongoose.model('Service', serviceSchema);