// routes/usersListRoutes.js

const express = require('express');
const router = express.Router();
const { getAllUsers, deleteUser } = require('../controllers/usersListController');

// Route to get all users
router.route('/get_users').get(getAllUsers);

// Route to delete a user
router.route('/delete_user/:userType/:id').delete(deleteUser);

module.exports = router;
