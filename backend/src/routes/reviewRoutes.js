const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const reviewAuth = require('../middleware/reviewAuth');

router.post('/', reviewAuth, reviewController.createReview);
router.get('/worker/:workerId', reviewController.getWorkerReviews);
router.get('/worker/:workerId/rating', reviewController.getWorkerRating);

module.exports = router;
