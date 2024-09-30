// routes/yearLevelRoutes.js
const express = require('express');
const router = express.Router();
const { getAllYearLevels, createYearLevel } = require('../controllers/yearLevelController');

router.get('/year-levels', getAllYearLevels);
router.post('/year-levels', createYearLevel);

module.exports = router;
