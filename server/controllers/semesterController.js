// controllers/semesterController.js
const Semesters = require('../models/semesterModel');

// Get all year levels
exports.getAllSemesters = async (req, res) => {
  try {
    const semesters = await Semesters.find();
    res.json(semesters);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

// Add new year level
exports.createSemester = async (req, res) => {
  const { semester } = req.body;
  try {
    const newSemester = new Semesters({ semester });
    await newSemester.save();
    res.status(201).json(newSemester);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};
