const supabase = require('../config/supabase');

class BlogModel {
    static async getAll() {
        const {
            data,
            error
        } = await supabase
            .from('blog')
            .select(`
                *,
                category_blog:category_id (
                    id,
                    name
                ),
                users:created_by (
                    id,
                    username
                )
            `)
            .order('created_at', {
                ascending: false
            });

        if (error) throw error;
        return data;
    }

    static async getById(id) {
        const {
            data,
            error
        } = await supabase
            .from('blog')
            .select(`
                *,
                category_blog:category_id (
                    id,
                    name
                ),
                users:created_by (
                    id,
                    username
                )
            `)
            .eq('id', id)
            .single();

        if (error) throw error;
        return data;
    }

    static async getByCategory(categoryId) {
        const {
            data,
            error
        } = await supabase
            .from('blog')
            .select(`
                *,
                category_blog:category_id (
                    id,
                    name
                ),
                users:created_by (
                    id,
                    username
                )
            `)
            .eq('category_id', categoryId)
            .order('created_at', {
                ascending: false
            });

        if (error) throw error;
        return data;
    }

    static async create({
        category_id,
        title,
        description,
        image_url,
        author_name,
        created_by
    }) {
        const {
            data,
            error
        } = await supabase
            .from('blog')
            .insert([{
                category_id,
                title,
                description,
                image_url,
                author_name,
                created_by
            }])
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    static async update(id, {
        category_id,
        title,
        description,
        image_url,
        author_name
    }) {
        const updateData = {};
        if (category_id !== undefined) updateData.category_id = category_id;
        if (title !== undefined) updateData.title = title;
        if (description !== undefined) updateData.description = description;
        if (image_url !== undefined) updateData.image_url = image_url;
        if (author_name !== undefined) updateData.author_name = author_name;

        const {
            data,
            error
        } = await supabase
            .from('blog')
            .update(updateData)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    static async delete(id) {
        const {
            error
        } = await supabase
            .from('blog')
            .delete()
            .eq('id', id);

        if (error) throw error;
    }
}

module.exports = BlogModel;