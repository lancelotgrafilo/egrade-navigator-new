const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const studentModel = require('../models/student'); 
const AdminModel = require('../models/admin');
const CollegeStaffModel = require("../models/collegeStaffModel");
const FacultyStaffModel = require("../models/facultyStaffModel");
const RegistrarStaffModel = require("../models/registrarStaffModel");
const {loginActivity} = require("../controllers/activityLogController");

const postLogin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  let user;
  let userType = '';
  const models = {
    student: studentModel,
    admin: AdminModel,
    college_staff: CollegeStaffModel,
    faculty_staff: FacultyStaffModel,
    registrar_staff: RegistrarStaffModel,
  };

  for (const [key, mdl] of Object.entries(models)) {
    user = await mdl.findOne({ email });
    if (user) {
      userType = key; // Identify the model in which the user was found
      console.log(`User found in ${key} model:`, user);
      break;
    }
  }

  if (!user) {
    console.error("No user found with the provided email:", { email });
    return res.status(401).json({ message: "Invalid email or password" });
  }

  try {
    // Compare the hashed password from the database with the plaintext password
    const isMatch = await bcrypt.compare(password, user.password);
    console.log('Plaintext password:', password);
    console.log('Hashed password from DB:', user.password);
    console.log('Password comparison result:', isMatch);

    if (!isMatch) {
      console.error("Password mismatch for email:", email);
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Update isActive to true
    await user.updateOne({ isActive: true });

    // Prepare the ID response based on user type
    let responseID = '';

    if (userType === 'admin') {
      responseID = user.ID;
    } else if (userType === 'college_staff') {
      responseID = user.ID;
    } else if (userType === 'faculty_staff') {
      responseID = user.facultyID;
    } else if (userType === 'registrar_staff') {
      responseID = user.ID;
    } else if (userType === 'student') {
      responseID = user.schoolID;
    }

    // Include the responseID in the JWT payload
    const tokenPayload = {
      id: user._id,
      title: user.title,
      userId: responseID // Include the ID as a string in the JWT payload
    };

    const token = jwt.sign(tokenPayload, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.json({
      token,
      title: user.title || '',
      userId: responseID, // Send the ID directly in the response
    });

    await loginActivity(responseID, 'logged in');
  } catch (err) {
    console.error("Error during login:", err);
    return res.status(500).json({ message: "An error occurred during login" });
  }
});




module.exports = {
  postLogin,
};
