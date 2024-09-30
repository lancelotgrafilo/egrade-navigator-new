const adminModel = require('../models/admin');
const collegeStaffModel = require('../models/collegeStaffModel');
const facultyStaffModel = require('../models/facultyStaffModel');
const registrarStaffModel = require('../models/registrarStaffModel');

const isEmailRegistered = async (email) => {
  const adminExists = await adminModel.findOne({ email });
  if (adminExists) return true;

  const collegeStaffExists = await collegeStaffModel.findOne({ email });
  if (collegeStaffExists) return true;

  const facultyStaffExists = await facultyStaffModel.findOne({ email });
  if (facultyStaffExists) return true;

  const registrarStaffExists = await registrarStaffModel.findOne({ email });
  if (registrarStaffExists) return true;

  return false;
};

module.exports = { isEmailRegistered };
