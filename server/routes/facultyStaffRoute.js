const express = require("express");
const router = express.Router();

const {
  postFacultyStaff,
  getFacultyStaff,
  getFacultyToClassProg,
  getInstructorById,
  postInstructorsLoad,
  deleteFacultyStaff,
  deleteInstructorsLoad,
  postInstructorsLoadFileUpload,
  addStudentToInstructorsStudents,
  deleteStudentFromLoad,
  uploadStudentsCSV,
  getFacultyDetails,
  updateStudentGrades,
  uploadGradeSheet,
  uploadRemovalCompletionForm,
  updateFacultyDetails,
  validateCurrentPassword,
  getStudentDetailsByLastName,
  postFacultyStaffFileUpload,
  updateUserStatus
} = require('../controllers/facultyStaffController');


const {
  upload, 
  uploadCSV,
  uploadRemovalCompletionStorage,
  uploadUserProfiles,
} = require('../middleware/multerConfig');

// GET
router.route('/get_faculty_staff').get(getFacultyStaff);
router.route("/get_faculty_staff/:id").get(getInstructorById);
router.route('/get_faculty_to_class_prog').get(getFacultyToClassProg);
router.route('/get_faculty_details/:id').get(getFacultyDetails);
router.get('/student-lookup', getStudentDetailsByLastName);

// POST
router.route('/post_faculty_staff').post(postFacultyStaff);
router.route('/post_instructors_load').post(postInstructorsLoad);
router.route('/post_instructors_load_upload').post(upload.single('file'), postInstructorsLoadFileUpload);
router.route('/post_instructors_load_student/:facultyId/load/:loadId/add_student').post(addStudentToInstructorsStudents);
router.route('/post_instructors_load_upload_students/:instructorId/load/:loadId').post(upload.single('file'), uploadStudentsCSV);
router.route('/post_update_final_grade').post(updateStudentGrades);
router.post('/post_upload_gradeSheet', upload.single('file'), uploadGradeSheet);
router.post('/post-upload-removal-completion-form', uploadRemovalCompletionStorage.single('file'), uploadRemovalCompletionForm);
router.post('/validate-current-password-facultyStaff', validateCurrentPassword);
router.route('/post_faculty_staff_upload').post(uploadCSV.single('file'), postFacultyStaffFileUpload);

// DELETE
router.route('/del_faculty_staff/:id').delete(deleteFacultyStaff);
router.route('/del_instructors_load/:id').delete(deleteInstructorsLoad);
router.route('/post_instructors_load_student/:instructorId/load/:loadId/student/:studentId').delete(deleteStudentFromLoad);

// PUT
router.put('/faculty-details/:userId', uploadUserProfiles.single('user_profile'), updateFacultyDetails);

// Update user status
router.patch('/update-faculty-staff-status/:userId', updateUserStatus);

module.exports = router;
