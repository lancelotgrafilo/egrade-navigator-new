const express = require('express');
const multer = require('multer');
const router = express.Router();

const { 
  getClassProgram, 
  postClassProgram,
  postClassProgramFileUpload,
  getClassProgramInstructor,
  getClassProgramStudent,
  addInstructorToClassProgram,
  addStudentToClassProgram,
  deleteClassProgram,
  deleteInstructor,
  deleteStudent,
  updateClassProgram,
  getClassProgramById,
  uploadFileStudentsToClassProgram
} = require('../controllers/classProgramController');

// Set up multer for file uploads
const upload = multer({ dest: 'uploads/' });

// GET

router.route('/get_class_program').get(getClassProgram);
router.route('/get_class_program/:id').get(getClassProgramById);
router.route('/get_class_program_instructor/:id').get(getClassProgramInstructor);
router.route('/get_class_program_students/:id').get(getClassProgramStudent);

// POST
router.route('/post_class_program').post(postClassProgram);
router.route('/post_class_program_upload').post(upload.single('file'), postClassProgramFileUpload);
router.route('/post_class_program_instructor/:id/add_instructor').post(addInstructorToClassProgram);
router.route('/post_class_program_students/:id/add_student').post(addStudentToClassProgram);
router.route('/upload_students/:id').post(upload.single('file'), uploadFileStudentsToClassProgram);

// PUT
router.route('/update_class_program/:id').put(updateClassProgram);

// DELETE
router.route('/del_class_program/:id').delete(deleteClassProgram);
router.route('/del_class_program_instructor/:classProgramId/:instructorId').delete(deleteInstructor);
router.route('/del_class_program_student/:classProgramId/:schoolId').delete(deleteStudent);


module.exports = router;
