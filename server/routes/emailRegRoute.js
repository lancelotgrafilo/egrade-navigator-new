const express = require("express");
const router = express.Router();

const {
  sendEmailRegister,
  sendRegisterCompleted

} = require('../controllers/emailRegController');

router.route('/post_send_emailConfirmation').post(sendEmailRegister);
router.post('/register-completed', sendRegisterCompleted);

module.exports = router;