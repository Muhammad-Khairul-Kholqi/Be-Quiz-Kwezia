const express = require('express');
const BlogController = require('../controllers/blogController');
const authMiddleware = require('../middleware/authMiddleware');
const upload = require('../config/multer');
const router = express.Router();

router.get('/', BlogController.getAll);
router.get('/:id', BlogController.getById);
router.get('/category/:categoryId', BlogController.getByCategory);

router.post('/',
    authMiddleware.verifyToken,
    authMiddleware.isAdmin,
    upload.single('image'),
    BlogController.create
);

router.put('/:id',
    authMiddleware.verifyToken,
    authMiddleware.isAdmin,
    upload.single('image'),
    BlogController.update
);

router.delete('/:id',
    authMiddleware.verifyToken,
    authMiddleware.isAdmin,
    BlogController.delete
);

module.exports = router;