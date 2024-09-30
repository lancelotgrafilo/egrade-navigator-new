const mongoose = require("mongoose");
const bcrypt = require('bcryptjs');
const { sendEmailSuccess } = require('../controllers/emailSuccessController');

// Define a function to generate a random password
const generateRandomPassword = (length = 6) => {
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let password = '';
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * charset.length);
    password += charset[randomIndex];
  }
  return password;
};

// Define a schema for student information within a subject load
// Define a schema for student information within a subject load
const studentSchema = new mongoose.Schema({
  last_name: { type: String },
  first_name: { type: String },
  middle_initial: { type: String },
  course: { type: String },
  year: { type: String },
  section: { type: String },
  midterm_grade: { type: String },  
  finalterm_grade: { type: String }, 
  FINAL_GRADE: { type: String },     
});


// Define a schema for subject load, including students
const loadSchema = new mongoose.Schema({
  subject_code: { type: String, required: true },
  subject_title: { type: String, required: true },
  students: { type: [studentSchema], default: [] },
  course: { type: String, required: true },
  year: { type: String, required: true },
  section: { type: String, required: true },
  semester: { type: String, required: true },
  academic_year: { type: String, required: true },
  units: { type: Number },
});

// Define the schema for faculty staff members
const facultyStaffSchema = new mongoose.Schema({
  ID: { type: String, default: "fs-001" },
  facultyID: { type: String, required: true, unique: true },
  last_name: { type: String, required: true },
  first_name: { type: String, required: true },
  middle_initial: { type: String, required: true },
  department: { type: String, required: true },
  contact_number: { type: String, required: true },
  password: { type: String },
  email: { 
    type: String, 
    required: true, 
    unique: true,
    match: /.+\@.+\..+/ // Basic email validation
  },
  user_profile: { type: String, default: null },
  isActive: { type: Boolean, default: false },
  isVerified: { type: Boolean, default: false },
  title: { type: String, default: "faculty_staff" },
  load: { type: [loadSchema], default: [] }
}, { collection: "facultyStaffs" });
  
// Function to generate the next ID based on the previous ID
const generateNextID = async () => {
  const lastFacultyStaff = await facultyStaffModel.findOne().sort({ ID: -1 }).exec();
  if (lastFacultyStaff && lastFacultyStaff.ID) {
    const lastIDNumber = parseInt(lastFacultyStaff.ID.split('-')[1], 10);
    return `fs-${(lastIDNumber + 1).toString().padStart(3, '0')}`;
  }
  return 'fs-001'; // Default ID if no faculty staff exist
};

// Middleware to set the ID and default password before saving a new document
facultyStaffSchema.pre('save', async function (next) {
  if (this.isNew) {
    this.ID = await generateNextID();

    // Ensure the first letter of first_name, last_name, middle_initial, and section are uppercase
    if (this.first_name) {
      this.first_name = this.first_name.charAt(0).toUpperCase() + this.first_name.slice(1).toLowerCase();
    }
    if (this.last_name) {
      this.last_name = this.last_name.charAt(0).toUpperCase() + this.last_name.slice(1).toLowerCase();
    }
    if (this.middle_initial) {
      this.middle_initial = this.middle_initial.charAt(0).toUpperCase();
    }

    if (!this.password) {
      const plainPassword = generateRandomPassword(); // Generate a random password
      const salt = await bcrypt.genSalt(10);
      this.password = await bcrypt.hash(plainPassword, salt);

      // Send the email with the plain password
      try {
        await sendEmailSuccess({
          email: this.email,
          plainPassword,
        });
      } catch (error) {
        // Handle the error (e.g., log it)
        console.error("Error sending email:", error);
        return next(error); // Pass the error to the next middleware
      }
    }
  }
  next();
});

studentSchema.pre('save', function (next) {
  // Ensure the first letter of first_name and last_name is uppercase
  if (this.first_name) {
    this.first_name = this.first_name.charAt(0).toUpperCase() + this.first_name.slice(1).toLowerCase();
  }
  if (this.last_name) {
    this.last_name = this.last_name.charAt(0).toUpperCase() + this.last_name.slice(1).toLowerCase();
  }
  // Ensure middle_initial is uppercase
  if (this.middle_initial) {
    this.middle_initial = this.middle_initial.toUpperCase();
  }
  
  next();
});

// Create and export the model for faculty staff
const facultyStaffModel = mongoose.model("Faculty", facultyStaffSchema);
module.exports = facultyStaffModel;
