// routes/academicYearRoutes.js
const express = require('express');
const router = express.Router();
const { getAllAcademicYears, createAcademicYear } = require('../controllers/academicYearController');

router.get('/academic-years', getAllAcademicYears);
router.post('/academic-years', createAcademicYear);

module.exports = router;
