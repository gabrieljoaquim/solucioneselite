const express = require('express');
const router = express.Router();
const serviceController = require('../controllers/serviceController');
const multer = require('multer');
const path = require('path');
const upload = multer({ dest: path.join(__dirname, '../uploads') });

router.post('/', serviceController.createService);
router.get('/', serviceController.getServices);
router.put('/:id', serviceController.updateService);
router.post('/upload-pdf', upload.single('pdf'), serviceController.uploadPdfAndCreateService);
router.delete('/:id', serviceController.deleteService);

module.exports = router;