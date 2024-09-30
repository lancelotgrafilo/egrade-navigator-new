const express = require('express');
const router = express.Router();

const {
  postRegister,
  registerCompleted,
  getAllConfirmStudents,
  approveStudent,
  rejectStudent
} = require('../controllers/registerController')

router.post('/register', postRegister);
router.post('/confirm-register', registerCompleted);
router.post('/approve-student/:id', approveStudent);
router.post('/reject-student/:id', rejectStudent);

// GET
router.get('/confirm-students', getAllConfirmStudents);


// Route to approve a student


// Route to reject a student

module.exports = router;