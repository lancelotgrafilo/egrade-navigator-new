// routes/authRoutes.js

const express = require('express');
const { postLogin } = require('../controllers/loginController');

const router = express.Router();

router.post('/login', postLogin);

module.exports = router;
