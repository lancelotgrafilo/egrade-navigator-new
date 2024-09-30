const asyncHandler = require("express-async-handler");
const classProgramModel = require("../models/classProgramModel");
const csv = require('csv-parser');
const fs = require("fs");
const path = require('path');  // Import the path module
const Joi = require("joi");

let allClassProgramWithIndex = [];

// @desc    Get Class Programs
// @route   GET /api/get_class_programs
// @access  Private
const getClassProgram = asyncHandler(async (req, res) => {
  const { search } = req.query;
  try {
    const allClassPrograms = await classProgramModel.find()
    .sort({department: 1, subject_code: 1})
    .exec();

    const allClassProgramWithIndex = allClassPrograms.map((classProgram, index) => ({
      id: classProgram._id.toString(),  // Ensure _id is included as id
      ...classProgram.toObject(),
      originalClassProgram: index + 1
    }));

    let filteredClassPrograms = allClassProgramWithIndex;

    if (search) {
      const lowercasedSearch = search.toLowerCase().trim();
      filteredClassPrograms = allClassProgramWithIndex.filter(classProgram =>
        [ 
          classProgram.department,
          classProgram.subject_code,
          classProgram.subject_title,
          classProgram.yearLevel,
          classProgram.section,
          classProgram.semester,
          classProgram.academic_year,
        ].some(field =>
          field.toLowerCase().includes(lowercasedSearch)
        )
      );
    }

    res.status(200).json(filteredClassPrograms);
  } catch (error) {
    console.log("Error fetching Class Program", error);
    res.status(500).json({
      message: "Failed to fetch Class Program",
      error: error.message
    });
  }
});

// @desc    Get Class Program by ID
// @route   GET /api/get_class_program/:id
// @access  Private
const getClassProgramById = asyncHandler(async (req, res) => {
  try {
    const classProgram = await classProgramModel.findById(req.params.id);

    if (!classProgram) {
      return res.status(404).json({ message: 'Class Program not found' });
    }

    res.status(200).json(classProgram);
  } catch (error) {
    console.error('Error fetching Class Program:', error);
    res.status(500).json({
      message: 'Failed to fetch Class Program',
    });
  }
});


