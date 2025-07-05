const mongoose = require('mongoose');

const scheduleSchema = new mongoose.Schema({
  worker: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  availableSlots: [
    {
      date: { type: String, required: true }, // YYYY-MM-DD
      start: { type: String, required: true }, // HH:mm
      end: { type: String, required: true },   // HH:mm
    },
  ],
  appointments: [
    {
      client: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      date: { type: String, required: true },
      start: { type: String, required: true },
      end: { type: String, required: true },
      status: { type: String, enum: ['pendiente', 'confirmada', 'cancelada'], default: 'pendiente' },
    },
  ],
});

module.exports = mongoose.model('Schedule', scheduleSchema);
