const express = require('express');
const router = express.Router();
const { sendEmailSuccess } = require('../controllers/emailSuccessController');

router.post('/', async (req, res) => {
  try {
    await sendEmailSuccess(req, res);
  } catch (error) {
    res.status(500).json({ message: 'Error sending email', error: error.message });
  }
});

module.exports = router;
