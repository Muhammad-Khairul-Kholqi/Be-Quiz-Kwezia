const QuizModel = require('../models/quizModel');
const QuizQuestionModel = require('../models/quizQuestionModel');
const CategoryQuizModel = require('../models/categoryQuizModel');
const supabase = require('../config/supabase');
const fs = require('fs');

class QuizController {
    static async getAll(req, res) {
        try {
            const quizzes = await QuizModel.getAll();
            res.status(200).json({
                success: true,
                data: quizzes
            });
        } catch (err) {
            res.status(500).json({
                success: false,
                message: 'Failed to fetch quiz data',
                error: err.message
            });
        }
    }

    static async getById(req, res) {
        try {
            const {
                id
            } = req.params;
            const quiz = await QuizModel.getById(id);

            if (!quiz) {
                return res.status(404).json({
                    success: false,
                    message: 'Quiz not found'
                });
            }

            res.status(200).json({
                success: true,
                data: quiz
            });
        } catch (err) {
            res.status(500).json({
                success: false,
                message: 'Failed to fetch quiz data',
                error: err.message
            });
        }
    }

    static async getByCategory(req, res) {
        try {
            const {
                categoryId
            } = req.params;

            const category = await CategoryQuizModel.getById(categoryId);
            if (!category) {
                return res.status(404).json({
                    success: false,
                    message: 'Category not found'
                });
            }

            const quizzes = await QuizModel.getByCategory(categoryId);
            res.status(200).json({
                success: true,
                data: quizzes
            });
        } catch (err) {
            res.status(500).json({
                success: false,
                message: 'Failed to fetch quiz data by category',
                error: err.message
            });
        }
    }

    static async create(req, res) {
        try {
            let {
                category_id,
                title,
                questions
            } = req.body;

            if (!category_id || !title || !title.trim()) {
                return res.status(400).json({
                    success: false,
                    message: 'Category ID and title are required'
                });
            }

            if (typeof questions === 'string') {
                try {
                    questions = JSON.parse(questions);
                } catch (parseError) {
                    return res.status(400).json({
                        success: false,
                        message: 'Invalid JSON format for questions',
                        error: parseError.message
                    });
                }
            }

            if (!questions || !Array.isArray(questions) || questions.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Questions array is required and must not be empty'
                });
            }

            const category = await CategoryQuizModel.getById(category_id);
            if (!category) {
                return res.status(404).json({
                    success: false,
                    message: 'Category not found'
                });
            }

            for (let i = 0; i < questions.length; i++) {
                const q = questions[i];
                if (!q.question || !q.option_a || !q.option_b || !q.option_c || !q.option_d || !q.correct_answer) {
                    return res.status(400).json({
                        success: false,
                        message: `Question ${i + 1}: All fields are required (question, option_a, option_b, option_c, option_d, correct_answer)`
                    });
                }
                if (!['A', 'B', 'C', 'D'].includes(q.correct_answer.toUpperCase())) {
                    return res.status(400).json({
                        success: false,
                        message: `Question ${i + 1}: correct_answer must be A, B, C, or D`
                    });
                }
            }

            let imageCoverUrl = null;

            if (req.file) {
                const file = req.file;
                const fileExt = file.originalname.split('.').pop();
                const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

                const {
                    data: uploadData,
                    error: uploadError
                } = await supabase.storage
                    .from('quiz-cover-image')
                    .upload(fileName, fs.readFileSync(file.path), {
                        contentType: file.mimetype,
                        upsert: false
                    });

                fs.unlinkSync(file.path);

                if (uploadError) {
                    return res.status(500).json({
                        success: false,
                        message: 'Failed to upload cover image',
                        error: uploadError.message
                    });
                }

                const {
                    data: urlData
                } = supabase.storage
                    .from('quiz-cover-image')
                    .getPublicUrl(fileName);

                imageCoverUrl = urlData.publicUrl;
            }

            const newQuiz = await QuizModel.create({
                category_id,
                title: title.trim(),
                total_questions: questions.length,
                image_cover: imageCoverUrl,
                created_by: req.user.id
            });

            const questionsData = questions.map((q, index) => ({
                quiz_id: newQuiz.id,
                question: q.question.trim(),
                option_a: q.option_a.trim(),
                option_b: q.option_b.trim(),
                option_c: q.option_c.trim(),
                option_d: q.option_d.trim(),
                correct_answer: q.correct_answer.toUpperCase(),
                question_order: index + 1
            }));

            await QuizQuestionModel.createBulk(questionsData);

            const completeQuiz = await QuizModel.getById(newQuiz.id);

