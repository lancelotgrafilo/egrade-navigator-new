const express = require("express");
const router = express.Router();

const {
  updateVerificationStatus
} = require('../controllers/verifyController');

router.post('/update-verification-status', updateVerificationStatus);

module.exports = router;