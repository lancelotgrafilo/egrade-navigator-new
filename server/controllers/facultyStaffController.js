const express = require('express');
const asyncHandler = require('express-async-handler');
const facultyStaffModel = require('../models/facultyStaffModel');
const Joi = require('joi');
const bcrypt = require('bcryptjs');
const csv = require('csv-parser');
const fs = require("fs");
const path = require('path');  // Import the path module
const multer = require('multer');
const mongoose = require('mongoose');
mongoose.set('debug', true);
const { Worker } = require('worker_threads');
const stream = require('stream');

const {logActivity} = require('../services/activityLogService');

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


const facultyStaffSchema = Joi.object({
  ID: Joi.string().default("fs-001"),
  facultyID: Joi.string().required(),
  last_name: Joi.string().required(),
  first_name: Joi.string().required(),
  middle_initial: Joi.string().required(),
  department: Joi.string().required(),
  contact_number: Joi.string().required(), 
  email: Joi.string().email({ tlds: { allow: false } }).required(),
  subjects: Joi.array().items(Joi.any()).default([]), // Default value added
  isActive: Joi.boolean().default(true), // Default value added
  createdAt: Joi.date().default(Date.now), // Default value added
});

const validateFacultyStaff = (data) => {
  return facultyStaffSchema.validate(data, { abortEarly: false }); // Ensure all errors are captured
};

// @desc    Post Faculty Staffs
// @route   GET /api/fetch_faculty_staffs
// @access  Private
const postFacultyStaff = asyncHandler(async (req, res) => {
  // Validate and apply default values
  const { error, value: validatedData } = validateFacultyStaff(req.body);

  if (error) {
    console.log("Validation Error:", error.details); // Debugging line
    return res.status(400).json({ message: error.details[0].message });
  }

  const { ID, facultyID, last_name, first_name, middle_initial, department, contact_number, password, email, isActive, createdAt } = validatedData;
  
  const generatedPassword = generateRandomPassword();
  const plainPassword = generatedPassword;
  const hashedPassword = await bcrypt.hash(generatedPassword, 10); 

  const facultyStaff = new facultyStaffModel({
    ID,
    facultyID,
    last_name,
    first_name,
    middle_initial,
    department,
    contact_number,
    password: hashedPassword, 
    email,
    isActive,
    createdAt,
  });


  try{
    await facultyStaff.save();

    await logActivity({
      userId: facultyID, // Assuming you have user info in the request
      activity: `Added faculty staff: ${first_name} ${last_name} (ID: ${facultyID})`
    });

    // Call sendEmailSuccess with the required information
    await sendEmailSuccess({
      email,
      plainPassword
    });

    console.log("New Faculty Staff Saved:", facultyStaff);
    res.status(201).json({ message: "New Faculty Staff Successfully Added" });

  } catch (err) {
    console.error('Error saving Faculty Staff:', err);
    res.status(500).json({ message: "Failed to add faculty Staff", error: err });
  }
  
});

// @desc    Get Faculty Staffs
// @route   GET /api/fetch_faculty_staffs
// @access  Private
const getFacultyStaff = asyncHandler ( async (req, res) => {
  const { search } = req.query;

  try {
    // Fetch the updated list
    const allFacultyStaffs = await facultyStaffModel.find()
      .sort({department: 1, last_name: 1})
      .exec();

    const allFacultyStaffWithIndex = allFacultyStaffs.map((facultyStaff, index) => ({
      ...facultyStaff.toObject(),
      originalFacultyStaff: index + 1
    }));

    if(allFacultyStaffWithIndex.length === 0){
      const allFacultyStaffs = await facultyStaffModel.find().exec();
      allFacultyStaffWithIndex = allFacultyStaffs.map((facultyStaff, index) => ({
        ...facultyStaff.toObject(),
        originalFacultyStaff: index + 1
      }))
    };

    

    let filteredFacultyStaff = allFacultyStaffWithIndex;

    if(search){
      const lowercasedSearch = search.toLowerCase().trim();
      filteredFacultyStaff = allFacultyStaffWithIndex.filter(facultyStaff => 
        [
          facultyStaff.facultyID,
          facultyStaff.last_name,
          facultyStaff.first_name,
          facultyStaff.middle_initial,
          facultyStaff.department,
          facultyStaff.contact_number
        ].some(field => 
          field.toLowerCase().includes(lowercasedSearch)
        )
      )
    }

    res.status(200).json(filteredFacultyStaff);
  } catch (error) {
    console.log("Failed Fetching Faculty Staff", error);
    res.statu(500).json({
      message: "Failed Fetching Faculty Staffs",
      error: error.message
    });
  }
});

