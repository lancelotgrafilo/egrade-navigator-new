const cron = require('node-cron');
const Announcement = require('../models/announcementModel'); // Ensure this path is correct
const connectDB = require('../config/db'); // Ensure this path is correct

// Connect to MongoDB and log connection details once
(async () => {
  try {
    // Await the connection object from connectDB
    const conn = await connectDB();
    
    // Log the connection host if available
    if (conn) {
      console.log(`Cron Job MongoDB Connected: ${conn.connection.host}`);
    }
  } catch (error) {
    console.error('Cron Job MongoDB Connection Error:', error.message);
  }
})();

// Schedule a job to run daily at midnight
cron.schedule('0 0 * * *', async () => {
  try {
    const now = new Date();
    
    // Delete expired announcements where dueDate is before now
    const result = await Announcement.deleteMany({ dueDate: { $lt: now } });
    
    // Log the number of deleted documents
    console.log(`${result.deletedCount} expired announcements deleted.`);
  } catch (error) {
    console.error('Error deleting expired announcements:', error);
  }
});
