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
                message: 'Gagal mengambil data FAQ',
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
                    message: 'FAQ tidak ditemukan'
                });
            }

            res.status(200).json({
                success: true,
                data: faq
            });
        } catch (err) {
            res.status(500).json({
                success: false,
                message: 'Gagal mengambil data FAQ',
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
                    message: 'Pertanyaan wajib diisi'
                });
            }

            if (!answer || !answer.trim()) {
                return res.status(400).json({
                    success: false,
                    message: 'Jawaban wajib diisi'
                });
            }

            const newFaq = await FaqModel.create({
                question: question.trim(),
                answer: answer.trim(),
            });

            return res.status(201).json({
                success: true,
                message: 'FAQ berhasil ditambahkan',
                data: newFaq
            });
        } catch (err) {
            return res.status(500).json({
                success: false,
                message: 'Gagal menambahkan FAQ',
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
                    message: 'FAQ tidak ditemukan'
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
                message: 'FAQ berhasil diupdate',
                data: updatedFaq
            });
        } catch (err) {
            res.status(500).json({
                success: false,
                message: 'Gagal mengupdate FAQ',
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
                    message: 'FAQ tidak ditemukan'
                });
            }

            await FaqModel.delete(id);

            res.status(200).json({
                success: true,
                message: 'FAQ berhasil dihapus'
            });
        } catch (err) {
            res.status(500).json({
                success: false,
                message: 'Gagal menghapus FAQ',
                error: err.message
            });
        }
    }
}

module.exports = FaqController;