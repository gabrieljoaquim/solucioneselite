const express = require('express');
const router = express.Router();
const workerSearchController = require('../controllers/workerSearchController');

router.get('/search', workerSearchController.searchWorkers);

module.exports = router;
