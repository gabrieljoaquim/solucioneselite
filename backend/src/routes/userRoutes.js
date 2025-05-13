const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

router.post('/', userController.createUser);
router.get('/', userController.getUsers);
router.post('/login', userController.loginUser);
router.put('/profile', userController.updateProfile);
router.get('/:id', userController.getUserById);

module.exports = router;