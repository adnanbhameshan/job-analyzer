const express = require('express');
const { getJobs, addJob, updateJob, deleteJob, getDashboardMetrics } = require('../controllers/jobController.js');
const { protect } = require('../middleware/authMiddleware.js');

const router = express.Router();

router.route('/').get(protect, getJobs).post(protect, addJob);
router.route('/dashboard').get(protect, getDashboardMetrics);
router.route('/:id').put(protect, updateJob).delete(protect, deleteJob);

module.exports = router;