// @desc    Get Faculty Staffs
// @route   GET /api/get_faculty_to_class_prog
// @access  Private
const getFacultyToClassProg = asyncHandler ( async (req, res) => {
  const { search } = req.query;

  try {
    // Fetch the updated list
    const allFacultyStaffs = await facultyStaffModel.find().exec();
    const allFacultyStaffWithIndex = allFacultyStaffs.map((facultyStaff, index) => ({
      ...facultyStaff.toObject(),
      originalFacultyStaff: index + 1
    }));

    if(allFacultyStaffWithIndex.length === 0){
      const allFacultyStaffs = await facultyStaffModel.find().exec();
      allFacultyStaffWithIndex = allFacultyStaffs.map((facultyStaff, index) => ({
        ...facultyStaff.toObject(),
        originalFacultyStaff: index + 1
      }))
    };

    let filteredFacultyStaff = allFacultyStaffWithIndex;

    if(search){
      const lowercasedSearch = search.toLowerCase().trim();
      filteredFacultyStaff = allFacultyStaffWithIndex.filter(facultyStaff => 
        [
          facultyStaff.facultyID,
          facultyStaff.last_name,
          facultyStaff.first_name,
          facultyStaff.middle_initial,
        ].some(field => 
          field.toLowerCase().includes(lowercasedSearch)
        )
      )
    }

    res.status(200).json(filteredFacultyStaff);
  } catch (error) {
    console.log("Failed Fetching Faculty Staff", error);
    res.status(500).json({
      message: "Failed Fetching Faculty Staffs",
      error: error.message
    });
  }
});

// @desc    Get Instructor by ID with search functionality for students
// @route   GET /api/get_instructors_load/:id
// @access  Private
const getInstructorById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { search } = req.query;

  try {
    // Fetch the instructor by ID
    const instructor = await facultyStaffModel.findById(id);

    if (!instructor) {
      return res.status(404).json({ message: 'Faculty Staff not found' });
    }

    // Convert to plain object for easier manipulation
    let instructorData = instructor.toObject();

    // If search query is present
    if (search) {
      const lowercasedSearch = search.toLowerCase().trim();
      
      // Filter subjects and students based on search criteria
      instructorData.load = instructorData.load.map(subject => {
        // Filter students within each subject
        subject.students = subject.students.filter(student => 
          [
            student.last_name,
            student.first_name,
            student.middle_initial
          ].some(field => 
            field.toLowerCase().includes(lowercasedSearch)
          )
        );
        // Return the subject with filtered students
        return subject;
      }).filter(subject => subject.students.length > 0); // Remove subjects with no matching students

      // If no subjects have matching students, remove load array
      if (instructorData.load.length === 0) {
        instructorData = { ...instructorData, load: [] };
      }
    }

    res.status(200).json(instructorData);
  } catch (error) {
    console.error('Error fetching Faculty Staff:', error);
    res.status(500).json({
      message: 'Failed to fetch faculty Staff',
      error: error.message
    });
  }
});




const loadSchema = Joi.object({
  _id: Joi.string().required(),
  subject_code: Joi.string().required(),
  subject_title: Joi.string().required(),
  students:Joi.array().default([]),
  course: Joi.string().required(),
  year: Joi.string().required(),
  section: Joi.string().required(),
  semester: Joi.string().required(),
  academic_year: Joi.string().required()
});

const validateInstructorsLoad = (data) => {
  return loadSchema.validate(data, { abortEarly: false }); // Ensure all errors are captured
};

