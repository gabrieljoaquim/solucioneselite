const Gallery = require('../models/galleryModel');

exports.addGalleryItem = async (req, res) => {
  try {
    const { worker, imageUrl, description } = req.body;
    let gallery = await Gallery.findOne({ worker });
    if (!gallery) gallery = new Gallery({ worker, items: [] });
    gallery.items.push({ imageUrl, description });
    await gallery.save();
    res.status(201).json(gallery);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.getGallery = async (req, res) => {
  try {
    const { workerId } = req.params;
    const gallery = await Gallery.findOne({ worker: workerId });
    res.json(gallery);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
