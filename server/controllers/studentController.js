const asyncHandler = require('express-async-handler');
const Student = require('../models/student');
const Joi = require('joi');
const bcrypt = require('bcryptjs');
const csv = require('csv-parser');
const fs = require("fs");
const path = require('path');  // Import the path module
const multer = require('multer');
const mongoose = require('mongoose');
const { ObjectId } = mongoose.Types;

const { sendEmailSuccess } = require('./emailSuccessController');


const {logActivity} = require('../services/activityLogService');

const generateRandomPassword = (length = 6) => {
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let password = '';
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * charset.length);
    password += charset[randomIndex];
  }
  return password;
};

const studentRegistrationSchema = Joi.object({
  schoolID: Joi.string().required(),
  last_name: Joi.string().required(),
  first_name: Joi.string().required(),
  middle_initial: Joi.string().required(),
  email: Joi.string().email().required(),
  password: Joi.string(),
  college: Joi.string().required(),
  course: Joi.string().required(),
  year: Joi.string().required(),
  section: Joi.string().required(),
  curriculum_effective_year: Joi.string().required(),
  isActive: Joi.boolean().default(true), 
  createdAt: Joi.date().default(Date.now), 
});

const validateRegistration = (data) => {
  return studentRegistrationSchema.validate(data);
};


