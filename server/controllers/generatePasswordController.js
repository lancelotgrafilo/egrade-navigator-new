const adminModel = require('../models/admin'); // Ensure this file exists and exports the admin model
const asyncHandler = require('express-async-handler');

const postGeneratePassword = asyncHandler(async (req, res) => {
  // Implement logic to retrieve the generated password
  const latestAdmin = await adminModel.findOne().sort({ createdAt: -1 });
  if (latestAdmin && latestAdmin.generatedPassword) {
    res.json({ generatedPassword: latestAdmin.generatedPassword });
  } else {
    res.status(404).json({ message: 'No generated password found' });
  }
});

module.exports = {
  postGeneratePassword
};
