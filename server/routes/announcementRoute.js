// routes/announcementRoutes.js
const express = require('express');
const router = express.Router();
const announcementController = require('../controllers/announcementController');

// GET
router.get('/announcements', announcementController.getAnnouncements);

// POST
router.post('/announcements', announcementController.createAnnouncement);

module.exports = router;