// @desc    Post Register Student
// @route   POST post_register_student
// @access  Private
const postRegisterStudent = asyncHandler(async (req, res) => {
  const { error } = validateRegistration(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  const { last_name, first_name, middle_initial, schoolID, email, password, college, course, year, section, curriculum_effective_year } = req.body;

  // Check if the email already exists
  const existingStudent = await Student.findOne({ email });
  if (existingStudent) {
    return res.status(400).json({ message: "Email already registered" });
  }

  const generatedPassword = generateRandomPassword();
  const plainPassword = generatedPassword;
  const hashedPassword = await bcrypt.hash(generatedPassword, 12); 

  const student = new Student({ 
    last_name, 
    first_name, 
    middle_initial, 
    schoolID, 
    email, 
    password: hashedPassword, 
    college, 
    course, 
    year, 
    section,
    curriculum_effective_year 
  });

  try {
    await student.save();

    await sendEmailSuccess({
      email,
      plainPassword
    });

    await axios.post('/api/logout-activity', { 
      userID: "New Student", 
      activityDescription: 'New Student'
    });

    console.log("New Student Saved: ", student);
    return res.status(201).json({ message: "New Student Successfully Added" }); // Only one response
  } catch (err) {
    console.error('Error saving Student:', err);
    return res.status(500).json({ message: "Failed to add Student", error: err });
  }
});





// @desc    Get Students
// @route   GET /api/get_students
// @access  Private
const getStudent = asyncHandler(async (req, res) => {
  const { search } = req.query;

  try {
    // Fetch all students directly from the database
    let allStudents = await Student.find()
      .sort({course: 1, last_name: 1})
      .exec();

    let allStudentsWithIndex = allStudents.map((student, index) => ({
      ...student.toObject(),
      originalStudent: index + 1 // Store the original index
    }));

    // Apply search filter on the original list
    if (search) {
      allStudentsWithIndex = allStudentsWithIndex.filter(student =>
        [student.first_name, student.last_name, student.schoolID, student.course].some(field =>
          field.toLowerCase().includes(search.toLowerCase())
        )
      );
    }

    res.status(200).json(allStudentsWithIndex);
  } catch (error) {
    res.status(500).json({ message: 'Failed to get students', error: error.message });
  }
});


// @desc    Get Students to class prog
// @route   GET /api/get_student_to_class_prog
// @access  Private
const getStudentToClassProg = asyncHandler ( async (req, res) => {
  const { search } = req.query;

  try {
    // Fetch the updated list
    const allStudents = await Student.find().exec();
    const allStudentsWithIndex = allStudents.map((student, index) => ({
      ...student.toObject(),
      originalStudent: index + 1
    }));

    if(allStudentsWithIndex.length === 0){
      const allStudents = await Student.find().exec();
      allStudentsWithIndex = allStudents.map((student, index) => ({
        ...student.toObject(),
        originalStudent: index + 1
      }))
    };

    let filteredStudents = allStudentsWithIndex;

    if(search){
      const lowercasedSearch = search.toLowerCase().trim();
      filteredStudents = allStudentsWithIndex.filter(student => 
        [
          student.schoolID,
          student.last_name,
          student.first_name,
          student.middle_initial,
          student.course,
        ].some(field => 
          field.toLowerCase().includes(lowercasedSearch)
        )
      )
    }

    res.status(200).json(filteredStudents);
  } catch (error) {
    console.log("Failed Fetching Students", error);
    res.status(500).json({
      message: "Failed Fetching Students",
      error: error.message
    });
  }
});

// @desc    Delete student
// @route   DELETE /api/del_student/:id
// @access  Private 
const deleteStudent = asyncHandler(async (req, res) => {
  const { id } = req.params;
  console.log("Received ID:", id);

  // Check if the ID is valid
  if (!mongoose.Types.ObjectId.isValid(id)) {
    console.log("Invalid ID:", id);
    return res.status(400).json({ message: 'Invalid student ID' });
  }

  try {
    const result = await Student.findByIdAndDelete(id);

    if (!result) {
      console.log("Student not found for ID:", id);
      return res.status(404).json({ message: 'Student not found' });
    }

    await axios.post('/api/logout-activity', { 
      userID: id, 
      activityDescription: `Deleted Student ${id.last_name}`
    });

    console.log("Student deleted successfully:", id);
    res.status(200).json({ message: 'Student deleted successfully' });
  } catch (error) {
    console.error("Error during deletion:", error);
    res.status(500).json({ message: 'Server error', error });
  }
});


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
const stream = require('stream');

// Controller function for handling file upload
const postStudentsFileUpload = asyncHandler(async (req, res) => {
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
      const {
        schoolID,
        last_name,
        first_name,
        middle_initial,
        course,
        email,
        college,
        year,
        section,
        curriculum_effective_year
      } = data;

      // Capitalize names before pushing to results
      const formattedLastName = last_name.charAt(0).toUpperCase() + last_name.slice(1).toLowerCase();
      const formattedFirstName = first_name.charAt(0).toUpperCase() + first_name.slice(1).toLowerCase();
      const formattedMiddleInitial = middle_initial.charAt(0).toUpperCase(); // Only capitalize the first character

      // Add simple validation (e.g., checking required fields)
      if (schoolID && formattedLastName && formattedFirstName && email) {
        const plainPassword = generateRandomPassword(); // Generate a random password
        const hashedPassword = bcrypt.hashSync(plainPassword, 10); // Hash the password

        results.push({
          schoolID,
          last_name: formattedLastName,
          first_name: formattedFirstName,
          middle_initial: formattedMiddleInitial,
          course,
          email,
          college,
          year,
          section: section ? section.toUpperCase() : section, // Capitalize section if present
          curriculum_effective_year,
          password: hashedPassword, // Include the hashed password
          plainPassword // Include the plain password for email
        });
      }
    })
    .on('end', async () => {
      try {
        if (results.length === 0) {
          return res.status(400).json({ message: "No valid data found in the CSV file" });
        }

        // Insert students in bulk
        await Student.insertMany(results);

        // Send emails to each new student
        for (const student of results) {
          // Send the email with the plain password
          await sendEmailSuccess({
            email: student.email,
            plainPassword: student.plainPassword,
          });
        }

        res.status(200).json({ message: "File uploaded and data saved successfully" });
      } catch (error) {
        console.error('Error saving data to the database or sending emails:', error);
        res.status(500).json({ message: "Error saving data or sending emails", error });
      }
    })
    .on('error', (error) => {
      console.error('Error reading CSV file:', error);
      res.status(500).json({ message: "Error reading CSV file", error });
    });
});






// @desc    Get student by ID with search functionality for students
// @route   GET /api/get_students/:id
// @access  Private
const getStudentById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { search } = req.query;

  try {
    // Fetch the student by ID
    const student = await Student.findById(id);

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Convert to plain object for easier manipulation
    let studentData = student.toObject();

    // If search query is present
    if (search) {
      const lowercasedSearch = search.toLowerCase().trim();
      
      // Filter subjects and students based on search criteria
      studentData.load = studentData.load.map(subject => {
        // Filter students within each subject
        subject.students = subject.students.filter(student => 
          [
            student.subject_code,
            student.subject_title,
            student.instructor,
            student.semester,
            student.academic_year
          ].some(field => 
            field.toLowerCase().includes(lowercasedSearch)
          )
        );
        // Return the subject with filtered students
        return subject;
      }).filter(subject => subject.students.length > 0); // Remove subjects with no matching students

      // If no subjects have matching students, remove load array
      if (studentData.load.length === 0) {
        studentData = { ...studentData, load: [] };
      }
    }

    res.status(200).json(studentData);
  } catch (error) {
    console.error('Error fetching student Staff:', error);
    res.status(500).json({
      message: 'Failed to fetch student Staff',
      error: error.message
    });
  }
});


