const mongoose = require('mongoose');

const collegeStaffSchema = new mongoose.Schema({
  ID: { type: String, default: "cs-001" },
  last_name: { type: String, require: true },
  first_name: { type: String, require: true },
  middle_initial: { type: String, require: true },
  password: { type: String, required: false },
  title: { type: String, default: "college_staff" },
  email: { type: String, required: true, unique: true },
  user_profile: { type: String, default: null },
  isActive: { type: Boolean, default: false },
  isVerified: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
}, { collection: 'collegeStaffs' });

const generateNextID = async () => {
  const lastCollegeStaff = await collegeStaffModel.findOne().sort({ ID: -1 }).exec();
  if (lastCollegeStaff && lastCollegeStaff.ID) {
    const lastIDNumber = parseInt(lastCollegeStaff.ID.split('-')[1], 10);
    return `cs-${(lastIDNumber + 1).toString().padStart(3, "0") }`;
  }
  return `cs-001`;
}

collegeStaffSchema.pre('save', async function (next) {
  if (this.isNew) {
    // Set the auto-incrementing ID
    this.ID = await generateNextID();

    // Capitalize the first letter of first_name, last_name, and middle_initial
    this.first_name = this.first_name.charAt(0).toUpperCase() + this.first_name.slice(1).toLowerCase();
    this.last_name = this.last_name.charAt(0).toUpperCase() + this.last_name.slice(1).toLowerCase();
    this.middle_initial = this.middle_initial.charAt(0).toUpperCase(); // Capitalize the first character
  }

  next();
});

const collegeStaffModel = new mongoose.model("College", collegeStaffSchema);
module.exports = collegeStaffModel;