// @desc    Post instructors Load
// @route   POST /api/post_instructors_load
// @access  Private
const postInstructorsLoad = asyncHandler(async (req, res) => {
  console.log('Received data:', req.body);

  // Validate and apply default values
  const { error, value: validatedData } = validateInstructorsLoad(req.body);
  if (error) {
    return res.status(400).json({ message: error.details.map(detail => detail.message).join(', ') });
  }

  const { _id, subject_code, subject_title, students, course, year, section, semester, academic_year } = validatedData;

  try {
    // Find the instructor by _id
    const instructor = await facultyStaffModel.findById(_id); // Changed to findById for consistency
    if (!instructor) {
      return res.status(404).json({ message: "Instructor not found" });
    }

    // Create new load entry
    const newLoad = {
      subject_code,
      subject_title,
      students,
      course,
      year,
      section,
      semester,
      academic_year
    };

    // Add new load to the instructor's load array
    instructor.load.push(newLoad);

    // Save changes to the database
    await instructor.save();

    await logActivity({
      userId: instructor.first_name, // Assuming you have user info in the request
      activity: `Added load for instructor: ${instructor.first_name} ${instructor.last_name} (ID: ${_id})`
    });

    res.status(200).json({
      message: "Successfully added new Instructor's Load"
    });
  } catch (error) {
    console.error('Error saving Instructor\'s Load:', error);
    res.status(500).json({
      message: "Error saving Instructor's Load",
      error: error.message
    });
  }
});


// @desc    Delete faculty staff
// @route   DELETE /api/del_faculty_staff/:id
// @access  Private 
const deleteFacultyStaff = asyncHandler ( async (req, res) => {
  try {
    const { id } = req.params;
    const result = await facultyStaffModel.findByIdAndDelete(id);

    if (!result) {
      return res.status(404).json({ message: 'Faculty Staff not found' });
    }

    res.status(200).json({ message: 'Faculty Staff deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

// @desc    Delete faculty staff
// @route   DELETE /api/del_instructors_load/:id
// @access  Private 
const deleteInstructorsLoad = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    const result = await facultyStaffModel.updateOne(
      { 'load._id': id },
      { $pull: { load: { _id: id } } }
    );

    if (result.modifiedCount === 0) {
      return res.status(404).json({ message: "Instructor's Load not found" });
    }

    res.status(200).json({ message: "Instructor's Load deleted successfully" });
  } catch (error) {
    console.error('Error deleting Instructor\'s Load:', error);
    res.status(500).json({ message: "Error deleting Instructor's Load", error: error.message });
  }
});



// @desc    Post Instructor's Load files
// @route   GET /api/post_instructors_load_upload
// @access  Private

// Set up storage configuration for multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Specify the directory to save uploaded files
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}${ext}`); // Append timestamp to filename
  }
});

// Create the multer instance
const upload = multer({ storage });

// Controller function for handling file upload
const postInstructorsLoadFileUpload = asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded" });
  }

  const { instructorId } = req.body; // Extract instructorId from the form data
  if (!instructorId) {
    return res.status(400).json({ message: "Instructor ID is missing" });
  }

  const filePath = path.resolve(req.file.path);
  const results = [];

  fs.createReadStream(filePath)
    .pipe(csv())
    .on('data', (data) => {
      const { subject_code, subject_title, course, year, section, semester, academic_year } = data;
      results.push({
        subject_code,
        subject_title,
        course,
        year,
        section,
        semester,
        academic_year
      });
    })
    .on('end', async () => {
      try {
        // Find the faculty by the provided instructorId
        const faculty = await facultyStaffModel.findOne({ _id: instructorId });

        if (!faculty) {
          console.error(`Faculty staff with ID ${instructorId} not found.`);
          return res.status(404).json({ message: `Faculty staff with ID ${instructorId} not found.` });
        }

        for (const result of results) {
          // Add new load entry to the faculty's load
          faculty.load.push({
            subject_code: result.subject_code,
            subject_title: result.subject_title,
            course: result.course,
            year: result.year,
            section: result.section,
            semester: result.semester,
            academic_year: result.academic_year
          });
        }

        // Save changes
        await faculty.save();

        await logActivity({
          userId: instructorId, // Assuming you have user info in the request
          activity: `Uploaded load data for Instructor ID: ${instructorId}, loaded ${results.length} subjects`
        });

        res.status(200).json({ message: "File uploaded and data saved successfully" });
      } catch (error) {
        console.error('Error saving data to the database:', error);
        res.status(500).json({ message: "Error saving data to the database", error });
      } finally {
        try {
          fs.unlinkSync(filePath);
        } catch (cleanupError) {
          console.error('Error deleting file:', cleanupError);
        }
      }
    })
    .on('error', (error) => {
      console.error('Error reading CSV file:', error);
      res.status(500).json({ message: "Error reading CSV file", error });
    });
});

// @desc    Add Student
// @route   POST /api/post_instructors_load_student/:facultyId/load/:loadId/add_student
// @access  Private
const addStudentToInstructorsStudents = async (req, res) => {
  try {
    const { facultyId, loadId } = req.params; // Get both faculty and load IDs
    const studentData = req.body; // Assuming student data is sent in the request body

    // Find the faculty member and update the specific load entry
    const updatedInstructor = await facultyStaffModel.findOneAndUpdate(
      {
        _id: facultyId,
        "load._id": loadId // Match the specific load document
      },
      {
        $push: { "load.$.students": studentData } // Use positional operator to push into the correct students array
      },
      { new: true } // Return the updated document
    );

    if (!updatedInstructor) {
      return res.status(404).json({ message: "Instructor or Load not found" });
    }

    await logActivity({
      userId: facultyId, // Assuming you have user info in the request
      activity: `Added student to Instructor's Load (Instructor ID: ${facultyId}, Load ID: ${loadId})`
    });


    res.json(updatedInstructor);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error adding student' });
  }
};


