const supabase = require('../config/supabase');

class FaqModel {
    static async getAll() {
        const {
            data,
            error
        } = await supabase
            .from('faq')
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
            .from('faq')
            .select('*')
            .eq('id', id)
            .single();

        if (error) throw error;
        return data;
    }

    static async create({
        question,
        answer
    }) {
        const {
            data,
            error
        } = await supabase
            .from('faq')
            .insert([{
                question,
                answer
            }])
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    static async update(id, {
        question,
        answer
    }) {
        const {
            data,
            error
        } = await supabase
            .from('faq')
            .update({
                question,
                answer
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
            .from('faq')
            .delete()
            .eq('id', id);

        if (error) throw error;
    }
}

module.exports = FaqModel;