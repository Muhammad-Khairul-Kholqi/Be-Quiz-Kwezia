const FaqModel = require('../models/faqModel');

class FaqController {
    static async getAll(req, res) {
        try {
            const faq = await FaqModel.getAll();
            res.status(200).json({
                success: true,
                data: faq
            });
        } catch (err) {
            res.status(500).json({
                success: false,
                message: 'Failed to retrieve FAQ data',
                error: err.message
            });
        }
    }

    static async getById(req, res) {
        try {
            const {
                id
            } = req.params;
            const faq = await FaqModel.getById(id);

            if (!faq) {
                return res.status(404).json({
                    success: false,
                    message: 'FAQ not found'
                });
            }

            res.status(200).json({
                success: true,
                data: faq
            });
        } catch (err) {
            res.status(500).json({
                success: false,
                message: 'Failed to retrieve FAQ data',
                error: err.message
            });
        }
    }

    static async create(req, res) {
        try {
            const {
                question,
                answer
            } = req.body;

            if (!question || !question.trim()) {
                return res.status(400).json({
                    success: false,
                    message: 'Question is required'
                });
            }

            if (!answer || !answer.trim()) {
                return res.status(400).json({
                    success: false,
                    message: 'Answer is required'
                });
            }

            const newFaq = await FaqModel.create({
                question: question.trim(),
                answer: answer.trim(),
            });

            return res.status(201).json({
                success: true,
                message: 'FAQ added successfully',
                data: newFaq
            });
        } catch (err) {
            return res.status(500).json({
                success: false,
                message: 'Failed to add FAQ',
                error: err.message
            });
        }
    }

    static async update(req, res) {
        try {
            const {
                id
            } = req.params;
            const existing = await FaqModel.getById(id);

            if (!existing) {
                return res.status(404).json({
                    success: false,
                    message: 'FAQ not found'
                });
            }

            const {
                question,
                answer
            } = req.body;

            const updateData = {};
            if (question !== undefined) {
                updateData.question = question.trim();
            }
            if (answer !== undefined) {
                updateData.answer = answer.trim();
            }

            const updatedFaq = await FaqModel.update(id, updateData);

            res.status(200).json({
                success: true,
                message: 'FAQ updated successfully',
                data: updatedFaq
            });
        } catch (err) {
            res.status(500).json({
                success: false,
                message: 'Failed to update FAQ',
                error: err.message
            });
        }
    }

    static async delete(req, res) {
        try {
            const {
                id
            } = req.params;
            const existing = await FaqModel.getById(id);

            if (!existing) {
                return res.status(404).json({
                    success: false,
                    message: 'FAQ not found'
                });
            }

            await FaqModel.delete(id);

            res.status(200).json({
                success: true,
                message: 'FAQ deleted successfully'
            });
        } catch (err) {
            res.status(500).json({
                success: false,
                message: 'Failed to delete FAQ',
                error: err.message
            });
        }
    }
}

module.exports = FaqController;
