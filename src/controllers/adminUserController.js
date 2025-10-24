const userModel = require('../models/userModel');

class AdminUserController {
    static async getAllUsers(req, res) {
        try {
            const {
                role,
                search
            } = req.query;

            const filters = {};
            if (role) filters.role = role;
            if (search) filters.search = search;

            const users = await userModel.getAllUsers(filters);

            res.status(200).json({
                success: true,
                data: users,
                count: users.length
            });
        } catch (err) {
            res.status(500).json({
                success: false,
                message: 'Failed to retrieve users',
                error: err.message
            });
        }
    }

    static async getUserById(req, res) {
        try {
            const {
                userId
            } = req.params;

            const user = await userModel.findById(userId);

            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'User not found'
                });
            }

            delete user.password;

            res.status(200).json({
                success: true,
                data: user
            });
        } catch (err) {
            res.status(500).json({
                success: false,
                message: 'Failed to retrieve user',
                error: err.message
            });
        }
    }

    static async deleteUser(req, res) {
        try {
            const {
                userId
            } = req.params;
            const adminId = req.user.id;

            if (userId === adminId) {
                return res.status(400).json({
                    success: false,
                    message: 'You cannot delete your own account'
                });
            }

            const user = await userModel.findById(userId);
            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'User not found'
                });
            }

            if (user.role === 'admin') {
                return res.status(403).json({
                    success: false,
                    message: 'You cannot delete another admin account'
                });
            }

            await userModel.delete(userId);

            res.status(200).json({
                success: true,
                message: 'User successfully deleted',
                data: {
                    deletedUserId: userId,
                    deletedUsername: user.username
                }
            });
        } catch (err) {
            res.status(500).json({
                success: false,
                message: 'Failed to delete user',
                error: err.message
            });
        }
    }

    static async updateUserRole(req, res) {
        try {
            const {
                userId
            } = req.params;
            const {
                role
            } = req.body;
            const adminId = req.user.id;

            if (!role || !['user', 'admin'].includes(role)) {
                return res.status(400).json({
                    success: false,
                    message: 'Valid role is required (user or admin)'
                });
            }

            if (userId === adminId) {
                return res.status(400).json({
                    success: false,
                    message: 'You cannot change your own role'
                });
            }

            const user = await userModel.findById(userId);
            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'User not found'
                });
            }

            const updatedUser = await userModel.update(userId, {
                role
            });
            delete updatedUser.password;

            res.status(200).json({
                success: true,
                message: 'User role successfully updated',
                data: updatedUser
            });
        } catch (err) {
            res.status(500).json({
                success: false,
                message: 'Failed to update user role',
                error: err.message
            });
        }
    }
}

module.exports = AdminUserController;