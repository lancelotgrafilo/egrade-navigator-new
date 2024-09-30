// routes/sectionRoute.js
const express = require('express');
const router = express.Router();
const { getAllSections, createSection } = require('../controllers/sectionController');

router.get('/sections', getAllSections);
router.post('/sections', createSection);

module.exports = router;
