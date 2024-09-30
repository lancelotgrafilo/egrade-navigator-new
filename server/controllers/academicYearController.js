// controllers/academicYearController.js
const AcademicYear = require('../models/academicYearModel');

// Get all academic years
exports.getAllAcademicYears = async (req, res) => {
  try {
    const years = await AcademicYear.find();
    res.json(years);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

// Add new academic year
exports.createAcademicYear = async (req, res) => {
  const { ay } = req.body;
  try {
    const newYear = new AcademicYear({ ay });
    await newYear.save();
    res.status(201).json(newYear);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};
