// routes/dashboardRoutes.js
const express = require('express');
const { getDashboardCounts } = require('../controllers/dashobardController');

const router = express.Router();

router.get('/dashboard-counts', getDashboardCounts);

module.exports = router;
