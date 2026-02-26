const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { Op } = require('sequelize');

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// @desc    Register new user
// @route   POST /api/auth/register
exports.registerUser = async (req, res) => {
    const { username, email, password } = req.body;
    console.log('Registration request received:', { username, email });

    try {
        const userExists = await User.findOne({ where: { email } });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const user = await User.create({ username, email, password });

        if (user) {
            res.status(201).json({
                id: user.id,
                username: user.username,
                email: user.email,
                role: user.role,
                token: generateToken(user.id)
            });
        } else {
            res.status(400).json({ message: 'Invalid user data' });
        }
    } catch (error) {
        console.error('Registration Error:', error);
        res.status(500).json({ message: 'Internal Server Error: ' + error.message });
    }
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
exports.loginUser = async (req, res) => {
    const { email, password } = req.body;
    console.log('Login request received for:', email);

    try {
        const user = await User.findOne({ where: { email } });

        if (user && (await user.matchPassword(password))) {
            res.json({
                id: user.id,
                username: user.username,
                email: user.email,
                role: user.role,
                token: generateToken(user.id)
            });
        } else {
            console.log('Invalid credentials for:', email);
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        console.error('Login Error:', error);
        res.status(500).json({ message: 'Internal Server Error: ' + error.message });
    }
};

// @desc    Get all users
// @route   GET /api/auth/users
exports.getUsers = async (req, res) => {
    try {
        const users = await User.findAll({
            attributes: ['id', 'username', 'email'],
            where: {
                id: { [Op.ne]: req.user.id }
            }
        });
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Forgot password - generate reset token
// @route   POST /api/auth/forgot-password
exports.forgotPassword = async (req, res) => {
    const { email } = req.body;
    console.log('Forgot password request for:', email);

    try {
        const user = await User.findOne({ where: { email } });

        if (!user) {
            // For security, don't reveal if email exists
            return res.status(200).json({ message: 'If the email exists, a password reset link has been sent.' });
        }

        // Generate a password reset token (valid for 1 hour)
        const resetToken = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '1h' });
        
        // In a real application, you would send this token via email
        // For demo purposes, we log it to console
        console.log('Password reset token generated for:', email);
        console.log('Reset token:', resetToken);
        console.log('User can reset password with this token');

        res.json({
            message: 'If the email exists in our system, you will receive a password reset link shortly.',
            // Note: In production, do NOT send the token in response
            // token: resetToken // This is only for demo purposes
        });
    } catch (error) {
        console.error('Forgot Password Error:', error);
        res.status(500).json({ message: 'Internal Server Error: ' + error.message });
    }
};
