const supabase = require('../config/supabase');

class CategoryQuizModel {
    static async getAll() {
        const {
            data,
            error
        } = await supabase
            .from('category_quiz')
            .select('*')
            .order('id', {
                ascending: true
            });

        if (error) throw error;
        return data;
    }

    static async getById(id) {
        const {
            data,
            error
        } = await supabase
            .from('category_quiz')
            .select('*')
            .eq('id', id)
            .single();

        if (error) throw error;
        return data;
    }

    static async create({
        name,
    }) {
        const {
            data,
            error
        } = await supabase
            .from('category_quiz')
            .insert([{
                name,
            }])
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    static async update(id, {
        name,
    }) {
        const {
            data,
            error
        } = await supabase
            .from('category_quiz')
            .update({
                name,
            })
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
            .from('category_quiz')
            .delete()
            .eq('id', id);

        if (error) throw error;
    }
}

module.exports = CategoryQuizModel;