const jwt = require('jsonwebtoken');
const { AuthError } = require('./errorHandler');

const authMiddleware = (req, res, next) => {
    const token = req.headers['authorization']?.split('')[1];
    if (!token) {
        throw new AuthError('Missing token', 401);
    }
    try {
        const decoded = jwt.verify(token,process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        throw new AuthError('Invalid token', 401);

    }
};

const roleMiddleware = (roles) => (req,res, next) => {
    if (!roles.includes(req.user.role)) {
        throw new AuthError('Insufficient permissions', 403);
    }
    next();

};

module.exports = { authMiddleware, roleMiddleware, AuthError };