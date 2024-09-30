const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  last_name: { type: String, required: true },
  first_name: { type: String, required: true },
  middle_initial: { type: String, required: false },
  midterm_grade: { type: String, required: false },
  finalterm_grade: { type: String, required: false },
  FINAL_GRADE: { type: String, required: false },
});

const gradeSheetSchema = new mongoose.Schema({
  students: [studentSchema],
  semester: { type: String, required: true },
  academic_year: { type: String, required: true },
  subject_code: { type: String, required: true },
  subject_title: { type: String, required: true },
  units: { type: String, required: true },
  instructor_name: { type: String, required: true },
  program_chair: { type: String, required: true },
  dean: { type: String, required: true },
  course: { type: String, required: true },
  year: { type: String, required: true },
  section: { type: String, required: true },
  filePath: { type: String, required: true },
  isSubmitted: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('GradeSheet', gradeSheetSchema, 'GradeSheets');

