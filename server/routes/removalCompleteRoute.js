

const express = require('express');
const router = express.Router();
const multer = require('multer');
const { 
  getAllRemovalCompletion 
} = require('../controllers/removalCompleteController');


router.get('/removal-completion', getAllRemovalCompletion);
module.exports = router;
