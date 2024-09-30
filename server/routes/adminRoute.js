const express = require('express');
const router = express.Router();

const {
  uploadUserProfiles,
} = require('../middleware/multerConfig');

const {
  postAdmin,
  getAdminDetails,
  validateCurrentPassword,
  updateAdminDetails,
  updateUserStatus
} = require('../controllers/adminController');

// POST
router.post('/post_admin', postAdmin);
router.post('/validate-current-password-admin', validateCurrentPassword);

// GET
router.get('/get-admin-details/:id', getAdminDetails);

//PUT
router.put('/admin-details/:userId', uploadUserProfiles.single('user_profile'), updateAdminDetails);

// Update user status
router.patch('/update-admin-status/:userId', updateUserStatus);

module.exports = router;