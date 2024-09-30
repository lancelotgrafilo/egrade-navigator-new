const mongoose = require("mongoose");


const subjectSchema = new mongoose.Schema({
  department: { type: String, required: true },
  subject_code:  { type: String, required: true },
  subject_title: { type: String, required: true },
  prerequisite: { type: String, required: true },
  unit: { type: Number, required: true },
  effective: { type: String, required: true },
  offered: { type: String, required: true },
}, { collection: 'subjects' });

const subjectModel = mongoose.model("Subject", subjectSchema);
module.exports = subjectModel;
