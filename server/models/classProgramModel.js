const mongoose = require("mongoose");

const facultySchema = new mongoose.Schema({
  facultyID: {type: String},
  last_name: {type: String},
  first_name: {type: String},
  middle_initial: {type: String},
})

const studentsSchema = new mongoose.Schema({
  schoolID: {type: String},
  last_name: {type: String},
  first_name: {type: String},
  middle_initial: {type: String},
})

const classProgramSchema = new mongoose.Schema({
  department: { type: String },
  subject_code: { type: String },
  subject_title: { type: String },
  yearLevel: { type: String },
  section: { type: String },
  semester: { type: String },
  academic_year: { type: String },
  instructor: [facultySchema],
  students: [studentsSchema],
}, {collection: 'classProgram'});

const classProgramModel = mongoose.model("Class Program",  classProgramSchema);
module.exports = classProgramModel;