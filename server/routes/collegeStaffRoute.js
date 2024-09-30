const express = require('express');
const router = express.Router();

const {
  uploadUserProfiles,
  
} = require('../middleware/multerConfig');

const { 
  postCollegeStaff,
  getCollegeStaffDetails,
  updateCollegeStaffDetails,
  validateCurrentPassword,
  updateUserStatus
} = require('../controllers/collegeStaffController');

router.route('/post_college_staff').post(postCollegeStaff);
router.post('/validate-current-password-college-staff', validateCurrentPassword);


router.get('/get-college-staff-details/:id', getCollegeStaffDetails);

//PUT
router.put('/college-staff-details/:userId', uploadUserProfiles.single('user_profile'), updateCollegeStaffDetails);

// Update user status
router.patch('/update-college-staff-status/:userId', updateUserStatus);

module.exports = router;