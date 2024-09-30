// models/ActivityLog.js
const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  activity: { type: String, required: true }, // e.g., "logged in", "added student"
  timestamp: { type: Date, default: Date.now }
}, {collection: "activityLogs"});

module.exports = mongoose.model('ActivityLog', activityLogSchema);
