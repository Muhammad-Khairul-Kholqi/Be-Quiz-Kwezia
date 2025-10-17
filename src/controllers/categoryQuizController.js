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
                message: 'Gagal mengambil data Category Quiz',
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
                    message: 'Category Quiz tidak ditemukan'
                });
            }

            res.status(200).json({
                success: true,
                data: category_quiz
            });
        } catch (err) {
            res.status(500).json({
                success: false,
                message: 'Gagal mengambil data Category Quiz',
                error: err.message
            });
        }
    }

    static async create(req, res) {
        try {
            const {
                name,
            } = req.body;

            if (!name || !name.trim()) {
                return res.status(400).json({
                    success: false,
                    message: 'Nama wajib diisi'
                });
            }

            const newCategoryQuiz = await CategoryQuizModel.create({
                name: name.trim(),
            });

            return res.status(201).json({
                success: true,
                message: 'Category Quiz berhasil ditambahkan',
                data: newCategoryQuiz
            });
        } catch (err) {
            return res.status(500).json({
                success: false,
                message: 'Gagal menambahkan Category Quiz',
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
                    message: 'Category Quiz tidak ditemukan'
                });
            }

            const {
                name,
            } = req.body;

            const updateData = {};
            if (name !== undefined) {
                updateData.name = name.trim();
            }

            const updatedCategoryQuiz = await CategoryQuizModel.update(id, updateData);

            res.status(200).json({
                success: true,
                message: 'Category Quiz berhasil diupdate',
                data: updatedCategoryQuiz
            });
        } catch (err) {
            res.status(500).json({
                success: false,
                message: 'Gagal mengupdate Category Quiz',
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
                    message: 'Category Quiz tidak ditemukan'
                });
            }

            await CategoryQuizModel.delete(id);

            res.status(200).json({
                success: true,
                message: 'Category Quiz berhasil dihapus'
            });
        } catch (err) {
            res.status(500).json({
                success: false,
                message: 'Gagal menghapus Category Quiz',
                error: err.message
            });
        }
    }
}

module.exports = CategoryQuizController;