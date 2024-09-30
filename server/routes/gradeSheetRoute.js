const express = require("express");
const router = express.Router();

const {
  getAllGradeSheet
} = require("../controllers/gradeSheetController");

router.get('/get-grade-sheet', getAllGradeSheet); // Fixed the typo in router.get

module.exports = router;
