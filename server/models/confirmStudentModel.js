const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const confirmStudentSchema = new mongoose.Schema({
  ID: { type: String, unique: true, default: () => uuidv4() }, // Generate a unique ID
  last_name: { type: String, required: true },
  first_name: { type: String, required: true },
  middle_initial: { type: String, required: true },
  schoolID: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
}, { collection: 'confirmStudents' });


const confirmStudentModel = mongoose.model('ConfirmStudent', confirmStudentSchema);
module.exports = confirmStudentModel;
