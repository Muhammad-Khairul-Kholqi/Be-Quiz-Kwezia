const express = require('express');
const AvatarController = require('../controllers/avatarController');
const authMiddleware = require('../middleware/authMiddleware');
const upload = require('../config/multer');
const router = express.Router();

router.get('/active', AvatarController.getActive);
router.get('/:id', AvatarController.getById);

router.get('/',
    authMiddleware.verifyToken,
    authMiddleware.isAdmin,
    AvatarController.getAll
);

router.post('/',
    authMiddleware.verifyToken,
    authMiddleware.isAdmin,
    upload.single('image'),
    AvatarController.create
);

router.put('/:id',
    authMiddleware.verifyToken,
    authMiddleware.isAdmin,
    upload.single('image'),
    AvatarController.update
);

router.delete('/:id',
    authMiddleware.verifyToken,
    authMiddleware.isAdmin,
    AvatarController.delete
);

module.exports = router;