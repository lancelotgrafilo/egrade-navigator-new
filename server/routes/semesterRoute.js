// routes/semesterRoute.js
const express = require('express');
const router = express.Router();
const { getAllSemesters, createSemester } = require('../controllers/semesterController');

router.get('/semesters', getAllSemesters);
router.post('/semesters', createSemester);

module.exports = router;
