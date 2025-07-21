const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');

// Bandeja de entrada del usuario (trabajador)
router.get('/inbox/:userId', messageController.getInbox);

// Obtener mensajes entre dos usuarios
router.get('/:userId/:expertId', messageController.getMessages);

// Enviar mensaje
router.post('/', messageController.sendMessage);

module.exports = router;
