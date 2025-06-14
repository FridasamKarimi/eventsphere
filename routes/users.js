const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { validateUser } = require('../middleware/validate');
const { AuthError } = require('../middleware/errorHandler');

const router = express.Router();

// Register new user
router.post('/register', validateUser, async (req, res) => {
  const { username, password, email, role } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  const user = new User({
    username,
    password: hashedPassword,
    email,
    role: role || 'attendee'
  });
  await user.save();
  res.status(201).json({ message: 'User created', username });
});

// Login
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username });
  if (!user || !(await bcrypt.compare(password, user.password))) {
    throw new AuthError('Invalid credentials', 401);
  }
  const token = jwt.sign(
    { id: user._id, username: user.username, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '1h' }
  );
  res.json({ token, role: user.role });
});

module.exports = router;