// controllers/sectionController.js
const Sections = require('../models/sectionModel');

// Get all year levels
exports.getAllSections = async (req, res) => {
  try {
    const sections = await Sections.find();
    res.json(sections);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

// Add new year level
exports.createSection = async (req, res) => {
  const { section } = req.body;
  try {
    const newSection = new Sections({ section });
    await newSection.save();
    res.status(201).json(newSection);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};
