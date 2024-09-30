// controllers/yearLevelController.js
const YearLevel = require('../models/yearLevelModel');

// Get all year levels
exports.getAllYearLevels = async (req, res) => {
  try {
    const yearLevels = await YearLevel.find();
    res.json(yearLevels);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

// Add new year level
exports.createYearLevel = async (req, res) => {
  const { yearLevel } = req.body;
  try {
    const newYearLevel = new YearLevel({ yearLevel });
    await newYearLevel.save();
    res.status(201).json(newYearLevel);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};
