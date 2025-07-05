const mongoose = require('mongoose');

const gallerySchema = new mongoose.Schema({
  worker: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [
    {
      imageUrl: { type: String, required: true },
      description: { type: String },
      uploadedAt: { type: Date, default: Date.now },
    },
  ],
});

module.exports = mongoose.model('Gallery', gallerySchema);
