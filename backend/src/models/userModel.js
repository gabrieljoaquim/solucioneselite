const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  profilePhoto: String,
  phone: String,
  address: String,
  specialty: [String],
  experience: Number,
  description: String,
  zone: String,
  rating: Number,
  role: {
    type: String,
    enum: ['cliente', 'trabajador', 'administrador'],
    default: 'cliente',
  },
  resetPasswordToken: String,
  resetPasswordExpires: Date
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);