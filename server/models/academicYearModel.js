const mongoose = require('mongoose');

const academicYearSchema = new mongoose.Schema({
  ay: {type: String, required: true},
}, {collection: 'academicYears'});

const academicYearModel = mongoose.model("AcademicYear", academicYearSchema)
module.exports = academicYearModel;
