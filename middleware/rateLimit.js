const rateLimit = require('express-rate-limit');

const rateLimitMiddleware = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests
  message: { error: { message: 'Too many requests', type: 'RateLimitError' } }
});

module.exports = { rateLimitMiddleware };