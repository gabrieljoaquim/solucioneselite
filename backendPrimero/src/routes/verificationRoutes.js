const express = require('express');
const router = express.Router();
const verificationController = require('../controllers/verificationController');

router.post('/upload', verificationController.uploadDocument);
router.post('/status/:workerId', verificationController.setStatus);
router.get('/:workerId', verificationController.getVerification);

module.exports = router;
