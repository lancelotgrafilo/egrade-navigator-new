const mongoose = require('mongoose');

const semesterSchema = new mongoose.Schema({
  semester: {type: String, required: true},
}, {collection: 'semesters'});

const semesterModel = mongoose.model("Semesters", semesterSchema)
module.exports = semesterModel;
