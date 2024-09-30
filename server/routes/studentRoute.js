const express = require("express");
const router = express.Router();
const multer = require('multer');

// const upload = multer({ dest: 'uploads/' });

const upload = multer({ storage: multer.memoryStorage() });

const { 
  uploadUserProfiles
} = require('../middleware/multerConfig');

const { 
  getStudent,
  getStudentToClassProg,
  deleteStudent,
  postRegisterStudent,
  postStudentsFileUpload,
  getStudentById,
  postStudentSubject,
  deleteStudentSubject,
  updateStudentDetails,
  getStudentDetails,
  validateCurrentPassword,
  addSubjectsToStudent,
  getStudentSubjects,
  updateUserStatus
} = require("../controllers/studentController");

// GET
router.route('/get_students').get(getStudent);
router.route("/get_student_to_class_prog").get(getStudentToClassProg);
router.route('/get_students/:id').get(getStudentById);
router.get('/get-student-details/:id', getStudentDetails);
router.get('/students-subjects/:userId', getStudentSubjects);

// POST
router.route('/post_register_student').post(postRegisterStudent);
router.route('/post_student_upload').post(upload.single('file'), postStudentsFileUpload);
router.route('/post_student_subject').post(postStudentSubject);
router.post('/validate-current-password-student', validateCurrentPassword);
router.post('/students/:id/add-subjects', addSubjectsToStudent);

// PUT
router.put('/student-details/:userId', uploadUserProfiles.single('user_profile'), updateStudentDetails);

// DELETE
router.route('/del_student/:id').delete(deleteStudent);
router.route('/del_student_subject/:id').delete(deleteStudentSubject);

  // Update user status
router.patch('/update-student-status/:userId', updateUserStatus);

module.exports = router;