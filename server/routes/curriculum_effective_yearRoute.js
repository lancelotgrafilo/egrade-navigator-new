const express = require('express');
const router = express.Router();
const { getCurriculumEffectiveYear, addCurriculumEffectiveYear } = require('../controllers/curriculum_effective_yearController');

// Route to get all colleges
router.get('/curriculum_effective_year', getCurriculumEffectiveYear);

// Route to add a new colleges
router.post('/curriculum_effective_year', addCurriculumEffectiveYear);

module.exports = router;
