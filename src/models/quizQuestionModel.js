const supabase = require('../config/supabase');

class QuizQuestionModel {
    static async getByQuizId(quizId) {
        const {
            data,
            error
        } = await supabase
            .from('quiz_questions')
            .select('*')
            .eq('quiz_id', quizId)
            .order('question_order', {
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
            .from('quiz_questions')
            .select('*')
            .eq('id', id)
            .single();

        if (error) throw error;
        return data;
    }

    static async create({
        quiz_id,
        question,
        option_a,
        option_b,
        option_c,
        option_d,
        correct_answer,
        question_order
    }) {
        const {
            data,
            error
        } = await supabase
            .from('quiz_questions')
            .insert([{
                quiz_id,
                question,
                option_a,
                option_b,
                option_c,
                option_d,
                correct_answer,
                question_order
            }])
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    static async createBulk(questions) {
        const {
            data,
            error
        } = await supabase
            .from('quiz_questions')
            .insert(questions)
            .select();

        if (error) throw error;
        return data;
    }

    static async update(id, {
        question,
        option_a,
        option_b,
        option_c,
        option_d,
        correct_answer,
        question_order
    }) {
        const updateData = {};
        if (question !== undefined) updateData.question = question;
        if (option_a !== undefined) updateData.option_a = option_a;
        if (option_b !== undefined) updateData.option_b = option_b;
        if (option_c !== undefined) updateData.option_c = option_c;
        if (option_d !== undefined) updateData.option_d = option_d;
        if (correct_answer !== undefined) updateData.correct_answer = correct_answer;
        if (question_order !== undefined) updateData.question_order = question_order;

        const {
            data,
            error
        } = await supabase
            .from('quiz_questions')
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
            .from('quiz_questions')
            .delete()
            .eq('id', id);

        if (error) throw error;
    }

    static async deleteByQuizId(quizId) {
        const {
            error
        } = await supabase
            .from('quiz_questions')
            .delete()
            .eq('quiz_id', quizId);

        if (error) throw error;
    }
}

module.exports = QuizQuestionModel;