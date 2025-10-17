const CategoryBlogModel = require('../models/categoryBlogModel');

class CategoryBlogController {
    static async getAll(req, res) {
        try {
            const category_blog = await CategoryBlogModel.getAll();
            res.status(200).json({
                success: true,
                data: category_blog
            });
        } catch (err) {
            res.status(500).json({
                success: false,
                message: 'Failed to fetch Blog Category data',
                error: err.message
            });
        }
    }

    static async getById(req, res) {
        try {
            const {
                id
            } = req.params;
            const category_blog = await CategoryBlogModel.getById(id);

            if (!category_blog) {
                return res.status(404).json({
                    success: false,
                    message: 'Category Blog not found'
                });
            }

            res.status(200).json({
                success: true,
                data: category_blog
            });
        } catch (err) {
            res.status(500).json({
                success: false,
                message: 'Failed to fetch Blog Category data',
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
                    message: 'Namw is required'
                });
            }

            const newCategoryBlog = await CategoryBlogModel.create({
                name: name.trim(),
            });

            return res.status(201).json({
                success: true,
                message: 'Category Blog successfully added',
                data: newCategoryBlog
            });
        } catch (err) {
            return res.status(500).json({
                success: false,
                message: 'Failed to add Blog Category',
                error: err.message
            });
        }
    }

    static async update(req, res) {
        try {
            const {
                id
            } = req.params;
            const existing = await CategoryBlogModel.getById(id);

            if (!existing) {
                return res.status(404).json({
                    success: false,
                    message: 'Category Blog not found'
                });
            }

            const {
                name,
            } = req.body;

            const updateData = {};
            if (name !== undefined) {
                updateData.name = name.trim();
            }

            const updatedCategoryBlog = await CategoryBlogModel.update(id, updateData);

            res.status(200).json({
                success: true,
                message: 'Category Blog successfully updated',
                data: updatedCategoryBlog
            });
        } catch (err) {
            res.status(500).json({
                success: false,
                message: 'Failed to update Blog Category',
                error: err.message
            });
        }
    }

    static async delete(req, res) {
        try {
            const {
                id
            } = req.params;
            const existing = await CategoryBlogModel.getById(id);

            if (!existing) {
                return res.status(404).json({
                    success: false,
                    message: 'Category Blog not found'
                });
            }

            await CategoryBlogModel.delete(id);

            res.status(200).json({
                success: true,
                message: 'Category Blog has been successfully deleted'
            });
        } catch (err) {
            res.status(500).json({
                success: false,
                message: 'Failed to delete Blog Category',
                error: err.message
            });
        }
    }
}

module.exports = CategoryBlogController;