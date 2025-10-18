const express = require('express');
const QuizController = require('../controllers/quizController');
const authMiddleware = require('../middleware/authMiddleware');
const upload = require('../config/multer');
const router = express.Router();

router.get('/', QuizController.getAll);
router.get('/:id', QuizController.getById);
router.get('/category/:categoryId', QuizController.getByCategory);

router.post('/',
    authMiddleware.verifyToken,
    authMiddleware.isAdmin,
    upload.single('image_cover'),
    QuizController.create
);

router.put('/:id',
    authMiddleware.verifyToken,
    authMiddleware.isAdmin,
    upload.single('image_cover'),
    QuizController.update
);

router.delete('/:id',
    authMiddleware.verifyToken,
    authMiddleware.isAdmin,
    QuizController.delete
);

module.exports = router;