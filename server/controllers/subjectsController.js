const Subject = require('../models/subject');
const asyncHandler = require('express-async-handler');
const Joi = require("joi");
const mongoose = require("mongoose");
const multer = require('multer');
const csv = require('csv-parser');
const fs = require("fs");
const path = require('path');  // Import the path module


// @desc    Get Subjects
// @route   GET /api/get_subjects
// @access  Private
const getSubject = asyncHandler(async (req, res) => {
  const { search } = req.query;

  try {
    // Fetch all subjects sorted by department and subject_code
    const allSubjects = await Subject.find()
      .sort({ department: 1, subject_code: 1 }) // Sort by department first, then subject_code
      .exec();

    // Add an index to each subject
    const allSubjectsWithIndex = allSubjects.map((subject, index) => ({
      ...subject.toObject(),
      originalSubjects: index + 1
    }));

    // Apply search filter on the list
    let filteredSubjects = allSubjectsWithIndex;
    if (search) {
      const lowercasedSearch = search.toLowerCase().trim();
      filteredSubjects = allSubjectsWithIndex.filter(subject =>
        [subject.department, subject.subject_code, subject.subject_title, subject.prerequisite, String(subject.unit)].some(field =>
          field.toLowerCase().includes(lowercasedSearch)
        )
      );
    }

    res.status(200).json(filteredSubjects);
  } catch (error) {
    console.error('Error fetching subjects:', error);
    res.status(500).json({ message: 'Failed to get subjects', error: error.message });
  }
});


// Define the validateSubject function here
const validateSubject = (data) => {
  const schema = Joi.object({
    department: Joi.string().required(),
    subject_code: Joi.string().required(),
    subject_title: Joi.string().required(),
    prerequisite: Joi.string().required(),
    unit: Joi.number().required(),
    effective: Joi.string().required(),
    offered: Joi.string().required(),
  });

  return schema.validate(data, { abortEarly: false });
};

// @desc    Post Subjects
// @route   POST /api/post_subjects
// @access  Private
const postSubject = asyncHandler(async (req, res) => {
  const { error, value: validatedData } = validateSubject(req.body);
  if (error) {
    return res.status(400).json({ message: error.details.map(detail => detail.message) });
  }

  const { department, subject_code, subject_title, prerequisite, unit, effective, offered } = validatedData;

  const subject = new Subject({
    department,
    subject_code,
    subject_title,
    prerequisite,
    unit,
    effective,
    offered
  });

  try {
    await subject.save();

    res.status(201).json({ message: "Successfully added new subject", subject });
  } catch (error) {
    console.error('Error saving subject:', error);
    res.status(500).json({
      message: "Error saving subject",
      error: error.message,
    });
  }
});


// @desc    Update Subject
// @route   PUT /api/update_subject/:id
// @access  Private
const updateSubject = asyncHandler(async (req, res) => {
  const { error, value: validatedData } = validateSubject(req.body);
  if (error) {
    return res.status(400).json({ message: error.details.map(detail => detail.message) });
  }

  try {
    const subject = await Subject.findById(req.params.id);

    if (!subject) {
      return res.status(404).json({ message: 'Subject not found' });
    }

    // Update fields
    subject.department = validatedData.department;
    subject.subject_code = validatedData.subject_code;
    subject.subject_title = validatedData.subject_title;
    subject.prerequisite = validatedData.prerequisite;
    subject.unit = validatedData.unit;
    subject.effective = validatedData.effective;
    subject.offered = validatedData.offered;

    const updatedSubject = await subject.save();

    res.status(200).json({ message: 'Subject updated successfully', updatedSubject });

  } catch (error) {
    console.error('Error updating subject:', error);
    res.status(500).json({
      message: 'Failed to update subject',
      error: error.message,
    });
  }
});




// @desc    Get subject by ID
// @route   GET /api/get_subject/:id
// @access  Private 
const getSubjectId = asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  // Validate ID format (MongoDB ObjectId)
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: 'Invalid ID format' });
  }

  try {
    // Fetch the subject by ID
    const subject = await Subject.findById(id);

    // Check if the subject exists
    if (!subject) {
      return res.status(404).json({ message: 'Subject not found' });
    }

    // Send the subject data
    res.status(200).json(subject);
  } catch (error) {
    console.error('Error fetching subject:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @desc    Delete subject
// @route   DELETE /api/del_subject/:id
// @access  Private 
const deleteSubject = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    // Find the subject first to get its details
    const subject = await Subject.findById(id);

    if (!subject) {
      return res.status(404).json({ message: 'Subject not found' });
    }

    // Now delete the subject
    await Subject.findByIdAndDelete(id);

    res.status(200).json({ message: 'Subject deleted successfully' });
  } catch (error) {
    console.error('Error deleting subject:', error); // Optional: log error details
    res.status(500).json({ message: 'Server error', error });
  }
});



// Define the Multer storage configuration (if needed)
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

const upload = multer({ storage });

const uploadSubjectCSV = asyncHandler(async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded.' });
    }

    const filePath = req.file.path;
    const subjects = [];

    // Read the CSV file
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (row) => {
        subjects.push({
          department: row.department,
          subject_code: row.subject_code,
          subject_title: row.subject_title,
          prerequisite: row.prerequisite,
          unit: Number(row.unit),
          effective: row.effective,
          offered: row.offered
        });
      })
      .on('end', async () => {
        try {
          // Save the subjects to the database
          await Subject.insertMany(subjects);
          
          res.status(201).json({ message: 'Subjects uploaded successfully.' });
        } catch (error) {
          console.error('Failed to save subjects:', error);
          res.status(500).json({ message: 'Failed to save subjects.' });
        } finally {
          // Clean up the uploaded file
          fs.unlinkSync(filePath);
        }
      });
  } catch (error) {
    console.error('Failed to process the file:', error);
    res.status(500).json({ message: 'Failed to process the file.' });
  }
});




module.exports = {
  getSubject,
  postSubject,
  updateSubject,
  getSubjectId,
  deleteSubject,
  uploadSubjectCSV
};
