const express = require('express');
const router = express.Router();
const serviceController = require('../controllers/serviceController');
// const auth = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const upload = multer({ dest: path.join(__dirname, '../uploads') });

// Configuración de multer para subir fotos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../uploads/services'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `${uniqueSuffix}-${file.originalname}`);
  },
});
const uploadPhotos = multer({ storage });

router.post('/', serviceController.createService);
router.get('/', serviceController.getServices);
router.put('/:id', serviceController.updateService);
router.post('/upload-pdf', upload.single('pdf'), serviceController.uploadPdfAndCreateService);
// close-by-client endpoint removed: client closure logic deleted
router.delete('/:id', serviceController.deleteService);
// Ruta para subir fotos de un servicio
router.post('/:serviceId/photos', uploadPhotos.array('photos', 10), serviceController.uploadServicePhotos);

module.exports = router;