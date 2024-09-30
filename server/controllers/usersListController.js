// controllers/usersListController.js

const Admin = require('../models/admin');
const CollegeStaff = require('../models/collegeStaffModel');
const RegistrarStaff = require('../models/registrarStaffModel');
const FacultyStaff = require('../models/facultyStaffModel');

const getAllUsers = async (req, res) => {
  try {
    const [admins, collegeStaff, registrarStaff, facultyStaff] = await Promise.all([
      Admin.find({}, 'ID last_name first_name middle_initial title'),
      CollegeStaff.find({}, 'ID last_name first_name middle_initial title'),
      RegistrarStaff.find({}, 'ID last_name first_name middle_initial title'),
      FacultyStaff.find({}, 'ID last_name first_name middle_initial title')
    ]);

    const allUsers = {
      admins,
      collegeStaff,
      registrarStaff,
      facultyStaff
    };

    res.status(200).json(allUsers);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving users', error });
  }
};

const deleteUser = async (req, res) => {
  const { id, userType } = req.params;

  try {
    let result;
    switch (userType) {
      case 'admin':
        result = await Admin.findByIdAndDelete(id);
        break;
      case 'collegeStaff':
        result = await CollegeStaff.findByIdAndDelete(id);
        break;
      case 'registrarStaff':
        result = await RegistrarStaff.findByIdAndDelete(id);
        break;
      case 'facultyStaff':
        result = await FacultyStaff.findByIdAndDelete(id);
        break;
      default:
        return res.status(400).json({ message: 'Invalid user type' });
    }

    if (!result) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting user', error });
  }
};

module.exports = {
  getAllUsers,
  deleteUser
};
