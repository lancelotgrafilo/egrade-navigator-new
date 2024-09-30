// controllers/dashboardController.js
const Subject = require('../models/subject');
const Student = require('../models/student');
const Instructor = require('../models/facultyStaffModel');

exports.getDashboardCounts = async (req, res) => {
  try {
    const subjectsCount = await Subject.countDocuments();
    const studentsCount = await Student.countDocuments();
    const instructorsCount = await Instructor.countDocuments();

    res.status(200).json({
      subjects: subjectsCount,
      students: studentsCount,
      instructors: instructorsCount
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to retrieve dashboard counts', error });
  }
};