const postStudentSubject = asyncHandler(async (req, res) => {
  console.log('Received data:', req.body);

  // Validate the input data
  const studentSubjectSchema = Joi.object({
    _id: Joi.string().required(),
    subject_code: Joi.string().required(),
    subject_title: Joi.string().required(),
    instructor: Joi.string().required(),
    semester: Joi.string().required(),
    academic_year: Joi.string().required()
  });

  const { error, value: validatedData } = studentSubjectSchema.validate(req.body, { abortEarly: false });
  if (error) {
    return res.status(400).json({ message: error.details.map(detail => detail.message).join(', ') });
  }

  const { _id, subject_code, subject_title, instructor, semester, academic_year } = validatedData;

  try {
    // Find the student by _id
    const student = await Student.findById(_id);
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    // Create a new subject entry
    const newStudentSubject = {
      subject_code,
      subject_title,
      instructor,
      semester,
      academic_year,
    };

    // Use the $push operator to add the new subject to the subjects array
    await Student.updateOne(
      { _id },
      { $push: { subjects: newStudentSubject } },
      { runValidators: true }  // Run schema validators on the updated document
    );

    res.status(200).json({
      message: "Successfully added new Student's Subject",
      subject: newStudentSubject,
    });
  } catch (error) {
    console.error('Error saving Student\'s Subject:', error);
    res.status(500).json({
      message: "Error saving Student's Subject",
      error: error.message,
    });
  }
});

// @desc    DELETE Student Subject
// @route   del_student_subject/:id
// @access  Private
const deleteStudentSubject = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    const result = await Student.updateOne(
      { 'subjects._id': id },
      { $pull: { subjects: { _id: id } } }
    );

    if (result.modifiedCount === 0) {
      return res.status(404).json({ message: "Student's Subject not found" });
    }

    res.status(200).json({ message: "Student's Subject deleted successfully" });
  } catch (error) {
    console.error('Error deleting Student\'s Subject:', error);
    res.status(500).json({ message: "Error deleting Student's Subject", error: error.message });
  }
});



