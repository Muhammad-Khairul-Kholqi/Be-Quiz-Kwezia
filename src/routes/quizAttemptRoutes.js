const express = require('express');
const QuizAttemptController = require('../controllers/quizAttemptController');
const authMiddleware = require('../middleware/authMiddleware');
const router = express.Router();

router.get('/quiz/:quizId/leaderboard', QuizAttemptController.getQuizLeaderboard);

router.get('/play/:quizId',
    authMiddleware.verifyToken,
    QuizAttemptController.getQuizForPlay
);

router.post('/submit/:quizId',
    authMiddleware.verifyToken,
    QuizAttemptController.submitQuiz
);

router.get('/my-history',
    authMiddleware.verifyToken,
    QuizAttemptController.getMyHistory
);

router.get('/check/:quizId',
    authMiddleware.verifyToken,
    QuizAttemptController.checkCompletion
);

module.exports = router;