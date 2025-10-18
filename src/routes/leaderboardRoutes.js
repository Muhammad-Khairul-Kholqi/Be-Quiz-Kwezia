const express = require('express');
const LeaderboardController = require('../controllers/leaderboardController');
const authMiddleware = require('../middleware/authMiddleware');
const router = express.Router();

router.get('/', LeaderboardController.getTopUsers);
router.get('/user/:userId', LeaderboardController.getUserRank);

router.get('/me',
    authMiddleware.verifyToken,
    LeaderboardController.getMyRank
);

router.get('/with-me',
    authMiddleware.verifyToken,
    LeaderboardController.getLeaderboardWithUser
);

module.exports = router;