// @desc    Delete Student from Load
// @route   DELETE /api/post_instructors_load_student/:instructorId/load/:loadId/student/:studentId
// @access  Private
const deleteStudentFromLoad = async (req, res) => {
  try {
    const { instructorId, loadId, studentId } = req.params;

    // Find the instructor by ID and update the load by removing the student
    const updatedInstructor = await facultyStaffModel.findOneAndUpdate(
      { _id: instructorId, 'load._id': loadId },
      { $pull: { 'load.$.students': { _id: studentId } } },
      { new: true }
    );

    if (!updatedInstructor) {
      return res.status(404).json({ message: 'Student or Load not found' });
    }

    await logActivity({
      userId: instructorId, // Assuming you have user info in the request
      activity: `Removed student from Instructor's Load (Instructor ID: ${instructorId}, Load ID: ${loadId}, Student ID: ${studentId})`
    });

    res.json(updatedInstructor);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error deleting student' });
  }
};


const uploadStudentsCSV = async (req, res) => {
  try {
    console.log('Received file upload request'); // Debug statement

    if (!req.file) {
      console.log('No file uploaded'); // Debug statement
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const { instructorId, loadId } = req.params;
    console.log(`Instructor ID: ${instructorId}, Load ID: ${loadId}`); // Debug statement

    if (!instructorId || !loadId) {
      console.log('Instructor ID or Load ID missing'); // Debug statement
      return res.status(400).json({ message: 'Instructor ID and Load ID are required' });
    }

    const students = [];

    fs.createReadStream(req.file.path)
      .pipe(csv())
      .on('data', (row) => {
        console.log('Parsed row:', row); // Debug statement
        students.push({
          schoolID: row.schoolID,
          last_name: row.last_name,
          first_name: row.first_name,
          middle_initial: row.middle_initial,
        });
      })
      .on('end', async () => {
        try {
          console.log('CSV parsing completed'); // Debug statement
          const faculty = await facultyStaffModel.findOne({ _id: instructorId });
          if (!faculty) {
            console.log('Faculty not found'); // Debug statement
            return res.status(404).json({ message: 'Faculty not found' });
          }

          const load = faculty.load.id(loadId);
          if (!load) {
            console.log('Load not found'); // Debug statement
            return res.status(404).json({ message: 'Load not found' });
          }

          console.log('Load before update:', load); // Debug statement

          load.students.push(...students);

          await faculty.save();

          console.log('Updated faculty:', faculty); // Debug statement

          await logActivity({
            userId: instructorId, // Assuming you have user info in the request
            activity: `Uploaded ${students.length} students to Instructor's Load (Instructor ID: ${instructorId}, Load ID: ${loadId})`
          });

          res.status(201).json({ message: 'Students uploaded successfully', students });
        } catch (error) {
          console.error('Error saving students:', error);
          res.status(500).json({ message: 'Failed to save students', error });
        } finally {
          fs.unlinkSync(req.file.path);
        }
      })
      .on('error', (error) => {
        console.error('Error reading CSV file:', error);
        res.status(500).json({ message: 'Error reading CSV file', error });
      });
  } catch (error) {
    console.error('Failed to upload file:', error);
    res.status(500).json({ message: 'Failed to upload file', error });
  }
};


// @desc    Get Faculty Details by userId
// @route   GET /api/get_faculty_details/:id
// @access  Private
const getFacultyDetails = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Validate ObjectId format
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: 'Invalid userId format' });
  }

  try {
    // Fetch user by id
    const user = await facultyStaffModel.findById(id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error('Error fetching user details:', error);
    res.status(500).json({ message: 'Failed to fetch user details', error: error.message });
  }
});




