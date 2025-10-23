const express = require('express');
const UserProfileController = require('../controllers/userProfileController');
const authMiddleware = require('../middleware/authMiddleware');
const router = express.Router();

router.get('/public/:userId', UserProfileController.getPublicProfile);

router.get('/me',
    authMiddleware.verifyToken,
    UserProfileController.getProfile
);

router.put('/me',
    authMiddleware.verifyToken,
    UserProfileController.updateProfile
);

router.put('/avatar',
    authMiddleware.verifyToken,
    UserProfileController.updateAvatar
);

router.delete('/avatar',
    authMiddleware.verifyToken,
    UserProfileController.removeAvatar
);

module.exports = router;