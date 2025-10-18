const LeaderboardModel = require('../models/leaderboardModel');

class LeaderboardController {
    static async getTopUsers(req, res) {
        try {
            const limit = parseInt(req.query.limit) || 10;

            if (limit < 1 || limit > 100) {
                return res.status(400).json({
                    success: false,
                    message: 'Limit must be between 1 and 100'
                });
            }

            const leaderboard = await LeaderboardModel.getTopUsers(limit);

            res.status(200).json({
                success: true,
                data: leaderboard
            });
        } catch (err) {
            res.status(500).json({
                success: false,
                message: 'Failed to fetch leaderboard',
                error: err.message
            });
        }
    }

    static async getUserRank(req, res) {
        try {
            const {
                userId
            } = req.params;

            const userRank = await LeaderboardModel.getUserRank(userId);

            if (!userRank) {
                return res.status(404).json({
                    success: false,
                    message: 'User not found'
                });
            }

            res.status(200).json({
                success: true,
                data: userRank
            });
        } catch (err) {
            res.status(500).json({
                success: false,
                message: 'Failed to fetch user rank',
                error: err.message
            });
        }
    }

    static async getLeaderboardWithUser(req, res) {
        try {
            const limit = parseInt(req.query.limit) || 10;

            if (limit < 1 || limit > 100) {
                return res.status(400).json({
                    success: false,
                    message: 'Limit must be between 1 and 100'
                });
            }

            const userId = req.user.id;

            const data = await LeaderboardModel.getLeaderboardWithUserRank(userId, limit);

            res.status(200).json({
                success: true,
                data: data
            });
        } catch (err) {
            res.status(500).json({
                success: false,
                message: 'Failed to fetch leaderboard',
                error: err.message
            });
        }
    }

    static async getMyRank(req, res) {
        try {
            const userId = req.user.id;

            const userRank = await LeaderboardModel.getUserRank(userId);

            if (!userRank) {
                return res.status(404).json({
                    success: false,
                    message: 'User not found'
                });
            }

            res.status(200).json({
                success: true,
                data: userRank
            });
        } catch (err) {
            res.status(500).json({
                success: false,
                message: 'Failed to fetch your rank',
                error: err.message
            });
        }
    }
}

module.exports = LeaderboardController;