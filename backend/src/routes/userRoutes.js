const express = require('express');
const router = express.Router();

const userController = require('../controllers/userController');

// Recuperación de contraseña
router.post('/reset-password-request', userController.resetPasswordRequest);
router.post('/reset-password', userController.resetPassword);


router.post('/', userController.createUser);
router.get('/', userController.getUsers);
router.post('/login', userController.loginUser);
router.put('/profile', userController.updateProfile);
router.get('/:id', userController.getUserById);
router.delete('/:id', userController.deleteUser);

module.exports = router;