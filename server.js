require('dotenv').config();
console.log("DEBUG MONGO_URI:", process.env.MONGO_URI);
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const eventRoutes = require('./routes/events');
const userRoutes = require('./routes/users');
const registrationRoutes = require('./routes/registrations');
const { loggerMiddleware } = require('./middleware/logger');
const { authMiddleware } = require('./middleware/auth');
const { errorHandler } = require('./middleware/errorHandler');
const { rateLimitMiddleware } = require('./middleware/rateLimit');

// Initialize express app
const app = express();
const PORT = process.env.PORT || 3000;

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => {
    console.error('MongoDB connection error:', err.message);
    console.error('Full error:', err);
    process.exit(1);
  });

// Middleware setup
app.use(bodyParser.json());
app.use(loggerMiddleware);
app.use(rateLimitMiddleware);
app.use(express.static('public')); // Serve React frontend

// Root route
app.get('/', (req, res) => {
  res.send('Welcome to EventSphere');
});

// Routes
app.use('/api/users', userRoutes);
app.use('/api/events', authMiddleware, eventRoutes);
app.use('/api/registrations', authMiddleware, registrationRoutes);

// Error handling middleware
app.use(errorHandler);

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('Shutting down server...');
  mongoose.connection.close(() => {
    console.log('MongoDB connection closed');
    process.exit(0);
  });
});

module.exports = app;