// @desc    Update Student Grades
// @route   PATCH /api/instructors/:instructorId/load/:loadId/student/:studentId/grades
// @access  Private
const updateStudentGrades = asyncHandler(async (req, res) => {
  const { instructorId, studentId, midtermGrade, finalGrade } = req.body;

  // Log IDs for debugging
  console.log(`Instructor ID: ${instructorId}, Student ID: ${studentId}, Midterm Grade: ${midtermGrade}, Final Grade: ${finalGrade}`);

  try {
    // Find the instructor
    const instructor = await facultyStaffModel.findOne({ _id: instructorId });
    if (!instructor) {
      return res.status(404).json({ message: "Instructor not found" });
    }

    let studentFound = false;

    // Loop through the instructor's load to find and update the student
    for (const load of instructor.load) {
      const student = load.students.find(student => student._id.toString() === studentId);
      if (student) {
        // Check if either midterm or final grade is "INC" or "ODRP"
        let formattedMidtermGrade, formattedFinalGrade, finalGradeAverage;

        if (midtermGrade === "INC" || midtermGrade === "ODRP") {
          // If midterm grade is "INC" or "ODRP", set all grades to that value
          formattedMidtermGrade = midtermGrade;
          formattedFinalGrade = midtermGrade;
          finalGradeAverage = midtermGrade;
        } else if (finalGrade === "INC" || finalGrade === "ODRP") {
          // If final term grade is "INC" or "ODRP", set all grades to that value
          formattedMidtermGrade = finalGrade;
          formattedFinalGrade = finalGrade;
          finalGradeAverage = finalGrade;
        } else {
          // Helper function to format grades to one decimal place without rounding up
          const formatToOneDecimalPlace = (num) => {
            const roundedNum = Math.floor(num * 10) / 10;
            return roundedNum.toFixed(1);  // Ensures the result has exactly one decimal place
          };

          // Apply the formatting to the midterm, final, and average grades
          formattedMidtermGrade = formatToOneDecimalPlace(parseFloat(midtermGrade));
          formattedFinalGrade = formatToOneDecimalPlace(parseFloat(finalGrade));
          finalGradeAverage = formatToOneDecimalPlace(
            (parseFloat(formattedMidtermGrade) + parseFloat(formattedFinalGrade)) / 2
          );
        }

        // Update the grades in the student object
        student.midterm_grade = formattedMidtermGrade;
        student.finalterm_grade = formattedFinalGrade;
        student.FINAL_GRADE = finalGradeAverage;

        // Update the specific fields in the database directly using Mongoose
        await facultyStaffModel.updateOne(
          { _id: instructorId, __v: instructor.__v },
          {
            '$set': {
              [`load.${instructor.load.indexOf(load)}.students.${load.students.indexOf(student)}.midterm_grade`]: formattedMidtermGrade,
              [`load.${instructor.load.indexOf(load)}.students.${load.students.indexOf(student)}.finalterm_grade`]: formattedFinalGrade,
              [`load.${instructor.load.indexOf(load)}.students.${load.students.indexOf(student)}.FINAL_GRADE`]: finalGradeAverage
            }
          }
        );

        studentFound = true;

        // Log the update activity
        await logActivity({
          userId: instructorId, 
          activity: `Updated grades for Student (ID: ${studentId}) in Instructor's Load (Instructor ID: ${instructorId})`
        });

        break;
      }
    }

    if (!studentFound) {
      return res.status(404).json({ message: "Student not found in the specified instructor's load" });
    }

    // Respond with success
    res.status(200).json({ message: "Student grades updated successfully", instructor });
  } catch (error) {
    console.error("Error updating student grades:", error);
    res.status(500).json({
      message: "Failed to update student grades",
      error: error.message,
    });
  }
});















// @desc    Post Instructor's Grade Sheet Upload
// @route   POST /api/upload_gradeSheet
// @access  Private

