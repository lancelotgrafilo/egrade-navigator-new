// models/RemovalComplete.js

const mongoose = require('mongoose');

const RemovalCompleteSchema = new mongoose.Schema({
  date: { type: Date, required: true },
  last_name: { type: String, required: true },
  first_name: { type: String, required: true },
  middle_initial: { type: String, required: true },
  status: { type: String, required: true, enum: ['Removed', 'Completed'] },
  subject: { type: String, required: true },
  semester: { type: String, required: true },
  academic_year: { type: String, required: true },
  rating_obtained: { type: String, required: true },
  instructor_professor: { type: String, required: true },
  formImage: { type: String, required: true },
}, { timestamps: true, collection: 'RemovalComplete' });


module.exports = mongoose.model('RemovalComplete', RemovalCompleteSchema);
