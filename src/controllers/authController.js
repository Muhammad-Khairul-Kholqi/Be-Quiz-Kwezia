const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const userModel = require('../models/userModel');

const authController = {
    register: async (req, res) => {
        try {
            const {
                username,
                password
            } = req.body;

            const existingUser = await userModel.findByUsername(username);
            if (existingUser) {
                return res.status(400).json({
                    success: false,
                    message: 'Username is already taken'
                });
            }

            const hashedPassword = await bcrypt.hash(password, 10);

            const newUser = await userModel.create({
                username,
                password: hashedPassword,
                role: 'user'
            });

            delete newUser.password;

            res.status(201).json({
                success: true,
                message: 'Registration successful',
                data: newUser
            });

        } catch (error) {
            console.error('Register error:', error);
            res.status(500).json({
                success: false,
                message: 'An error occurred during registration',
                error: error.message
            });
        }
    },

    login: async (req, res) => {
        try {
            const {
                username,
                password
            } = req.body;

            const user = await userModel.findByUsername(username);
            if (!user) {
                return res.status(401).json({
                    success: false,
                    message: 'Invalid username or password'
                });
            }

            const isPasswordValid = await bcrypt.compare(password, user.password);
            if (!isPasswordValid) {
                return res.status(401).json({
                    success: false,
                    message: 'Invalid username or password'
                });
            }

            const token = jwt.sign({
                    id: user.id,
                    username: user.username,
                    role: user.role
                },
                process.env.JWT_SECRET, {
                    expiresIn: '7d'
                }
            );

            delete user.password;

            res.status(200).json({
                success: true,
                message: 'Login successful',
                data: {
                    user,
                    token
                }
            });

        } catch (error) {
            console.error('Login error:', error);
            res.status(500).json({
                success: false,
                message: 'An error occurred during login',
                error: error.message
            });
        }
    },

    adminLogin: async (req, res) => {
        try {
            const {
                username,
                password
            } = req.body;

            const user = await userModel.findByUsername(username);
            if (!user) {
                return res.status(401).json({
                    success: false,
                    message: 'Invalid username or password'
                });
            }

            if (user.role !== 'admin') {
                return res.status(403).json({
                    success: false,
                    message: 'Access denied. Only admins can log in here'
                });
            }

            const isPasswordValid = await bcrypt.compare(password, user.password);
            if (!isPasswordValid) {
                return res.status(401).json({
                    success: false,
                    message: 'Invalid username or password'
                });
            }

            const token = jwt.sign({
                    id: user.id,
                    username: user.username,
                    role: user.role
                },
                process.env.JWT_SECRET, {
                    expiresIn: '7d'
                }
            );

            delete user.password;

            res.status(200).json({
                success: true,
                message: 'Admin login successful',
                data: {
                    user,
                    token
                }
            });

        } catch (error) {
            console.error('Admin login error:', error);
            res.status(500).json({
                success: false,
                message: 'An error occurred during login',
                error: error.message
            });
        }
    }
};

module.exports = authController;