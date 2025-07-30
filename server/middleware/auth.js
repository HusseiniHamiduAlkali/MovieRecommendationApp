// server/middleware/auth.js
const jwt = require('jsonwebtoken');

// Load environment variables (to access JWT_SECRET)
require('dotenv').config();

module.exports = function(req, res, next) {
    // Get token from header
    const token = req.header('x-auth-token'); // Standard header name for tokens

    // Check if no token
    if (!token) {
        return res.status(401).json({ msg: 'No token, authorization denied' });
    }

    // Verify token
    try {
        // Verify the token using your JWT_SECRET from .env
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Attach the user (from the token payload) to the request object
        // This 'user' object will contain the 'id' (from user.id in auth.js when token was created)
        req.user = decoded.user;
        next(); // Move to the next middleware/route handler
    } catch (err) {
        // If token is not valid
        console.error('Token verification failed:', err.message);
        res.status(401).json({ msg: 'Token is not valid' });
    }
};