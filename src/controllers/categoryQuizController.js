const CategoryQuizModel = require('../models/categoryQuizModel');

class CategoryQuizController {
    static async getAll(req, res) {
        try {
            const category_quiz = await CategoryQuizModel.getAll();
            res.status(200).json({
                success: true,
                data: category_quiz
            });
        } catch (err) {
            res.status(500).json({
                success: false,
                message: 'Failed to retrieve Category Quiz data',
                error: err.message
            });
        }
    }

    static async getById(req, res) {
        try {
            const {
                id
            } = req.params;
            const category_quiz = await CategoryQuizModel.getById(id);

            if (!category_quiz) {
                return res.status(404).json({
                    success: false,
                    message: 'Category Quiz not found'
                });
            }

            res.status(200).json({
                success: true,
                data: category_quiz
            });
        } catch (err) {
            res.status(500).json({
                success: false,
                message: 'Failed to retrieve Category Quiz data',
                error: err.message
            });
        }
    }

    static async create(req, res) {
        try {
            const {
                name
            } = req.body;

            if (!name || !name.trim()) {
                return res.status(400).json({
                    success: false,
                    message: 'Name is required'
                });
            }

            const newCategoryQuiz = await CategoryQuizModel.create({
                name: name.trim(),
            });

            return res.status(201).json({
                success: true,
                message: 'Category Quiz added successfully',
                data: newCategoryQuiz
            });
        } catch (err) {
            return res.status(500).json({
                success: false,
                message: 'Failed to add Category Quiz',
                error: err.message
            });
        }
    }

    static async update(req, res) {
        try {
            const {
                id
            } = req.params;
            const existing = await CategoryQuizModel.getById(id);

            if (!existing) {
                return res.status(404).json({
                    success: false,
                    message: 'Category Quiz not found'
                });
            }

            const {
                name
            } = req.body;

            const updateData = {};
            if (name !== undefined) {
                updateData.name = name.trim();
            }

            const updatedCategoryQuiz = await CategoryQuizModel.update(id, updateData);

            res.status(200).json({
                success: true,
                message: 'Category Quiz updated successfully',
                data: updatedCategoryQuiz
            });
        } catch (err) {
            res.status(500).json({
                success: false,
                message: 'Failed to update Category Quiz',
                error: err.message
            });
        }
    }

    static async delete(req, res) {
        try {
            const {
                id
            } = req.params;
            const existing = await CategoryQuizModel.getById(id);

            if (!existing) {
                return res.status(404).json({
                    success: false,
                    message: 'Category Quiz not found'
                });
            }

            await CategoryQuizModel.delete(id);

            res.status(200).json({
                success: true,
                message: 'Category Quiz deleted successfully'
            });
        } catch (err) {
            res.status(500).json({
                success: false,
                message: 'Failed to delete Category Quiz',
                error: err.message
            });
        }
    }
}

module.exports = CategoryQuizController;
