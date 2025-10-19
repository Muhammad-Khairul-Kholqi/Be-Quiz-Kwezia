const QuizAttemptModel = require('../models/quizAttemptModel');
const QuizModel = require('../models/quizModel');
const QuizQuestionModel = require('../models/quizQuestionModel');
const userModel = require('../models/userModel');
const supabase = require('../config/supabase');

class QuizAttemptController {
    static async getQuizForPlay(req, res) {
        try {
            const {
                quizId
            } = req.params;

            const quiz = await QuizModel.getById(quizId);
            if (!quiz) {
                return res.status(404).json({
                    success: false,
                    message: 'Quiz not found'
                });
            }

            const questionsWithoutAnswers = quiz.quiz_questions.map(q => ({
                id: q.id,
                question: q.question,
                option_a: q.option_a,
                option_b: q.option_b,
                option_c: q.option_c,
                option_d: q.option_d,
                question_order: q.question_order
            }));

            res.status(200).json({
                success: true,
                data: {
                    id: quiz.id,
                    title: quiz.title,
                    total_questions: quiz.total_questions,
                    time_limit: quiz.time_limit, 
                    image_cover: quiz.image_cover,
                    category_quiz: quiz.category_quiz,
                    questions: questionsWithoutAnswers,
                    started_at: new Date().toISOString() 
                }
            });
        } catch (err) {
            res.status(500).json({
                success: false,
                message: 'Failed to fetch quiz',
                error: err.message
            });
        }
    }

    static async submitQuiz(req, res) {
        try {
            const {
                quizId
            } = req.params;
            const {
                answers,
                started_at
            } = req.body;
            const userId = req.user.id;

            if (!answers || !Array.isArray(answers) || answers.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Answers array is required'
                });
            }

            if (!started_at) {
                return res.status(400).json({
                    success: false,
                    message: 'Started timestamp is required'
                });
            }

            const quiz = await QuizModel.getById(quizId);
            if (!quiz) {
                return res.status(404).json({
                    success: false,
                    message: 'Quiz not found'
                });
            }

            const startTime = new Date(started_at);
            const submitTime = new Date();
            const elapsedMinutes = (submitTime - startTime) / 1000 / 60;

            if (elapsedMinutes > quiz.time_limit) {
                return res.status(400).json({
                    success: false,
                    message: `Time limit exceeded! Quiz must be completed within ${quiz.time_limit} minutes. You took ${Math.ceil(elapsedMinutes)} minutes.`,
                    time_limit: quiz.time_limit,
                    time_taken: Math.ceil(elapsedMinutes)
                });
            }

            if (answers.length !== quiz.total_questions) {
                return res.status(400).json({
                    success: false,
                    message: `Please answer all ${quiz.total_questions} questions`
                });
            }

            let totalCorrect = 0;
            const results = [];

            for (let i = 0; i < answers.length; i++) {
                const userAnswer = answers[i];
                const question = quiz.quiz_questions.find(q => q.id === userAnswer.question_id);

                if (!question) {
                    return res.status(400).json({
                        success: false,
                        message: `Invalid question_id: ${userAnswer.question_id}`
                    });
                }

                const userAnswerUpper = userAnswer.answer.toUpperCase();
                if (!['A', 'B', 'C', 'D'].includes(userAnswerUpper)) {
                    return res.status(400).json({
                        success: false,
                        message: 'Answer must be A, B, C, or D'
                    });
                }

                const isCorrect = userAnswerUpper === question.correct_answer;
                if (isCorrect) totalCorrect++;

                results.push({
                    question_id: question.id,
                    question: question.question,
                    your_answer: userAnswerUpper,
                    correct_answer: question.correct_answer,
                    is_correct: isCorrect
                });
            }

            const score = Math.round((totalCorrect / quiz.total_questions) * 100);
            const isPerfect = totalCorrect === quiz.total_questions;

            const attempt = await QuizAttemptModel.create({
                user_id: userId,
                quiz_id: quizId,
                score: score,
                total_correct: totalCorrect,
                is_perfect: isPerfect,
                started_at: startTime
            });

            const currentStats = await QuizAttemptModel.getUserStats(userId);

            const pointsEarned = totalCorrect * 10;

            const updatedStats = {
                total_points: currentStats.total_points + pointsEarned,
                total_quiz_completed: currentStats.total_quiz_completed + 1,
                total_perfect_attempts: isPerfect ?
                    currentStats.total_perfect_attempts + 1 :
                    currentStats.total_perfect_attempts
            };

            await userModel.update(userId, updatedStats);

            const previousAttempt = await supabase
                .from('quiz_attempts')
                .select('id')
                .eq('user_id', userId)
                .eq('quiz_id', quizId)
                .order('completed_at', {
                    ascending: true
                })
                .limit(1)
                .single();

            if (!previousAttempt.data || previousAttempt.data.id === attempt.id) {
                await supabase.rpc('increment', {
                    row_id: quizId,
                    x: 1
                });
            }

            res.status(200).json({
                success: true,
                message: isPerfect ?
                    '🎉 Perfect score! Congratulations!' :
                    'Quiz completed successfully',
                data: {
                    attempt_id: attempt.id,
                    score: score,
                    total_correct: totalCorrect,
                    total_questions: quiz.total_questions,
                    is_perfect: isPerfect,
                    points_earned: pointsEarned,
                    time_taken: Math.ceil(elapsedMinutes),
                    time_limit: quiz.time_limit,
                    results: results,
                    updated_stats: updatedStats
                }
            });
        } catch (err) {
            res.status(500).json({
                success: false,
                message: 'Failed to submit quiz',
                error: err.message
            });
        }
    }

    static async getMyHistory(req, res) {
        try {
            const userId = req.user.id;
            const limit = parseInt(req.query.limit) || 10;

            const attempts = await QuizAttemptModel.getUserAttempts(userId, limit);

            res.status(200).json({
                success: true,
                data: attempts
            });
        } catch (err) {
            res.status(500).json({
                success: false,
                message: 'Failed to fetch quiz history',
                error: err.message
            });
        }
    }

    static async getQuizLeaderboard(req, res) {
        try {
            const {
                quizId
            } = req.params;
            const limit = parseInt(req.query.limit) || 10;

            const quiz = await QuizModel.getById(quizId);
            if (!quiz) {
                return res.status(404).json({
                    success: false,
                    message: 'Quiz not found'
                });
            }

            const attempts = await QuizAttemptModel.getQuizAttempts(quizId, limit);

            const leaderboard = attempts.map((attempt, index) => ({
                ...attempt,
                rank: index + 1
            }));

            res.status(200).json({
                success: true,
                data: {
                    quiz: {
                        id: quiz.id,
                        title: quiz.title,
                        total_questions: quiz.total_questions
                    },
                    leaderboard: leaderboard
                }
            });
        } catch (err) {
            res.status(500).json({
                success: false,
                message: 'Failed to fetch quiz leaderboard',
                error: err.message
            });
        }
    }

    static async checkCompletion(req, res) {
        try {
            const {
                quizId
            } = req.params;
            const userId = req.user.id;

            const attempt = await QuizAttemptModel.checkUserAttempt(userId, quizId);

            res.status(200).json({
                success: true,
                data: {
                    has_completed: !!attempt,
                    last_attempt: attempt
                }
            });
        } catch (err) {
            res.status(500).json({
                success: false,
                message: 'Failed to check completion',
                error: err.message
            });
        }
    }
}

module.exports = QuizAttemptController;