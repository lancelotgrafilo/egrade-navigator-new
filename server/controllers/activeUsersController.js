// controllers/activeUsersController.js
const studentModel = require('../models/student'); 
const facultyStaffModel = require('../models/facultyStaffModel'); 
const collegeStaffModel = require('../models/collegeStaffModel'); 
const adminModel = require('../models/admin'); 

// Function to get all users
const getAllUsers = async (req, res) => {
  try {
    // Fetch all students, faculty staff, college staff, and admins
    const [students, facultyStaff, collegeStaff, admins] = await Promise.all([
      studentModel.find({}),
      facultyStaffModel.find({}),
      collegeStaffModel.find({}),
      adminModel.find({}),
    ]);

    // Combine all users
    const allUsers = {
      students,
      facultyStaff,
      collegeStaff,
      admins
    };

    res.status(200).json(allUsers);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching users', error });
  }
};

module.exports = { getAllUsers };
