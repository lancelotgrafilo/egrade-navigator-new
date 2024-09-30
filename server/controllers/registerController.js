const express = require('express');
const asyncHandler = require('express-async-handler');
const studentModel = require('../models/student');
const confirmStudentModel = require('../models/confirmStudentModel');
const Joi = require('joi');
const { v4: uuidv4 } = require('uuid');

const {
  sendRegisterCompleted,
  sendApprovalEmail,
  sendRejectionEmail
} = require("../controllers/emailRegController");

const registrationSchema = Joi.object({
  last_name: Joi.string().required(),
  first_name: Joi.string().required(),
  middle_initial: Joi.string().required(),
  schoolID: Joi.string().required(),
  email: Joi.string().email().required(),
  password: Joi.string().required()
});

const validateRegistration = (data) => {
  return registrationSchema.validate(data);
};

const postRegister = asyncHandler(async (req, res) => {
  const { error } = validateRegistration(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  const { last_name, first_name, middle_initial, schoolID, email, password } = req.body;

  // Check if the email already exists
  const existingStudent = await studentModel.findOne({ email });
  if (existingStudent) {
    return res.status(400).json({ message: "Email already registered" });
  }

  const student = new studentModel({ 
    last_name, 
    first_name, 
    middle_initial, 
    schoolID, 
    email, 
    password 
  });

  await student.save();
  res.status(201).json({ message: "Registration successful" });
});

const registerCompleted = asyncHandler(async (req, res) => {
  const { error } = validateRegistration(req.body);
  if (error) {
    console.log('Validation Error:', error.details[0].message);
    return res.status(400).json({ message: error.details[0].message });
  }

  const { last_name, first_name, middle_initial, schoolID, email, password } = req.body;

  try {
    // Check if the email already exists in confirmStudentModel
    const existingStudent = await confirmStudentModel.findOne({ email });
    if (existingStudent) {
      console.log('Email already registered in confirmStudentModel');
      return res.status(400).json({ message: "Email already registered" });
    }

    // Check if the email already exists in studentModel
    const existingStudentInStudentModel = await studentModel.findOne({ email });
    if (existingStudentInStudentModel) {
      console.log('Email already registered in studentModel');
      return res.status(400).json({ message: "Email already registered" });
    }

    // Create and save the new student
    const student = new confirmStudentModel({ 
      last_name, 
      first_name, 
      middle_initial, 
      schoolID, 
      email, 
      password 
    });

    // Send the registration completion email
    try {
      console.log('Calling sendRegisterCompleted...');
      await sendRegisterCompleted(email);

      await student.save();
      console.log('Student saved successfully');

      console.log('sendRegisterCompleted executed.');
      console.log('Email sent successfully');
      return res.status(201).json({ message: "Registration successful" });
    } catch (emailError) {
      console.error('Failed to send email:', emailError);
      return res.status(500).json({ message: 'Failed to send email' });
    }
  } catch (dbError) {
    console.error('Database error:', dbError);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
});


// Approve a student
const approveStudent = asyncHandler(async (req, res) => {
  const studentId = req.params.id;

  try {
    // Find the student in confirmStudentModel
    const student = await confirmStudentModel.findById({_id : studentId});
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Create and save the student in studentModel
    const newStudent = new studentModel(student.toObject());
    await newStudent.save();

    // Remove the student from confirmStudentModel
    await confirmStudentModel.findByIdAndDelete({_id : studentId});

    // Send the registration completion email
    try {
      await sendApprovalEmail(student.email);
    } catch (emailError) {
      console.error('Failed to send email:', emailError);
    }

    res.status(200).json({ message: 'Student approved and registered successfully' });
  } catch (error) {
    console.error('Error approving student:', error);
    res.status(500).json({ message: 'Failed to approve student' });
  }
});

// Reject a student
const rejectStudent = asyncHandler(async (req, res) => {
  const studentId = req.params.id;

  try {
    // Find and remove the student from confirmStudentModel
    const student = await confirmStudentModel.findByIdAndDelete({_id : studentId});
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    try {
      await sendRejectionEmail(student.email);
    } catch (emailError) {
      console.error('Failed to send rejection email:', emailError);
    }

    res.status(200).json({ message: 'Student rejected successfully' });
  } catch (error) {
    console.error('Error rejecting student:', error);
    res.status(500).json({ message: 'Failed to reject student' });
  }
});


const getAllConfirmStudents = async (req, res) => {
  try {
    const students = await confirmStudentModel.find();
    res.status(200).json(students);
  } catch (error) {
    console.error('Error fetching students:', error);
    res.status(500).json({ message: 'Failed to fetch students' });
  }
};




module.exports = {
  postRegister,
  registerCompleted,
  approveStudent,
  rejectStudent,
  getAllConfirmStudents
};
