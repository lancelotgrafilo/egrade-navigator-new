const express = require("express");
const router = express.Router();
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

const { 
  getSubject,
  postSubject,
  updateSubject,
  getSubjectId,
  deleteSubject,
  uploadSubjectCSV
} = require('../controllers/subjectsController');

// GET
router.route('/get_subjects').get(getSubject);
router.route('/get_subject/:id').get(getSubjectId);

// POST
router.route('/post_subjects').post(postSubject);
router.route('/post_upload_subjects').post(upload.single('file'), uploadSubjectCSV);

// PUT
router.route('/update_subject/:id').put(updateSubject);

// DELETE
router.route('/del_subject/:id').delete(deleteSubject);

module.exports = router;
