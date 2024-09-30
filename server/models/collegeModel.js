const mongoose = require('mongoose');

const collegeSchema = new mongoose.Schema({
  college: {type: String, required: true},
}, {collection: 'colleges'});

const collegeModel = mongoose.model("CollegeModel", collegeSchema)
module.exports = collegeModel;
