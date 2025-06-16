require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const eventRoutes = require('./routes/events');
const userRoutes = require('./routes/users');
const registrationRoutes =  require('./routes/registrations');
const { loggerMiddleware } = require('./middleware/logger');
const { authMiddleware } = require('./middleware/auth');
const { errorHandler } = require('./middleware/errorHandler');
const { rateLimitMiddleware } = require('./middleware/rateLimit');

//initialize express app
const app = express();
const PORT = process.env.PORT || 3000;

//Connect to mongodb
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true})
   .then(() => console.log('Connected to Mongodb'))
   .catch(err => console.error('Connection error:'));

app.use(bodyParser.json());
app.use(loggerMiddleware);
app.use(rateLimitMiddleware);

//Root route
app.get('/', (req, res) => {
    res.send('Welcome to EventSphere');
});

//Routes
app.use('/api/users', userRoutes);
app.use('/api/events', authMiddleware,eventRoutes);

app.use(errorHandler);

app.listen(PORT, () => {
    console.log('Server is running 0 http:localhost:${PORT}');
});

module.exports = app;
