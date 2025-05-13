const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');

// Obtener mensajes entre dos usuarios
router.get('/:userId/:expertId', messageController.getMessages);

// Enviar mensaje
router.post('/', messageController.sendMessage);

module.exports = router;
