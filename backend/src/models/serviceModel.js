const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
  requester: String,
  registrante: String,
  phone: String,
  address: String,
  workingHours: String,
  serviceType: String,
  details: String,
  reportDate: String,
  observations: { type: [String], default: [] },
  estimatedDuration: String,
  backgroundColor: { type: String, default: '' },
  takenBy: String,
  takenById: String,
  puntoVentaCodigo: String,
  proveedorAsignado: String,
  nombreOficina: String,
  clienteCerro: { type: Boolean, default: false },
  precio: { type: Number, default: null }
}, { timestamps: true });

module.exports = mongoose.model('Service', serviceSchema);