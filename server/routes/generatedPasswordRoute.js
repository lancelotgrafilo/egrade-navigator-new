const express = require('express');
const router = express.Router();

const { postGeneratePassword } = require('../controllers/generatePasswordController'); // Ensure this file exists and exports the correct function

router.route("/").post(postGeneratePassword);

module.exports = router;
