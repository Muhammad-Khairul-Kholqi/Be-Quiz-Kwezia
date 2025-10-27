const supabase = require('../config/supabase');

class StatsController {
    static async getPublicStats(req, res) {
        try {
            const {
                count: totalUsers,
                error: userError
            } = await supabase
                .from('users')
                .select('id', {
                    count: 'exact',
                    head: true
                })
                .neq('role', 'admin');

            if (userError) throw userError;

            const {
                count: totalQuizzes,
                error: quizError
            } = await supabase
                .from('quiz')
                .select('id', {
                    count: 'exact',
                    head: true
                });

            if (quizError) throw quizError;

            const {
                count: totalBlogs,
                error: blogError
            } = await supabase
                .from('blog')
                .select('id', {
                    count: 'exact',
                    head: true
                });

            if (blogError) throw blogError;

            res.status(200).json({
                success: true,
                data: {
                    total_users: totalUsers || 0,
                    total_quizzes: totalQuizzes || 0,
                    total_blogs: totalBlogs || 0
                }
            });
        } catch (err) {
            res.status(500).json({
                success: false,
                message: 'Failed to fetch statistics',
                error: err.message
            });
        }
    }
}

module.exports = StatsController;
