const express = require('express');
const router = express.Router();
const AdminUserController = require('../controllers/adminUserController');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');

router.use(authMiddleware.verifyToken);
router.use(adminMiddleware.verifyAdmin);

router.get('/', AdminUserController.getAllUsers);

router.get('/:userId', AdminUserController.getUserById);

router.delete('/:userId', AdminUserController.deleteUser);

router.put('/:userId/role', AdminUserController.updateUserRole);

module.exports = router;