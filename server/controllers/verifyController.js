const express = require('express');
const asyncHandler = require('express-async-handler');
const mongoose = require('mongoose');
const FacultyStaff = require('../models/facultyStaffModel');
const Admin = require('../models/admin');
const CollegeStaff = require('../models/collegeStaffModel');
const Student = require('../models/student');

// Helper function to update verification status in the given model
const updateStatusInModel = async (model, userId) => {
  return await model.findByIdAndUpdate(userId, { isVerified: true }, { new: true });
};

const updateVerificationStatus = asyncHandler(async (req, res) => {
  const { userId } = req.body;

  // Log the request body to ensure data is being received correctly
  console.log('Received request body:', req.body);

  // Validate if userId is present
  if (!userId) {
    console.log(`userId is undefined or missing in the request body: ${JSON.stringify(req.body)}`);
    return res.status(400).json({ success: false, message: 'userId is required' });
  }

  console.log(`Received request to update verification status for userId: ${userId}`);

  try {
    // Convert userId to ObjectId if it's not already
    const ObjectId = mongoose.Types.ObjectId;

    if (!ObjectId.isValid(userId)) {
      console.log(`Invalid userId format: ${userId}`);
      return res.status(400).json({ success: false, message: 'Invalid userId format' });
    }

    // Attempt to update verification status in each model sequentially
    let result = await updateStatusInModel(FacultyStaff, userId);

    if (!result) {
      result = await updateStatusInModel(Admin, userId);
    }

    if (!result) {
      result = await updateStatusInModel(CollegeStaff, userId);
    }

    if (!result) {
      result = await updateStatusInModel(Student, userId);
    }

    // If no result found in any model, return 404 error
    if (!result) {
      console.log(`No user found with userId: ${userId}`);
      return res.status(404).json({ success: false, message: 'User not found in any role' });
    }

    console.log(`Successfully updated verification status for userId: ${userId}`);
    console.log('Updated document:', result);

    // Directly fetch the updated document to confirm
    const updatedDoc = await mongoose.model(result.constructor.modelName).findById(userId);
    console.log('Directly queried document:', updatedDoc);

    res.status(200).json({
      success: true,
      message: `Verification status updated for ${result.constructor.modelName}`,
    });
  } catch (error) {
    console.error(`Error updating verification status for userId: ${userId}`, error);
    res.status(500).json({ success: false, message: 'Failed to update verification status' });
  }
});

module.exports = {
  updateVerificationStatus,
};
