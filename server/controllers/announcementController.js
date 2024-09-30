// Controller
const Announcement = require('../models/announcementModel');

// Get all announcements
exports.getAnnouncements = async (req, res) => {
  try {
    // Optionally, include filtering logic for specific announcements if needed
    const { announcementType } = req.query;
    const query = announcementType ? { announcementType } : {};
    const announcements = await Announcement.find(query);
    res.json(announcements);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching announcements', error });
  }
};

// Add a new announcement
exports.createAnnouncement = async (req, res) => {
  const { announcementType, message, dueDate, instructorID } = req.body;
  try {
    const newAnnouncement = new Announcement({
      announcementType,
      message,
      dueDate: dueDate ? new Date(dueDate) : null, // Convert dueDate to a Date object if provided
      instructorID: announcementType === 'specific' ? instructorID : undefined // Set instructorID only if the announcement is specific
    });
    await newAnnouncement.save();

    res.status(201).json(newAnnouncement);
  } catch (error) {
    res.status(500).json({ message: 'Error creating announcement', error });
  }
};