            return res.status(201).json({
                success: true,
                message: 'Quiz successfully created',
                data: completeQuiz
            });
        } catch (err) {
            if (req.file && fs.existsSync(req.file.path)) {
                fs.unlinkSync(req.file.path);
            }

            return res.status(500).json({
                success: false,
                message: 'Failed to create quiz',
                error: err.message
            });
        }
    }

    static async update(req, res) {
        try {
            const {
                id
            } = req.params;
            const existing = await QuizModel.getById(id);

            if (!existing) {
                return res.status(404).json({
                    success: false,
                    message: 'Quiz not found'
                });
            }

            let {
                category_id,
                title,
                questions
            } = req.body;

            if (category_id) {
                const category = await CategoryQuizModel.getById(category_id);
                if (!category) {
                    return res.status(404).json({
                        success: false,
                        message: 'Category not found'
                    });
                }
            }

            if (questions && typeof questions === 'string') {
                try {
                    questions = JSON.parse(questions);
                } catch (parseError) {
                    return res.status(400).json({
                        success: false,
                        message: 'Invalid JSON format for questions',
                        error: parseError.message
                    });
                }
            }

            if (questions) {
                if (!Array.isArray(questions) || questions.length === 0) {
                    return res.status(400).json({
                        success: false,
                        message: 'Questions must be a non-empty array'
                    });
                }

                for (let i = 0; i < questions.length; i++) {
                    const q = questions[i];
                    if (!q.question || !q.option_a || !q.option_b || !q.option_c || !q.option_d || !q.correct_answer) {
                        return res.status(400).json({
                            success: false,
                            message: `Question ${i + 1}: All fields are required`
                        });
                    }
                    if (!['A', 'B', 'C', 'D'].includes(q.correct_answer.toUpperCase())) {
                        return res.status(400).json({
                            success: false,
                            message: `Question ${i + 1}: correct_answer must be A, B, C, or D`
                        });
                    }
                }
            }

            const updateData = {};
            if (category_id !== undefined) updateData.category_id = category_id;
            if (title !== undefined) updateData.title = title.trim();
            if (questions !== undefined) updateData.total_questions = questions.length;

            if (req.file) {
                const file = req.file;
                const fileExt = file.originalname.split('.').pop();
                const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

                const {
                    data: uploadData,
                    error: uploadError
                } = await supabase.storage
                    .from('quiz-cover-image')
                    .upload(fileName, fs.readFileSync(file.path), {
                        contentType: file.mimetype,
                        upsert: false
                    });

                fs.unlinkSync(file.path);

                if (uploadError) {
                    return res.status(500).json({
                        success: false,
                        message: 'Failed to upload cover image',
                        error: uploadError.message
                    });
                }

                if (existing.image_cover) {
                    const oldFileName = existing.image_cover.split('/').pop();
                    await supabase.storage
                        .from('quiz-cover-image')
                        .remove([oldFileName]);
                }

                const {
                    data: urlData
                } = supabase.storage
                    .from('quiz-cover-image')
                    .getPublicUrl(fileName);

                updateData.image_cover = urlData.publicUrl;
            }

            await QuizModel.update(id, updateData);

            if (questions) {
                await QuizQuestionModel.deleteByQuizId(id);

                const questionsData = questions.map((q, index) => ({
                    quiz_id: id,
                    question: q.question.trim(),
                    option_a: q.option_a.trim(),
                    option_b: q.option_b.trim(),
                    option_c: q.option_c.trim(),
                    option_d: q.option_d.trim(),
                    correct_answer: q.correct_answer.toUpperCase(),
                    question_order: index + 1
                }));

                await QuizQuestionModel.createBulk(questionsData);
            }

            const updatedQuiz = await QuizModel.getById(id);

            res.status(200).json({
                success: true,
                message: 'Quiz successfully updated',
                data: updatedQuiz
            });
        } catch (err) {
            if (req.file && fs.existsSync(req.file.path)) {
                fs.unlinkSync(req.file.path);
            }

            res.status(500).json({
                success: false,
                message: 'Failed to update quiz',
                error: err.message
            });
        }
    }

    static async delete(req, res) {
        try {
            const {
                id
            } = req.params;
            const existing = await QuizModel.getById(id);

            if (!existing) {
                return res.status(404).json({
                    success: false,
                    message: 'Quiz not found'
                });
            }

            if (existing.image_cover) {
                const fileName = existing.image_cover.split('/').pop();
                await supabase.storage
                    .from('quiz-cover-image')
                    .remove([fileName]);
            }

            await QuizQuestionModel.deleteByQuizId(id);

            await QuizModel.delete(id);

            res.status(200).json({
                success: true,
                message: 'Quiz has been successfully deleted'
            });
        } catch (err) {
            res.status(500).json({
                success: false,
                message: 'Failed to delete quiz',
                error: err.message
            });
        }
    }
}

module.exports = QuizController;