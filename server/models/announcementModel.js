const { required } = require('joi');
const mongoose = require('mongoose');

const announcementSchema = new mongoose.Schema({
  announcementType: { type: String, required: true },
  message: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  dueDate: { type: Date, required: true },
  instructorID: { type: String, required: false }
},{collection: 'announcements'});

module.exports = mongoose.model('Announcement', announcementSchema);