// @desc    Post Class Programs files
// @route   GET /api/post_class_program_upload
// @access  Private
const postClassProgramFileUpload = asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded" });
  }

  const filePath = path.resolve(req.file.path);
  const results = [];

  console.log(`File path: ${filePath}`);

  fs.createReadStream(filePath)
    .pipe(csv())
    .on('data', (data) => {
      results.push(data);
      console.log(`Data chunk: ${JSON.stringify(data)}`);
    })
    .on('end', async () => {
      try {
        console.log('CSV parsing completed. Inserting data into database...');
        await classProgramModel.insertMany(results);
        res.status(200).json({ message: "File uploaded and data saved successfully" });
        
      } catch (error) {
        console.error('Error saving data to the database:', error);
        res.status(500).json({ message: "Error saving data to the database", error });
      } finally {
        console.log('Cleaning up uploaded file...');
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


const classProgramSchema = Joi.object({
  department: Joi.string().required(),
  subject_code: Joi.string().required(),
  subject_title: Joi.string().required(),
  yearLevel: Joi.string().required(),
  section: Joi.string().required(),
  semester: Joi.string().required(),
  academic_year: Joi.string().required(),
  instructor: Joi.array().default([]),
  students: Joi.array().default([]),
});
const validateClassProgram = (data) => {
  return classProgramSchema.validate(data, { abortEarly: false });
};


// @desc    post Class Programs
// @route   GET /api/post_class_programs
// @access  Private
const postClassProgram = asyncHandler(async (req, res) => {
  // Validate and apply default values
  const { error, value: validatedData } = validateClassProgram(req.body);
  console.log("Validated Data:", validatedData);

  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  const { department, subject_code, subject_title, yearLevel, section, semester, academic_year } = validatedData;

  let classProgram;
  try {
    // Attempt to create the class program object
    classProgram = new classProgramModel({
      department,
      subject_code,
      subject_title,
      yearLevel,
      section,
      semester,
      academic_year,
    });
    console.log("Class Program Object Created Successfully:", classProgram);
  } catch (instantiationError) {
    console.error("Error during class program instantiation:", instantiationError);
    return res.status(500).json({
      message: "Error creating Class Program object",
      error: instantiationError.message,
    });
  }

  try {
    console.log("Data to Save:", classProgram);

    await classProgram.save();
    
    res.status(200).json({
      message: "Successfully added new Class Program",
    });
  } catch (error) {
    console.error("Error saving Class Program:", error);
    res.status(500).json({
      message: "Error saving Class program",
      error: error.message,
    });
  }
});



// @desc    Get Class Program by ID
// @route   GET /api/get_class_program_instructor/:id
// @access  Private 
const getClassProgramInstructor = asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  // Check if ID is provided
  if (!id) {
    return res.status(400).json({ message: 'ID parameter is missing' });
  }

  try {
    // Validate ID format (MongoDB ObjectId)
    if (!/^[0-9a-fA-F]{24}$/.test(id)) {
      return res.status(400).json({ message: 'Invalid ID format' });
    }

    // Fetch the class program by ID with relevant fields if needed
    const classProgramInstructor = await classProgramModel.findById(id).select('subject_code subject_title semester academic_year instructor');

    // Check if class program exists
    if (!classProgramInstructor) {
      return res.status(404).json({ message: 'Class program not found' });
    }

    // Send the class program data
    res.status(200).json(classProgramInstructor);
  } catch (error) {
    console.error('Error fetching class program instructor:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @desc    Get Class Program by ID
// @route   GET /api/get_class_program_student/:id
// @access  Private 
const getClassProgramStudent = asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  // Check if ID is provided
  if (!id) {
    return res.status(400).json({ message: 'ID parameter is missing' });
  }

  try {
    // Validate ID format (MongoDB ObjectId)
    if (!/^[0-9a-fA-F]{24}$/.test(id)) {
      return res.status(400).json({ message: 'Invalid ID format' });
    }

    // Fetch the class program by ID with relevant fields if needed
    const classProgramStudent = await classProgramModel.findById(id).select('department subject_code subject_title yearLevel section semester academic_year students');

    // Check if class program exists
    if (!classProgramStudent) {
      return res.status(404).json({ message: 'Class program not found' });
    }

    // Send the class program data
    res.status(200).json(classProgramStudent);
  } catch (error) {
    console.error('Error fetching class program students:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @desc    Add instructor
// @route   POST /api/post_class_program_instructor/:id/add_instructor
// @access  Private 
const addInstructorToClassProgram = async (req, res) => {
  try {
    const classProgramId = req.params.id;
    const instructorData = req.body; // Assuming instructor data is sent in the request body

    // Find the class program and update it by pushing the new instructor
    const updatedClassProgram = await classProgramModel.findByIdAndUpdate(
      classProgramId,
      { $push: { instructor: instructorData } },
      { new: true } // Return the updated document
    );

    if (!updatedClassProgram) {
      return res.status(404).json({ message: 'Class program not found' });
    }
    

    res.json(updatedClassProgram);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error adding instructor' });
  }
};

// @desc    Add Student
// @route   POST /api/post_class_program_student/:id/add_student
// @access  Private 
const addStudentToClassProgram = async (req, res) => {
  try {
    const classProgramId = req.params.id;
    const studentData = req.body; // Assuming student data is sent in the request body

    // Find the class program and update it by pushing the new student
    const updatedClassProgram = await classProgramModel.findByIdAndUpdate(
      classProgramId,
      { $push: { students: studentData } },
      { new: true } // Return the updated document
    );

    if (!updatedClassProgram) {
      return res.status(404).json({ message: 'Class program not found' });
    }
    
    res.json(updatedClassProgram);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error adding student' });
  }
};

// @desc    Delete Class Program
// @route   DELETE /api/del_class_program/:id
// @access  Private 
const deleteClassProgram = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    // Fetch the class program details before deletion
    const classProgram = await classProgramModel.findById(id);
    
    if (!classProgram) {
      return res.status(404).json({ message: 'Class program not found' });
    }

    // Proceed to delete the class program
    const result = await classProgramModel.findByIdAndDelete(id);
    

    res.status(200).json({ message: 'Class program deleted successfully', deletedClassProgram: classProgram });
  } catch (error) {
    console.error('Error deleting class program:', error);
    res.status(500).json({ message: 'Server error', error });
  }
});


// @desc    Delete Instructor from Class Program
// @route   DELETE /api/del_class_program_instructor/:classProgramId/:instructorId
// @access  Private
const deleteInstructor = asyncHandler(async (req, res) => {
  const { classProgramId, instructorId } = req.params;

  // Validate the format of the provided IDs
  if (!/^[0-9a-fA-F]{24}$/.test(classProgramId) || !/^[0-9a-fA-F]{24}$/.test(instructorId)) {
    return res.status(400).json({ message: 'Invalid ID format' });
  }

  try {
    // Find the class program and remove the instructor by their ID
    const updatedClassProgram = await classProgramModel.findByIdAndUpdate(
      classProgramId,
      { $pull: { instructor: { _id: instructorId } } },
      { new: true } // Return the updated document
    );

    if (!updatedClassProgram) {
      return res.status(404).json({ message: 'Class program not found' });
    }

    res.status(200).json({
      message: 'Instructor deleted successfully',
      classProgram: updatedClassProgram
    });
    

  } catch (error) {
    console.error('Error deleting instructor:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});


// @desc    Delete Student from Class Program
// @route   DELETE /api/del_class_program_student/:classProgramId/:schoolId
// @access  Private
const deleteStudent = asyncHandler(async (req, res) => {
  const { classProgramId, schoolId } = req.params;

  // Validate the format of the provided IDs
  if (!/^[0-9a-fA-F]{24}$/.test(classProgramId) || !/^[0-9a-fA-F]{24}$/.test(schoolId)) {
    return res.status(400).json({ message: 'Invalid ID format' });
  }

  try {
    // Find the class program and remove the student by their ID
    const updatedClassProgram = await classProgramModel.findByIdAndUpdate(
      classProgramId,
      { $pull: { students: { _id: schoolId } } }, // Ensure 'students' is the correct field name
      { new: true } // Return the updated document
    );

    if (!updatedClassProgram) {
      return res.status(404).json({ message: 'Class program not found' });
    }

    res.status(200).json({
      message: 'Student deleted successfully',
      classProgram: updatedClassProgram
    });

    
  } catch (error) {
    console.error('Error deleting student:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});



// @desc    Update Class Program
// @route   PUT /api/update_class_program/:id
// @access  Private
const updateClassProgram = asyncHandler(async (req, res) => {
  try {
    const classProgram = await classProgramModel.findById(req.params.id);

    if (!classProgram) {
      return res.status(404).json({ message: 'Class Program not found' });
    }

    // Check for the presence of fields before updating
    const { department, subject_code, subject_title, yearLevel, section, semester, academic_year } = req.body;

    if (department !== undefined) classProgram.department = department;
    if (subject_code !== undefined) classProgram.subject_code = subject_code;
    if (subject_title !== undefined) classProgram.subject_title = subject_title;
    if (yearLevel !== undefined) classProgram.yearLevel = yearLevel;
    if (section !== undefined) classProgram.section = section;
    if (semester !== undefined) classProgram.semester = semester;
    if (academic_year !== undefined) classProgram.academic_year = academic_year;

    const updatedClassProgram = await classProgram.save();
    
    res.status(200).json(updatedClassProgram);
  } catch (error) {
    console.error('Error updating Class Program:', error);
    res.status(500).json({
      message: 'Failed to update Class Program',
      error: error.message,
    });
  }
});


// @desc    Upload CSV and add students to a class program
// @route   POST /api/class_programs/:id/upload_students
// @access  Private
const uploadFileStudentsToClassProgram = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded" });
  }

  const filePath = path.resolve(req.file.path);
  const results = [];

  fs.createReadStream(filePath)
    .pipe(csv())
    .on('data', (data) => {
      results.push(data);
    })
    .on('end', async () => {
      try {
        const classProgram = await classProgramModel.findById(id);

        if (!classProgram) {
          return res.status(404).json({ message: 'Class Program not found' });
        }

        // Add students from CSV to class program
        classProgram.students.push(...results);
        await classProgram.save();
        
        res.status(200).json({ message: "Students uploaded and added to class program successfully" });
      } catch (error) {
        console.error('Error adding students to class program:', error);
        res.status(500).json({ message: "Error saving data to the database", error });
      } finally {
        fs.unlinkSync(filePath); // Clean up uploaded file
      }
    })
    .on('error', (error) => {
      console.error('Error reading CSV file:', error);
      res.status(500).json({ message: "Error reading CSV file", error });
    });
});

module.exports = {
  getClassProgram,
  postClassProgram,
  postClassProgramFileUpload,
  getClassProgramInstructor,
  getClassProgramStudent,
  addInstructorToClassProgram,
  addStudentToClassProgram,
  deleteClassProgram,
  deleteInstructor,
  deleteStudent,
  updateClassProgram,
  getClassProgramById,
  uploadFileStudentsToClassProgram
};
