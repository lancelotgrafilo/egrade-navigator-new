const express = require('express');
const asyncHandler = require('express-async-handler');
const adminModel = require('../models/admin');
const Joi = require('joi');
const bcrypt = require('bcryptjs');
const mongoose = require("mongoose");
const fs = require('fs');
const path = require('path');
const { sendEmailSuccess } = require('./emailSuccessController');


// Function to generate a random password
const generateRandomPassword = (length = 6) => {
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let password = '';
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * charset.length);
    password += charset[randomIndex];
  }
  return password;
};

// Adjusted Joi schema to include new fields without default password value
const adminSchema = Joi.object({
  ID: Joi.string().default("admin-001"),
  last_name: Joi.string().required(),
  first_name: Joi.string().required(),
  middle_initial: Joi.string().required(),
  email: Joi.string().email({ tlds: { allow: false } }).required(),
  isActive: Joi.boolean().default(true),
  createdAt: Joi.date().default(Date.now),
});

const validateAdmin = (data) => {
  return adminSchema.validate(data, { abortEarly: false });
};

const postAdmin = asyncHandler(async (req, res) => {
  // Validate and apply default values
  const { error, value: validatedData } = validateAdmin(req.body);

  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  const { ID, last_name, first_name, middle_initial, email, isActive, createdAt } = validatedData;

  // Check if the email already exists
  const existingAdmin = await adminModel.findOne({ email });
  if (existingAdmin) {
    return res.status(400).json({ message: "Email already registered" });
  }

  // Generate and hash the random password
  const generatedPassword = generateRandomPassword();
  const plainPassword = generatedPassword;
  const hashedPassword = await bcrypt.hash(generatedPassword, 10); 

  const admin = new adminModel({
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
    // Save the admin to the database
    await admin.save();
    
    // Call sendEmailSuccess with the required information
    await sendEmailSuccess({
      email,
      plainPassword
    });

    res.status(201).json({
      message: "Successfully Added New Admin",
    });

  } catch (err) {
    console.error('Error saving admin:', err);
    res.status(500).json({ message: "Failed to add admin", error: err });
  }
});

// @desc    Get admin Details by userId
// @route   GET /api/get_admin_details/:id
// @access  Private
const getAdminDetails = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Validate ObjectId format
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: 'Invalid userId format' });
  }

  try {
    // Fetch user by id
    const user = await adminModel.findById(id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error('Error fetching user details:', error);
    res.status(500).json({ message: 'Failed to fetch user details', error: error.message });
  }
});


const validateCurrentPassword = async (req, res) => {
  try {
    const { userId, currentPassword } = req.body;

    if (!userId || !currentPassword) {
      return res.status(400).json({ message: 'User ID and current password are required' });
    }

    const admin = await adminModel.findById(userId);

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


const updateAdminDetails = async (req, res) => {
  try {
    const { userId } = req.params;
    const { currentPassword, newPassword } = req.body;
    const updatedData = req.body;

    // Handle password update if both current and new passwords are provided
    if (currentPassword && newPassword) {
      const admin = await adminModel.findById(userId);
      if (!admin) {
        return res.status(404).json({ message: 'Admin not found' });
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
      const admin = await adminModel.findById(userId);
      if (!admin) {
        return res.status(404).json({ message: 'Admin not found' });
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

    // Update admin details
    const admin = await adminModel.findByIdAndUpdate(userId, updatedData, { new: true });

    if (!admin) {
      return res.status(404).json({ message: 'Admin not found' });
    }

    res.status(200).json({ message: 'User details updated successfully', admin });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};


const updateUserStatus = async (req, res) => {
  const { userId } = req.params;
  const { isActive } = req.body; // Expecting { isActive: false }

  try {
    // Find user by ID and update the isActive field
    const updatedUser = await adminModel.findByIdAndUpdate(
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
  postAdmin,
  getAdminDetails,
  validateCurrentPassword,
  updateAdminDetails,
  updateUserStatus
};
