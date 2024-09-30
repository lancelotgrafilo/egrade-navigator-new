const gradeSheetModel = require('../models/gradeSheetModel');

const getAllGradeSheet = async (req, res) => {
  try {
    const gradeSheets = await gradeSheetModel.find(); // Fetch all grade sheets from the database
    res.status(200).json(gradeSheets);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving grade sheets', error });
  }
}

module.exports = {
  getAllGradeSheet,
};