// Helper function to process the file with the worker
const processFileWithWorker = (fileBuffer) => {
  return new Promise((resolve, reject) => {
    const worker = new Worker(path.resolve(__dirname, '../utils/fileProcessorWorker.js'), {
      workerData: { fileBuffer }
    });

    worker.on('message', (result) => {
      resolve(result);
    });

    worker.on('error', (error) => {
      reject(error);
    });

    worker.on('exit', (code) => {
      if (code !== 0) {
        reject(new Error(`Worker stopped with exit code ${code}`));
      }
    });
  });
};

const { promisify } = require('util');
const { v4: uuidv4 } = require('uuid');
const writeFileAsync = promisify(fs.writeFile);
const gradeSheetModel = require('../models/gradeSheetModel');

const uploadGradeSheet = async (req, res) => {
  let fileBuffer;
  let originalFileName;
  try {
    // Check if file exists
    if (!req.file) {
      console.error('No file uploaded.');
      return res.status(400).json({ error: 'No file uploaded.' });
    }

    // Get the user's last name from the request body
    const lastName = req.body.last_name || 'Unknown';
    console.log("Last Name: ", lastName);

    // Log the req.file object to debug
    console.log('Uploaded file details:', req.file);

    fileBuffer = req.file.buffer;
    originalFileName = req.file.originalname;

    if (!fileBuffer) {
      console.error('File buffer is undefined.');
      return res.status(500).json({ error: 'Failed to get file buffer.' });
    }

    console.log(`Processing file with buffer size: ${fileBuffer.length}`);

    // Process the file with the worker to extract necessary details
    const result = await processFileWithWorker(fileBuffer);
    
    // Validate extracted data
    const {
      semester,
      academic_year,
      subject_code,
      subject_title,
      units,
      students,
      course,
      year,
      section,
      instructor_name,
      program_chair,
      dean
    } = result;

    // Validate required fields
    if (!semester || !academic_year || !subject_code || !subject_title || !units || !instructor_name || !program_chair || !dean) {
      return res.status(400).json({ error: 'Critical data is missing. Please ensure all fields are filled.' });
    }

    console.log('File processed successfully. Extracted data:', {
      semester,
      academic_year,
      subject_code,
      subject_title,
      units,
      course,
      year,
      section,
      instructor_name,
      program_chair,
      dean,
      students,
    });

    // Create a unique identifier for the file
    const fileExtension = path.extname(originalFileName);
    const newFileName = `Gradesheet-${subject_code}-${subject_title}-${semester}-${academic_year}-${course}-${year}-${section}${fileExtension}`;

    // Define the file path
    const filePath = path.join(__dirname, '../uploads/grade-sheets', newFileName);

    // Save the file to disk
    await writeFileAsync(filePath, fileBuffer);
    console.log(`File saved successfully at: ${filePath}`);

    // Save the grade sheet data to the GradeSheets collection
    const newGradeSheet = new gradeSheetModel({
      students,
      semester,
      academic_year,
      subject_code,
      subject_title,
      units,
      instructor_name,
      program_chair,
      dean,
      course,
      year,
      section,
      filePath,
    });

    await newGradeSheet.save(); // Save to GradeSheets collection
    console.log('Grade sheet saved to GradeSheets collection');

    // Update the instructor's load array in the database
    const updatedInstructor = await facultyStaffModel.findOneAndUpdate(
      { _id: req.body.instructorId },
      {
        $push: {
          load: {
            semester,
            academic_year,
            subject_code,
            subject_title,
            units,
            course,
            year,
            section,
            students,
            instructor_name,
            program_chair,
            dean
          }
        }
      },
      { new: true }
    );

    if (!updatedInstructor) {
      console.error('Instructor not found.');
      return res.status(404).json({ error: 'Instructor not found.' });
    }

    console.log('New load successfully added to the instructor\'s load:', updatedInstructor);

    res.status(200).json({ message: 'Grade sheet uploaded and processed successfully.', updatedInstructor });

    const facultyID = updatedInstructor.facultyID;
    console.log("ID", facultyID);
    
    // Log activity with facultyID and last name
    await logActivity(facultyID, `Uploaded a grade sheet by ${lastName}`);

  } catch (error) {
    console.error('Error saving data to the database:', error);
    // Return a generic error message while logging specific errors for debugging
    res.status(500).json({ error: 'Failed to process and save the grade sheet. Please try again.' });
  } finally {
    // Ensure the file buffer is handled or cleared
    if (fileBuffer) {
      console.log(`File buffer processed and removed.`);
    }
  }
};




  