const updateStudentDetails = async (req, res) => {
  try {
    const { userId } = req.params;
    const { currentPassword, newPassword } = req.body;
    const updatedData = req.body;

    if (currentPassword && newPassword) {
      const student = await Student.findById(userId);
      if (!student) {
        return res.status(404).json({ message: 'Student not found' });
      }

      const isMatch = await bcrypt.compare(currentPassword, student.password);
      if (!isMatch) {
        return res.status(400).json({ message: 'Current password is incorrect' });
      }

      // Hash the new password before updating
      const hashedNewPassword = await bcrypt.hash(newPassword, 10);
      updatedData.password = hashedNewPassword;
    }

    // Check if a new profile image is uploaded
    if (req.file) {
      const student = await Student.findById(userId);
      if (!student) {
        return res.status(404).json({ message: 'Student not found' });
      }

      // Get the current profile image path
      const oldImage = student.user_profile;

      // Update the profile with the new image path
      updatedData.user_profile = `/uploads/user-profiles/${req.file.filename}`;

      // Delete the old image file if it exists
      if (oldImage && fs.existsSync(path.join(__dirname, '..', 'public', oldImage))) {
        fs.unlink(path.join(__dirname, '..', 'public', oldImage), (err) => {
          if (err) console.error('Failed to delete old image:', err);
        });
      }
    }

    const student = await Student.findByIdAndUpdate(userId, updatedData, { new: true });

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    res.status(200).json({ message: 'User details updated successfully', student });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const getStudentDetails = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Validate ObjectId format
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: 'Invalid userId format' });
  }

  try {
    // Fetch user by id
    const user = await Student.findById(id);

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

    const student = await Student.findById(userId);

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    const isMatch = await bcrypt.compare(currentPassword, student.password);

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


const facultyStaffModel = require('../models/facultyStaffModel');

const addSubjectsToStudent = async (req, res) => {
  try {
    const { id } = req.params;
    const { subjects } = req.body;

    // Find the student
    const student = await Student.findById(id);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Ensure 'subjects' is an array
    if (!Array.isArray(subjects)) {
      return res.status(400).json({ message: 'Subjects must be an array' });
    }

    // Loop through each subject
    for (const newSubject of subjects) {
      const { academic_year, semester, subject_code, midterm_grade, finalterm_grade, FINAL_GRADE } = newSubject;

      // Check for existing grade entry for the academic year and semester
      let gradeEntry = student.grades.find(
        (grade) => grade.academic_year === academic_year && grade.semester === semester
      );

      // If no grade entry exists, create a new one
      if (!gradeEntry) {
        gradeEntry = {
          academic_year,
          semester,
          GWA: "0", // GWA will be calculated later
          subjects: [],
        };
        student.grades.push(gradeEntry); // Add the new entry
      }

      // Find the existing subject in the grade entry
      const existingSubjectIndex = gradeEntry.subjects.findIndex(
        (existingSubject) => existingSubject.subject_code === subject_code
      );

      // Determine if the grade is "INC" or "ODRP"
      const isSpecialGrade = (grade) => grade === "INC" || grade === "ODRP";

      let finalGWA = null; // To store the GWA as either "INC", "ODRP", or a calculated number

      if (existingSubjectIndex !== -1) {
        // If the subject exists, update it
        const existingSubject = gradeEntry.subjects[existingSubjectIndex];
        existingSubject.midterm_grade = midterm_grade;
        existingSubject.finalterm_grade = finalterm_grade;
        existingSubject.FINAL_GRADE = isSpecialGrade(FINAL_GRADE) ? FINAL_GRADE : Number(FINAL_GRADE); // Keep "INC" or "ODRP" as strings
      } else {
        // If it doesn't exist, add it
        gradeEntry.subjects.push({
          subject_code,
          midterm_grade,
          finalterm_grade,
          FINAL_GRADE: isSpecialGrade(FINAL_GRADE) ? FINAL_GRADE : Number(FINAL_GRADE), // Keep "INC" or "ODRP" as strings
        });
      }

      // Determine if GWA should be "INC" or "ODRP"
      if (isSpecialGrade(midterm_grade)) {
        finalGWA = midterm_grade; // Set GWA to "INC" or "ODRP" based on midterm grade
      } else if (isSpecialGrade(finalterm_grade)) {
        finalGWA = finalterm_grade; // Set GWA to "INC" or "ODRP" based on final term grade
      } else {
        // Recalculate GWA for this grade entry after adding/updating a subject, if no "INC" or "ODRP"
        const validGrades = gradeEntry.subjects
          .map(subject => subject.FINAL_GRADE)  // Keep the original grade
          .filter(grade => !isNaN(grade));  // Only include valid numerical grades

        if (validGrades.length > 0) {
          const totalGrades = validGrades.reduce((sum, grade) => sum + Number(grade), 0);
          const averageGrade = totalGrades / validGrades.length;

          // Update GWA with 1 decimal place
          finalGWA = averageGrade.toFixed(1);
        } else {
          finalGWA = "N/A"; // No valid grades
        }
      }

      // Update the GWA for the grade entry
      gradeEntry.GWA = finalGWA;
    }

    // Save the updated student record
    await student.save();
    res.status(200).json(student);
  } catch (error) {
    console.error("Error adding subjects:", error);
    res.status(500).json({ message: 'Error adding subjects', error });
  }
};




const getStudentSubjects = async (req, res) => {
  const { userId } = req.params;

  try {
    // Fetch the student by userId
    const student = await Student.findById(userId).select('subjects');
    
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Return the student's subjects
    res.json({ subjects: student.subjects });
  } catch (error) {
    console.error('Error fetching student subjects:', error);
    res.status(500).json({ message: 'Server error' });
  }
};



const updateUserStatus = async (req, res) => {
  const { userId } = req.params;
  const { isActive } = req.body; // Expecting { isActive: false }

  try {
    // Find user by ID and update the isActive field
    const updatedUser = await Student.findByIdAndUpdate(
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
  getStudent,
  getStudentToClassProg,
  deleteStudent,
  postRegisterStudent,
  postStudentsFileUpload,
  getStudentById,
  postStudentSubject,
  deleteStudentSubject,
  updateStudentDetails,
  getStudentDetails,
  validateCurrentPassword,
  addSubjectsToStudent,
  getStudentSubjects,
  updateUserStatus
};
