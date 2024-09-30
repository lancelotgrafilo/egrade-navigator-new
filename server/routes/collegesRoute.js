const express = require('express');
const router = express.Router();
const { getColleges, addColleges } = require('../controllers/collegesController');

// Route to get all colleges
router.get('/colleges', getColleges);

// Route to add a new colleges
router.post('/colleges', addColleges);

module.exports = router;