// @desc    Post Removal Completion Form
// @route   POST /api/upload_removal_completion_form
// @access  Private
const RemovalComplete = require('../models/RemovalComplete');

const sharp = require('sharp');

const uploadRemovalCompletionForm = async (req, res) => {
  try {
    console.log('Received form data:', req.body);

    const {
      date,
      last_name,
      first_name,
      middle_initial,
      status,
      subject,
      semester,
      academic_year,
      rating_obtained,
      instructor_professor,
      formImage
    } = req.body;
    
    let formImagePath = '';
    if (formImage) {
      const base64Data = formImage.replace(/^data:image\/(png|jpeg);base64,/, '');
      const fileExtension = formImage.match(/^data:image\/(png|jpeg);base64,/)[1];
      
      // Construct the filename based on the specified fields
      const fileName = `${last_name}-${subject}-${semester}-${academic_year}.${fileExtension}`;
      formImagePath = path.join(__dirname, '../uploads/removal-completion-form', fileName);

      // Ensure the directory exists
      const directoryPath = path.dirname(formImagePath);
      if (!fs.existsSync(directoryPath)) {
        fs.mkdirSync(directoryPath, { recursive: true });
      }

      // Save the file
      fs.writeFileSync(formImagePath, base64Data, 'base64');
      console.log('Base64 image data written to:', formImagePath);

    }

    // Log the rest of the form data
    console.log('Date:', date);
    console.log('Last Name:', last_name);
    console.log('First Name:', first_name);
    console.log('Middle Initial:', middle_initial);
    console.log('Status:', status);
    console.log('Subject:', subject);
    console.log('Semester:', semester);
    console.log('Academic Year:', academic_year);
    console.log('Rating Obtained:', rating_obtained);
    console.log('Instructor/Professor:', instructor_professor);

    const newForm = new RemovalComplete({
      date,
      last_name,
      first_name,
      middle_initial,
      status,
      subject,
      semester,
      academic_year,
      rating_obtained,
      instructor_professor,
      formImage: formImagePath
    });

    console.log('Saving new form:', newForm);

    await newForm.save();

    console.log('Form saved successfully:', newForm);

    res.status(200).json({ message: 'Form uploaded successfully', form: newForm });
  } catch (error) {
    console.error('Error uploading form:', error.message);
    res.status(500).json({ message: 'Failed to upload form', error: error.message });
  }
};




