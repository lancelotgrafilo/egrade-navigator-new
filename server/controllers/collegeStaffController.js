const express = require('express');
const asyncHandler = require('express-async-handler');
const collegeStaffModel = require('../models/collegeStaffModel');
const Joi = require('joi');
const bcrypt = require('bcryptjs');
const mongoose = require("mongoose");
const fs = require('fs');
const path = require('path');

const { sendEmailSuccess } = require('./emailSuccessController');

const generateRandomPassword = (length = 6 ) => {
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let password = '';
  for ( let i = 0; i < length; i++){
    const randomIndex = Math.floor(Math.random() * charset.length);
    password += charset[randomIndex];
  }
  return password;
}

const collegeStaffSchema = Joi.object({
  ID: Joi.string().default("cs-001"),
  last_name: Joi.string().required(),
  first_name: Joi.string().required(),
  middle_initial: Joi.string().required(),
  email: Joi.string().email({ tlds: { allow: false } }).required(),
  isActive: Joi.boolean().default(true), // Default value added
  createdAt: Joi.date().default(Date.now), // Default value added
});

const validateCollegeStaff = (data) => {
  return collegeStaffSchema.validate(data, { abortEarly: false }); // Ensure all errors are captured
};

const postCollegeStaff = asyncHandler(async (req, res) => {
  // Validate and apply default values
  const { error, value: validatedData } = validateCollegeStaff(req.body);

  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  const { ID, last_name, first_name, middle_initial, password, email, isActive, createdAt } = validatedData;

  // Check if the email already exists
  const existingCollegeStaff = await collegeStaffModel.findOne({ email });
  if (existingCollegeStaff) {
    return res.status(400).json({ message: "Email already registered" });
  }

  const generatedPassword = generateRandomPassword();
  const plainPassword = generatedPassword;
  const hashedPassword = await bcrypt.hash(generatedPassword, 10); // 10 is the salt rounds

  const collegeStaff = new collegeStaffModel({
    ID,
    last_name,
    first_name,
    middle_initial,
    password: hashedPassword, // Store hashed password
    email,
    isActive,
    createdAt,
  });


  try {
    await collegeStaff.save();

    await sendEmailSuccess({
      email,
      plainPassword
    });

    res.status(201).json({ message: "Successfully Added New College Staff" });
  

  } catch(err) {
    console.error('Error saving college staff:', err);
    res.status(500).json({
      message: "Failed to add college staff"
    })
  }
  
});

// @desc    Get admin Details by userId
// @route   GET /api/get_admin_details/:id
// @access  Private
const getCollegeStaffDetails = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Validate ObjectId format
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: 'Invalid userId format' });
  }

  try {
    // Fetch user by id
    const user = await collegeStaffModel.findById(id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error('Error fetching user details:', error);
    res.status(500).json({ message: 'Failed to fetch user details', error: error.message });
  }
});


const updateCollegeStaffDetails = asyncHandler(async (req, res) => {
  try {
    const { userId } = req.params;
    const { currentPassword, newPassword } = req.body;
    const updatedData = req.body;

    // Handle password update if both current and new passwords are provided
    if (currentPassword && newPassword) {
      const admin = await collegeStaffModel.findById(userId);
      if (!admin) {
        return res.status(404).json({ message: 'College Staff not found' });
      }

      const isMatch = await bcrypt.compare(currentPassword, admin.password);
      if (!isMatch) {
        return res.status(400).json({ message: 'Current password is incorrect' });
      }

      // Hash the new password before updating
      const hashedNewPassword = await bcrypt.hash(newPassword, 12);
      updatedData.password = hashedNewPassword;
    }

    // Handle profile image update
    if (req.file) {
      const admin = await collegeStaffModel.findById(userId);
      if (!admin) {
        return res.status(404).json({ message: 'College Staff not found' });
      }

      // Get the current profile image path
      const oldImage = admin.user_profile;

      // Update the profile with the new image path
      updatedData.user_profile = `/uploads/user-profiles/${req.file.filename}`;

      // Delete the old image file if it exists
      if (oldImage && fs.existsSync(path.join(__dirname, '..', 'public', oldImage))) {
        fs.unlink(path.join(__dirname, '..', 'public', oldImage), (err) => {
          if (err) console.error('Failed to delete old image:', err);
        });
      }
    }

    // Update college staff details
    const admin = await collegeStaffModel.findByIdAndUpdate(userId, updatedData, { new: true });

    if (!admin) {
      return res.status(404).json({ message: 'College Staff not found' });
    }

    res.status(200).json({ message: 'User details updated successfully', admin });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});



const validateCurrentPassword = async (req, res) => {
  try {
    const { userId, currentPassword } = req.body;

    if (!userId || !currentPassword) {
      return res.status(400).json({ message: 'User ID and current password are required' });
    }

    const admin = await collegeStaffModel.findById(userId);

    if (!admin) {
      return res.status(404).json({ message: 'Admin member not found' });
    }

    const isMatch = await bcrypt.compare(currentPassword, admin.password);

    if (isMatch) {
      return res.status(200).json({ valid: true });
    } else {
      return res.status(400).json({ valid: false });
    }
  } catch (error) {
    console.error('Error validating current password:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const updateUserStatus = async (req, res) => {
  const { userId } = req.params;
  const { isActive } = req.body; // Expecting { isActive: false }

  try {
    // Find user by ID and update the isActive field
    const updatedUser = await collegeStaffModel.findByIdAndUpdate(
      userId,
      { isActive },
      { new: true } // Return the updated document
    );

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({ message: 'User status updated successfully', user: updatedUser });
  } catch (error) {
    console.error('Error updating user status:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  postCollegeStaff,
  getCollegeStaffDetails,
  updateCollegeStaffDetails,
  validateCurrentPassword,
  updateUserStatus
};
