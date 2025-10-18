const BlogModel = require('../models/blogModel');
const CategoryBlogModel = require('../models/categoryBlogModel');
const supabase = require('../config/supabase');
const fs = require('fs');

class BlogController {
    static async getAll(req, res) {
        try {
            const blogs = await BlogModel.getAll();
            res.status(200).json({
                success: true,
                data: blogs
            });
        } catch (err) {
            res.status(500).json({
                success: false,
                message: 'Failed to fetch blog data',
                error: err.message
            });
        }
    }

    static async getById(req, res) {
        try {
            const {
                id
            } = req.params;
            const blog = await BlogModel.getById(id);

            if (!blog) {
                return res.status(404).json({
                    success: false,
                    message: 'Blog not found'
                });
            }

            res.status(200).json({
                success: true,
                data: blog
            });
        } catch (err) {
            res.status(500).json({
                success: false,
                message: 'Failed to fetch blog data',
                error: err.message
            });
        }
    }

    static async getByCategory(req, res) {
        try {
            const {
                categoryId
            } = req.params;

            const category = await CategoryBlogModel.getById(categoryId);
            if (!category) {
                return res.status(404).json({
                    success: false,
                    message: 'Category not found'
                });
            }

            const blogs = await BlogModel.getByCategory(categoryId);
            res.status(200).json({
                success: true,
                data: blogs
            });
        } catch (err) {
            res.status(500).json({
                success: false,
                message: 'Failed to fetch blog data by category',
                error: err.message
            });
        }
    }

    static async create(req, res) {
        try {
            const {
                category_id,
                title,
                description,
                author_name
            } = req.body;

            if (!category_id || !title || !title.trim() || !description || !description.trim() || !author_name || !author_name.trim()) {
                return res.status(400).json({
                    success: false,
                    message: 'Category ID, title, description, and author name are required'
                });
            }

            const category = await CategoryBlogModel.getById(category_id);
            if (!category) {
                return res.status(404).json({
                    success: false,
                    message: 'Category not found'
                });
            }

            let imageUrl = null;

            if (req.file) {
                const file = req.file;
                const fileExt = file.originalname.split('.').pop();
                const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

                const {
                    data: uploadData,
                    error: uploadError
                } = await supabase.storage
                    .from('blog-image')
                    .upload(fileName, fs.readFileSync(file.path), {
                        contentType: file.mimetype,
                        upsert: false
                    });

                fs.unlinkSync(file.path);

                if (uploadError) {
                    return res.status(500).json({
                        success: false,
                        message: 'Failed to upload image',
                        error: uploadError.message
                    });
                }

                const {
                    data: urlData
                } = supabase.storage
                    .from('blog-image')
                    .getPublicUrl(fileName);

                imageUrl = urlData.publicUrl;
            }

            const newBlog = await BlogModel.create({
                category_id,
                title: title.trim(),
                description: description.trim(),
                image_url: imageUrl,
                author_name: author_name.trim(),
                created_by: req.user.id
            });

            return res.status(201).json({
                success: true,
                message: 'Blog successfully created',
                data: newBlog
            });
        } catch (err) {
            if (req.file && fs.existsSync(req.file.path)) {
                fs.unlinkSync(req.file.path);
            }

            return res.status(500).json({
                success: false,
                message: 'Failed to create blog',
                error: err.message
            });
        }
    }

    static async update(req, res) {
        try {
            const {
                id
            } = req.params;
            const existing = await BlogModel.getById(id);

            if (!existing) {
                return res.status(404).json({
                    success: false,
                    message: 'Blog not found'
                });
            }

            const {
                category_id,
                title,
                description,
                author_name
            } = req.body;

            if (category_id) {
                const category = await CategoryBlogModel.getById(category_id);
                if (!category) {
                    return res.status(404).json({
                        success: false,
                        message: 'Category not found'
                    });
                }
            }

            const updateData = {};
            if (category_id !== undefined) updateData.category_id = category_id;
            if (title !== undefined) updateData.title = title.trim();
            if (description !== undefined) updateData.description = description.trim();
            if (author_name !== undefined) updateData.author_name = author_name.trim();

            if (req.file) {
                const file = req.file;
                const fileExt = file.originalname.split('.').pop();
                const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

                const {
                    data: uploadData,
                    error: uploadError
                } = await supabase.storage
                    .from('blog-image')
                    .upload(fileName, fs.readFileSync(file.path), {
                        contentType: file.mimetype,
                        upsert: false
                    });

                fs.unlinkSync(file.path);

                if (uploadError) {
                    return res.status(500).json({
                        success: false,
                        message: 'Failed to upload image',
                        error: uploadError.message
                    });
                }

                if (existing.image_url) {
                    const oldFileName = existing.image_url.split('/').pop();
                    await supabase.storage
                        .from('blog-image')
                        .remove([oldFileName]);
                }

                const {
                    data: urlData
                } = supabase.storage
                    .from('blog-image')
                    .getPublicUrl(fileName);

                updateData.image_url = urlData.publicUrl;
            }

            const updatedBlog = await BlogModel.update(id, updateData);

            res.status(200).json({
                success: true,
                message: 'Blog successfully updated',
                data: updatedBlog
            });
        } catch (err) {
            if (req.file && fs.existsSync(req.file.path)) {
                fs.unlinkSync(req.file.path);
            }

            res.status(500).json({
                success: false,
                message: 'Failed to update blog',
                error: err.message
            });
        }
    }

    static async delete(req, res) {
        try {
            const {
                id
            } = req.params;
            const existing = await BlogModel.getById(id);

            if (!existing) {
                return res.status(404).json({
                    success: false,
                    message: 'Blog not found'
                });
            }

            if (existing.image_url) {
                const fileName = existing.image_url.split('/').pop();
                await supabase.storage
                    .from('blog-image')
                    .remove([fileName]);
            }

            await BlogModel.delete(id);

            res.status(200).json({
                success: true,
                message: 'Blog has been successfully deleted'
            });
        } catch (err) {
            res.status(500).json({
                success: false,
                message: 'Failed to delete blog',
                error: err.message
            });
        }
    }
}

module.exports = BlogController;