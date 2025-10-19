const supabase = require('../config/supabase');

class QuizModel {
    static async getAll() {
        const {
            data,
            error
        } = await supabase
            .from('quiz')
            .select(`
                *,
                category_quiz:category_id (
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
            .from('quiz')
            .select(`
                *,
                category_quiz:category_id (
                    id,
                    name
                ),
                users:created_by (
                    id,
                    username
                ),
                quiz_questions (
                    id,
                    question,
                    option_a,
                    option_b,
                    option_c,
                    option_d,
                    correct_answer,
                    question_order
                )
            `)
            .eq('id', id)
            .single();

        if (error) throw error;

        if (data && data.quiz_questions) {
            data.quiz_questions.sort((a, b) => a.question_order - b.question_order);
        }

        return data;
    }

    static async getByCategory(categoryId) {
        const {
            data,
            error
        } = await supabase
            .from('quiz')
            .select(`
                *,
                category_quiz:category_id (
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
        total_questions,
        time_limit,
        image_cover,
        created_by
    }) {
        const {
            data,
            error
        } = await supabase
            .from('quiz')
            .insert([{
                category_id,
                title,
                total_questions,
                time_limit,
                image_cover,
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
        total_questions,
        time_limit,
        image_cover
    }) {
        const updateData = {};
        if (category_id !== undefined) updateData.category_id = category_id;
        if (title !== undefined) updateData.title = title;
        if (total_questions !== undefined) updateData.total_questions = total_questions;
        if (time_limit !== undefined) updateData.time_limit = time_limit;
        if (image_cover !== undefined) updateData.image_cover = image_cover;

        const {
            data,
            error
        } = await supabase
            .from('quiz')
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
            .from('quiz')
            .delete()
            .eq('id', id);

        if (error) throw error;
    }

    static async incrementTotalPlayers(id) {
        const {
            data,
            error
        } = await supabase.rpc('increment_total_players', {
            quiz_id: id
        });

        if (error) throw error;
        return data;
    }
}

module.exports = QuizModel;