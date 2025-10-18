const supabase = require('../config/supabase');

class QuizAttemptModel {
    static async create({
        user_id,
        quiz_id,
        score,
        total_correct,
        is_perfect
    }) {
        const {
            data,
            error
        } = await supabase
            .from('quiz_attempts')
            .insert([{
                user_id,
                quiz_id,
                score,
                total_correct,
                is_perfect
            }])
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    static async getUserAttempts(userId, limit = 10) {
        const {
            data,
            error
        } = await supabase
            .from('quiz_attempts')
            .select(`
                *,
                quiz:quiz_id (
                    id,
                    title,
                    total_questions,
                    category_quiz:category_id (
                        id,
                        name
                    )
                )
            `)
            .eq('user_id', userId)
            .order('completed_at', {
                ascending: false
            })
            .limit(limit);

        if (error) throw error;
        return data;
    }

    static async getQuizAttempts(quizId, limit = 10) {
        const {
            data,
            error
        } = await supabase
            .from('quiz_attempts')
            .select(`
                *,
                users:user_id (
                    id,
                    username,
                    avatars:avatar_id (
                        id,
                        name,
                        image_url
                    )
                )
            `)
            .eq('quiz_id', quizId)
            .order('score', {
                ascending: false
            })
            .order('completed_at', {
                ascending: true
            })
            .limit(limit);

        if (error) throw error;
        return data;
    }

    static async checkUserAttempt(userId, quizId) {
        const {
            data,
            error
        } = await supabase
            .from('quiz_attempts')
            .select('*')
            .eq('user_id', userId)
            .eq('quiz_id', quizId)
            .order('completed_at', {
                ascending: false
            })
            .limit(1);

        if (error) throw error;
        return data.length > 0 ? data[0] : null;
    }

    static async getUserStats(userId) {
        const {
            data,
            error
        } = await supabase
            .from('users')
            .select('total_points, total_quiz_completed, total_perfect_attempts')
            .eq('id', userId)
            .single();

        if (error) throw error;
        return data;
    }
}

module.exports = QuizAttemptModel;