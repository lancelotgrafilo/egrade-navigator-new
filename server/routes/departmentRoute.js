const express = require('express');
const router = express.Router();
const { getDepartments, addDepartment } = require('../controllers/departmentController');

// Route to get all departments
router.get('/departments', getDepartments);

// Route to add a new department
router.post('/departments', addDepartment);

module.exports = router;
