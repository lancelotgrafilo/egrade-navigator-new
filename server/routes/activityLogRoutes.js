// routes/activityLogRoutes.js
const express = require('express');
const { 
  getActivityLogs, 
  logoutActivity
} = require('../controllers/activityLogController');

const router = express.Router();

router.get('/activity-logs', getActivityLogs);
router.post('/logout-activity', logoutActivity);

module.exports = router;
