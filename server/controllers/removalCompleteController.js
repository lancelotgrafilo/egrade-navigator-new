

const RemovalComplete = require('../models/RemovalComplete');

const getAllRemovalCompletion = async (req, res) => {
  try {
    const data = await RemovalComplete.find(); // Assuming you're using MongoDB with Mongoose
    res.status(200).json(data);
  } catch (err) {
    console.error('Error fetching removal completion data:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getAllRemovalCompletion
}