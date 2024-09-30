const express = require('express');
const router = express.Router();

const { 
  getLeaderboard 
} = require('../controllers/leaderboardController');

router.route('/get_leaderboard').get(getLeaderboard);

module.exports = router;
