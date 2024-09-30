const activityLogService = require('../services/activityLogService'); // Ensure correct path
const ActivityLog = require("../models/activityLog");

// Get all activity logs
exports.getActivityLogs = async (req, res) => {
  try {
    const logs = await ActivityLog.find().populate('userId', 'username').sort({ timestamp: -1 });
    res.status(200).json(logs);
  } catch (error) {
    console.error('Error fetching activity logs:', error); // Ensure this logs the full error
    res.status(500).json({ message: 'Error fetching activity logs', error: error.message || 'Unknown error' });
  }
};

// Controller for login activity
exports.loginActivity = async (userIDs, activityDescription) => {
  try {
    // Extract the appropriate user ID
    const userId = userIDs.admin || userIDs.cs || userIDs.fs || userIDs.rs || userIDs.student;

    if (!userId) {
      console.error('No valid user ID found in userIDs:', userIDs);
      return;
    }

    console.log('loginActivity called with:');
    console.log('userId:', userId);
    console.log('activityDescription:', activityDescription);

    await activityLogService.logActivity(userId, activityDescription);
  } catch (error) {
    console.error('Error logging activity:', error);
  }
};

// Controller for logout activity
exports.logoutActivity = async (req, res) => {
  const { userID, activityDescription } = req.body;
  try {
    await activityLogService.logActivity(userID, activityDescription); // Correct function call
    res.status(200).send({ message: 'Activity logged successfully' });
  } catch (error) {
    res.status(500).send({ error: 'Error logging activity' });
  }
};
