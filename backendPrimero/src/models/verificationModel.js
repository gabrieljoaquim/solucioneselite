const mongoose = require('mongoose');

const verificationSchema = new mongoose.Schema({
  worker: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  documents: [{
    type: { type: String, required: true }, // cédula, RUT, etc
    url: { type: String, required: true },
    uploadedAt: { type: Date, default: Date.now },
  }],
  status: { type: String, enum: ['pendiente', 'verificado', 'rechazado'], default: 'pendiente' },
  reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  reviewedAt: { type: Date },
});

module.exports = mongoose.model('Verification', verificationSchema);
