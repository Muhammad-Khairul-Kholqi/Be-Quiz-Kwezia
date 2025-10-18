const supabase = require('../config/supabase');

class LeaderboardModel {
    static async getTopUsers(limit = 10) {
        const {
            data,
            error
        } = await supabase
            .from('users')
            .select(`
                id,
                username,
                total_points,
                total_quiz_completed,
                total_perfect_attempts,
                created_at,
                avatars:avatar_id (
                    id,
                    name,
                    image_url
                )
            `)
            .order('total_points', {
                ascending: false
            })
            .order('total_quiz_completed', {
                ascending: false
            })
            .order('total_perfect_attempts', {
                ascending: false
            })
            .limit(limit);

        if (error) throw error;

        return data.map((user, index) => ({
            ...user,
            rank: index + 1
        }));
    }

    static async getUserRank(userId) {
        const {
            data: userData,
            error: userError
        } = await supabase
            .from('users')
            .select(`
                id,
                username,
                total_points,
                total_quiz_completed,
                total_perfect_attempts,
                created_at,
                avatars:avatar_id (
                    id,
                    name,
                    image_url
                )
            `)
            .eq('id', userId)
            .single();

        if (userError) throw userError;
        if (!userData) return null;

        const {
            count,
            error: countError
        } = await supabase
            .from('users')
            .select('id', {
                count: 'exact',
                head: true
            })
            .gt('total_points', userData.total_points);

        if (countError) throw countError;

        return {
            ...userData,
            rank: (count || 0) + 1
        };
    }

    static async getLeaderboardWithUserRank(userId, topLimit = 10) {
        const topUsers = await this.getTopUsers(topLimit);

        const userRank = await this.getUserRank(userId);

        const isInTop = topUsers.some(u => u.id === userId);

        return {
            top_users: topUsers,
            current_user: userRank,
            is_in_top: isInTop
        };
    }
}

module.exports = LeaderboardModel;