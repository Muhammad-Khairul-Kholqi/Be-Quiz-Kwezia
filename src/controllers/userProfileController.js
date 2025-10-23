const userModel = require('../models/userModel');
const AvatarModel = require('../models/avatarModel');
const LeaderboardModel = require('../models/leaderboardModel');

class UserProfileController {
    static async getProfile(req, res) {
        try {
            const userId = req.user.id;

            const {
                data,
                error
            } = await require('../config/supabase')
                .from('users')
                .select(`
                    id,
                    username,
                    role,
                    total_points,
                    total_quiz_completed,
                    total_perfect_attempts,
                    created_at,
                    avatars:avatar_id (
                        id,
                        name,
                        image_url,
                        is_active
                    )
                `)
                .eq('id', userId)
                .single();

            if (error) throw error;

            const userRankData = await LeaderboardModel.getUserRank(userId);
            const rank = userRankData ? userRankData.rank : null;

            res.status(200).json({
                success: true,
                data: {
                    ...data,
                    rank
                }
            });
        } catch (err) {
            res.status(500).json({
                success: false,
                message: 'Failed to retrieve profile data',
                error: err.message
            });
        }
    }

    static async updateProfile(req, res) {
        try {
            const userId = req.user.id;
            const {
                username
            } = req.body;

            if (!username || username.trim() === '') {
                return res.status(400).json({
                    success: false,
                    message: 'Username is required'
                });
            }

            const existingUser = await userModel.findByUsername(username);
            if (existingUser && existingUser.id !== userId) {
                return res.status(400).json({
                    success: false,
                    message: 'Username already taken'
                });
            }

            await userModel.update(userId, {
                username: username.trim()
            });

            const {
                data,
                error
            } = await require('../config/supabase')
                .from('users')
                .select(`
                id,
                username,
                role,
                total_points,
                total_quiz_completed,
                total_perfect_attempts,
                created_at,
                avatars:avatar_id (
                    id,
                    name,
                    image_url,
                    is_active
                )
            `)
                .eq('id', userId)
                .single();

            if (error) throw error;

            const userRankData = await LeaderboardModel.getUserRank(userId);
            const rank = userRankData ? userRankData.rank : null;

            res.status(200).json({
                success: true,
                message: 'Profile successfully updated',
                data: {
                    ...data,
                    rank
                }
            });
        } catch (err) {
            res.status(500).json({
                success: false,
                message: 'Failed to update profile',
                error: err.message
            });
        }
    }

    static async updateAvatar(req, res) {
        try {
            const userId = req.user.id;
            const {
                avatar_id
            } = req.body;

            if (!avatar_id) {
                return res.status(400).json({
                    success: false,
                    message: 'Avatar ID is required'
                });
            }

            const avatar = await AvatarModel.getById(avatar_id);
            if (!avatar) {
                return res.status(404).json({
                    success: false,
                    message: 'Avatar not found'
                });
            }

            if (!avatar.is_active) {
                return res.status(400).json({
                    success: false,
                    message: 'This avatar is not available'
                });
            }

            await userModel.update(userId, {
                avatar_id: avatar_id
            });

            const {
                data,
                error
            } = await require('../config/supabase')
                .from('users')
                .select(`
                    id,
                    username,
                    role,
                    total_points,
                    total_quiz_completed,
                    total_perfect_attempts,
                    created_at,
                    avatars:avatar_id (
                        id,
                        name,
                        image_url,
                        is_active
                    )
                `)
                .eq('id', userId)
                .single();

            if (error) throw error;

            const userRankData = await LeaderboardModel.getUserRank(userId);
            const rank = userRankData ? userRankData.rank : null;

            res.status(200).json({
                success: true,
                message: 'Avatar successfully updated',
                data: {
                    ...data,
                    rank
                }
            });
        } catch (err) {
            res.status(500).json({
                success: false,
                message: 'Failed to update avatar',
                error: err.message
            });
        }
    }

    static async removeAvatar(req, res) {
        try {
            const userId = req.user.id;

            await userModel.update(userId, {
                avatar_id: null
            });

            const {
                data,
                error
            } = await require('../config/supabase')
                .from('users')
                .select(`
                    id,
                    username,
                    role,
                    total_points,
                    total_quiz_completed,
                    total_perfect_attempts,
                    created_at,
                    avatars:avatar_id (
                        id,
                        name,
                        image_url,
                        is_active
                    )
                `)
                .eq('id', userId)
                .single();

            if (error) throw error;

            const userRankData = await LeaderboardModel.getUserRank(userId);
            const rank = userRankData ? userRankData.rank : null;

            res.status(200).json({
                success: true,
                message: 'Avatar successfully removed',
                data: {
                    ...data,
                    rank
                }
            });
        } catch (err) {
            res.status(500).json({
                success: false,
                message: 'Failed to remove avatar',
                error: err.message
            });
        }
    }

    static async getPublicProfile(req, res) {
        try {
            const {
                userId
            } = req.params;

            const {
                data,
                error
            } = await require('../config/supabase')
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

            if (error) throw error;

            if (!data) {
                return res.status(404).json({
                    success: false,
                    message: 'User not found'
                });
            }

            const userRankData = await LeaderboardModel.getUserRank(userId);
            const rank = userRankData ? userRankData.rank : null;

            res.status(200).json({
                success: true,
                data: {
                    ...data,
                    rank
                }
            });
        } catch (err) {
            res.status(500).json({
                success: false,
                message: 'Failed to retrieve user profile',
                error: err.message
            });
        }
    }
}

module.exports = UserProfileController;