const updateFacultyDetails = async (req, res) => {
  try {
    const { userId } = req.params;
    const { currentPassword, newPassword } = req.body;
    const updatedData = req.body;

    if (currentPassword && newPassword) {
      const faculty = await facultyStaffModel.findById(userId);
      if (!faculty) {
        return res.status(404).json({ message: 'Faculty member not found' });
      }

      const isMatch = await bcrypt.compare(currentPassword, faculty.password);
      if (!isMatch) {
        return res.status(400).json({ message: 'Current password is incorrect' });
      }

      // Hash the new password before updating
      const hashedNewPassword = await bcrypt.hash(newPassword, 12);
      updatedData.password = hashedNewPassword;
    }

    if (req.file) {
      updatedData.user_profile = `/uploads/user-profiles/${req.file.filename}`;
    }

    const faculty = await facultyStaffModel.findByIdAndUpdate(userId, updatedData, { new: true });

    if (!faculty) {
      return res.status(404).json({ message: 'Faculty member not found' });
    }

    res.status(200).json({ message: 'User details updated successfully', faculty });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const validateCurrentPassword = async (req, res) => {
  try {
    const { userId, currentPassword } = req.body;

    if (!userId || !currentPassword) {
      return res.status(400).json({ message: 'User ID and current password are required' });
    }

    const faculty = await facultyStaffModel.findById(userId);

    if (!faculty) {
      return res.status(404).json({ message: 'Faculty member not found' });
    }

    const isMatch = await bcrypt.compare(currentPassword, faculty.password);

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


const getStudentDetailsByLastName = async (req, res) => {
  try {
    const { lastName, firstName } = req.query;

    if (!lastName || !firstName) {
      console.error('Both lastName and firstName query parameters are required');
      return res.status(400).json({ message: 'Both lastName and firstName query parameters are required' });
    }

    console.log('Fetching facultyStaffs from the database');
    const facultyStaffs = await facultyStaffModel.find();

    if (!facultyStaffs || facultyStaffs.length === 0) {
      console.error('No facultyStaff records found');
      return res.status(404).json({ message: 'No faculty staff found' });
    }

    const matchedStudents = [];

    console.log(`Searching for students with lastName: ${lastName} and firstName: ${firstName}`);
    for (let staff of facultyStaffs) {
      console.log(`Checking faculty staff: ${staff.last_name}`);
      for (let load of staff.load) {
        console.log(`Checking load: ${load.subject_code} - ${load.subject_title}`);
        for (let student of load.students) {
          if (!student.last_name || !student.first_name) {
            console.warn('Student without last_name or first_name found, skipping');
            continue;
          }

          console.log(`Comparing ${student.last_name.toLowerCase()} with ${lastName.toLowerCase()} and ${student.first_name.toLowerCase()} with ${firstName.toLowerCase()}`);
          if (student.last_name.toLowerCase() === lastName.toLowerCase() && student.first_name.toLowerCase() === firstName.toLowerCase()) {
            console.log('Student match found:', student.last_name, student.first_name);
            matchedStudents.push({
              ...student._doc,
              faculty: {
                last_name: staff.last_name,
                first_name: staff.first_name,
              },
              subject: {
                subject_code: load.subject_code,
                subject_title: load.subject_title,
                semester: load.semester,
                academic_year: load.academic_year,
              }
            });
          }
        }
      }
    }

    if (matchedStudents.length === 0) {
      console.warn('No students matched the query');
      return res.status(404).json({ message: 'No students found' });
    }

    console.log('Matched student details found, sending response');
    res.json(matchedStudents);
  } catch (error) {
    console.error('Error fetching student details:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const postFacultyStaffFileUpload = asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded" });
  }

  // Check if file buffer is available
  if (!req.file.buffer) {
    return res.status(400).json({ message: "No file data available" });
  }

  const buffer = req.file.buffer;
  const bufferStream = new stream.PassThrough();
  bufferStream.end(buffer);

  const results = [];

  // Parse CSV data
  bufferStream
    .pipe(csv())
    .on('data', (data) => {
      results.push(data);
      console.log(`Data chunk: ${JSON.stringify(data)}`);
    })
    .on('end', async () => {
      try {
        // Process each entry to match the model
        const processedEntries = results.map((entry) => {
          // Map CSV data to model fields
          return {
            facultyID: entry.facultyID,
            last_name: entry.last_name,
            first_name: entry.first_name,
            middle_initial: entry.middle_initial,
            department: entry.department,
            contact_number: entry.contact_number,
            email: entry.email,
            isActive: entry.isActive === 'true',
            // Add other fields and any necessary transformation here
          };
        });

        // Validate and save each entry to ensure middleware is triggered
        for (const entry of processedEntries) {
          try {
            const facultyStaff = new facultyStaffModel(entry);
            await facultyStaff.save(); // Triggers pre-save hooks, like password hashing and email sending
          } catch (error) {
            console.error('Error saving individual entry:', error);
          }
        }

        res.status(200).json({ message: "File uploaded and data saved successfully" });
      } catch (error) {
        console.error('Error saving data to the database:', error);
        res.status(500).json({ message: "Error saving data to the database", error });
      }
    })
    .on('error', (error) => {
      console.error('Error reading CSV file:', error);
      res.status(500).json({ message: "Error reading CSV file", error });
    });
});

const updateUserStatus = async (req, res) => {
  const { userId } = req.params;
  const { isActive } = req.body; // Expecting { isActive: false }

  try {
    // Find user by ID and update the isActive field
    const updatedUser = await facultyStaffModel.findByIdAndUpdate(
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
  postFacultyStaff,
  getFacultyStaff,
  getFacultyToClassProg,
  getInstructorById,
  postInstructorsLoad,
  deleteFacultyStaff,
  deleteInstructorsLoad,
  postInstructorsLoadFileUpload,
  addStudentToInstructorsStudents,
  deleteStudentFromLoad,
  uploadStudentsCSV,
  getFacultyDetails,
  updateStudentGrades,
  uploadGradeSheet,
  uploadRemovalCompletionForm,
  updateFacultyDetails,
  validateCurrentPassword,
  getStudentDetailsByLastName,
  postFacultyStaffFileUpload,
  updateUserStatus
};

