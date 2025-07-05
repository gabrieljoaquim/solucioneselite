const express = require('express');
const router = express.Router();
const galleryController = require('../controllers/galleryController');

router.post('/add', galleryController.addGalleryItem);
router.get('/:workerId', galleryController.getGallery);

module.exports = router;
