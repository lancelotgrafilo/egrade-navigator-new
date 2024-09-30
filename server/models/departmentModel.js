const mongoose = require('mongoose');

const departmentSchema = new mongoose.Schema({
  department: {type: String, required: true},
}, {collection: 'departments'});

const departmentModel = mongoose.model("Department", departmentSchema)
module.exports = departmentModel;
