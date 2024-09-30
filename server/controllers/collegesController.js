const College = require('../models/collegeModel');

// Controller to get all colleges
const getColleges = async (req, res) => {
  try {
    const colleges = await College.find();
    res.status(200).json(colleges);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching colleges', error });
  }
};

// Controller to add a new college
const addColleges = async (req, res) => {
  const { college } = req.body;

  if (!college) {
    return res.status(400).json({ message: 'College name is required' });
  }

  try {
    const newCollege = new College({ college });
    await newCollege.save();
    res.status(201).json(newCollege);
  } catch (error) {
    res.status(500).json({ message: 'Error adding college', error });
  }
};

module.exports = { getColleges, addColleges };
