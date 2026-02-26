const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
    let token;

    console.log('🔐 Auth Middleware - Checking authorization...');
    console.log('🔐 Headers:', req.headers);

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            console.log('🔐 Token found, verifying...');
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            console.log('🔐 Token verified for user ID:', decoded.id);
            
            req.user = await User.findByPk(decoded.id, {
                attributes: { exclude: ['password'] }
            });
            
            if (!req.user) {
                console.error('🔐 ❌ User not found in database');
                return res.status(401).json({ message: 'User not found' });
            }
            
            console.log('🔐 ✅ User authenticated:', req.user.email);
            next();
            return;
        } catch (error) {
            console.error('🔐 ❌ Token verification error:', error.message);
            return res.status(401).json({ message: 'Not authorized, token failed' });
        }
    }

    console.error('🔐 ❌ No authorization token provided');
    return res.status(401).json({ message: 'Not authorized, no token' });
};

module.exports = { protect };
