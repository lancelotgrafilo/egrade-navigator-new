const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const { sendEmailSuccess } = require('../controllers/emailSuccessController');

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

const subjectSchema = new mongoose.Schema({
  subject_code: { type: String },
  subject_title: { type: String },
  instructor: { type: String },
  midterm_grade: { type: String, default: "0" }, // Changed to String
  finalterm_grade: { type: String, default: "0" }, // Changed to String
  FINAL_GRADE: { type: String, default: "0" }, // Changed to String
});

const gradeSchema = new mongoose.Schema({
  academic_year: { type: String },
  semester: { type: String },
  GWA: { type: String, default: "0" }, // Changed to String
  subjects: { type: [subjectSchema], default: [] }, // Initialize to an empty array
});

const studentSchema = new mongoose.Schema({
  last_name: { type: String, required: true },
  first_name: { type: String, required: true },
  middle_initial: { type: String, required: true },
  schoolID: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String },
  isActive: { type: Boolean, default: false },
  isVerified: { type: Boolean, default: false },
  timeInactive: { type: Date },
  title: { type: String, default: "student" },
  course: { type: String, default: null },
  year: { type: String, default: null },
  section: { type: String, default: null },
  college: { type: String, default: null },
  curriculum_effectivity: { type: String, required: true},
  grades: [gradeSchema],
  user_profile: { type: String, default: null },
  createdAt: { type: Date, default: Date.now },
}, { collection: 'students' });

// Pre-save hook to hash the password
studentSchema.pre('save', async function (next) {
  // Capitalize first_name, last_name, and middle_initial
  this.first_name = this.first_name.charAt(0).toUpperCase() + this.first_name.slice(1).toLowerCase();
  this.last_name = this.last_name.charAt(0).toUpperCase() + this.last_name.slice(1).toLowerCase();
  this.middle_initial = this.middle_initial.charAt(0).toUpperCase(); // Only capitalize the first character
  
  if (this.section) {
    this.section = this.section.toUpperCase();
  }

  // Hash password only if modified
  if (!this.password) {
    const plainPassword = generateRandomPassword(); // Generate a random password
    const salt = await bcrypt.genSalt(12);
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

  next();
});

const studentModel = mongoose.model('Student', studentSchema);
module.exports = studentModel;
