const ActivityLog = require('../models/activityLog'); // Ensure correct path

// Function to log activity
const logActivity = async (userId, activityDescription) => {
  try {
    const activity = new ActivityLog({
      userId: userId, // Store the userId as a string
      activity: activityDescription,
      timestamp: new Date(),
    });

    await activity.save();
    console.log('Activity logged successfully:', activity);
    return activity;
  } catch (error) {
    console.error('Error logging activity:', error);
    throw error;
  }
};

module.exports = {
  logActivity,
};
