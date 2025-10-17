const express = require('express');
const CategoryQuizController = require('../controllers/categoryQuizController');
const authMiddleware = require('../middleware/authMiddleware');
const router = express.Router();

router.get('/', CategoryQuizController.getAll);
router.get('/:id', CategoryQuizController.getById);

router.post('/',
    authMiddleware.verifyToken,
    authMiddleware.isAdmin,
    CategoryQuizController.create
);

router.put('/:id',
    authMiddleware.verifyToken,
    authMiddleware.isAdmin,
    CategoryQuizController.update
);

router.delete('/:id',
    authMiddleware.verifyToken,
    authMiddleware.isAdmin,
    CategoryQuizController.delete
);

module.exports = router;