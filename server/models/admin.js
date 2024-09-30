const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema({
  ID: { type: String, required: true, unique: true },
  last_name: { type: String, required: true },
  first_name: { type: String, required: true },
  middle_initial: { type: String, required: true },
  password: { type: String, required: false },
  title: { type: String, default: "admin" },
  email: { type: String, required: true, unique: true },
  user_profile: { type: String, default: null },
  isActive: { type: Boolean, default: false },
  isVerified: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
}, { collection: 'admins' });

// Function to generate the next ID based on the previous ID
const generateNextID = async () => {
  const lastAdmin = await adminModel.findOne().sort({ ID: -1 }).exec();
  if (lastAdmin && lastAdmin.ID) {
    const lastIDNumber = parseInt(lastAdmin.ID.split('-')[1], 10);
    return `admin-${(lastIDNumber + 1).toString().padStart(3, '0')}`;
  }
  return 'admin-001'; // Default ID if no admins exist
};

// Middleware to set the ID before saving
adminSchema.pre('save', async function (next) {
  if (this.isNew) {
    this.ID = await generateNextID();

    // Ensure the first letter of first_name, last_name, and middle_initial are uppercase
    this.first_name = this.first_name.charAt(0).toUpperCase() + this.first_name.slice(1).toLowerCase();
    this.last_name = this.last_name.charAt(0).toUpperCase() + this.last_name.slice(1).toLowerCase();
    this.middle_initial = this.middle_initial.charAt(0).toUpperCase(); // Only the first character
  }
  next();
});

const adminModel = mongoose.model('Admin', adminSchema);
module.exports = adminModel;
