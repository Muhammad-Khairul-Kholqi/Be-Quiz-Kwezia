const express = require('express');
const CategoryBlogController = require('../controllers/categoryBlogController');
const authMiddleware = require('../middleware/authMiddleware');
const router = express.Router();

router.get('/', CategoryBlogController.getAll);
router.get('/:id', CategoryBlogController.getById);

router.post('/',
    authMiddleware.verifyToken,
    authMiddleware.isAdmin,
    CategoryBlogController.create
);

router.put('/:id',
    authMiddleware.verifyToken,
    authMiddleware.isAdmin,
    CategoryBlogController.update
);

router.delete('/:id',
    authMiddleware.verifyToken,
    authMiddleware.isAdmin,
    CategoryBlogController.delete
);

module.exports = router;