const Admin = require('../models/admin');
const CollegeStaff = require('../models/collegeStaffModel');
const RegistrarStaff = require('../models/registrarStaffModel');
const FacultyStaff = require('../models/facultyStaffModel');
const StudentModel = require('../models/student');
const bcrypt = require('bcryptjs');


exports.changePassword = async (req, res) => {
  const { email, password } = req.body;

  try {
    console.log('Received request to change password for:', email);

    // Find the user in all possible collections
    let user;
    user = await Admin.findOne({ email }) ||
           await CollegeStaff.findOne({ email }) ||
           await RegistrarStaff.findOne({ email }) ||
           await FacultyStaff.findOne({ email }) ||
           await StudentModel.findOne({ email });

    if (!user) {
      console.log('User not found');
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Hash the new password before saving
    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;
    await user.save();

    console.log('Password changed successfully for:', user.email);
    res.status(200).json({ success: true, message: 'Password changed successfully' });
  } catch (error) {
    console.error('Error while changing password:', error);
    res.status(500).json({ success: false, message: 'An error occurred while changing the password', error });
  }
};
