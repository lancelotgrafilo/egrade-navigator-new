// routes/activeUsers.js
const express = require('express');
const router = express.Router();
const { getAllUsers } = require('../controllers/activeUsersController');

// Route to get all users
router.get('/all-users', getAllUsers);

module.exports = router;
