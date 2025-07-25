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
  // clienteCerro removed: client closure logic deleted
  precio: { type: Number, default: null },
  precioAprobado: { type: Boolean, default: false },
  precioAprobadoFecha: { type: Date, default: null },
  registranteId: { type: String, required: true },
  photos: { type: [String], default: [] },
  pdfReferencia: { type: String, default: '' }
}, { timestamps: true });

module.exports = mongoose.model('Service', serviceSchema);