const express = require('express');
const router = express.Router();
const scheduleController = require('../controllers/scheduleController');

router.post('/availability', scheduleController.setAvailability);
router.post('/book', scheduleController.bookAppointment);
router.get('/:workerId', scheduleController.getSchedule);

module.exports = router;
