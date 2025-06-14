const { ValidationError } = require('./errorHandler');

const validateEvent = (req, res, next) => {
  const { title, description, date, location, capacity, price, isVirtual, category } = req.body;
  
  if (!title || typeof title !== 'string') {
    throw new ValidationError('Title is required and must be a string');
  }
  if (!description || typeof description !== 'string') {
    throw new ValidationError('Description is required and must be a string');
  }
  if (!date || isNaN(new Date(date).getTime())) {
    throw new ValidationError('Valid date is required');
  }
  if (!location || typeof location !== 'string') {
    throw new ValidationError('Location is required and must be a string');
  }
  if (typeof capacity !== 'number' || capacity < 1) {
    throw new ValidationError('Capacity must be a positive number');
  }
  if (typeof price !== 'number' || price < 0) {
    throw new ValidationError('Price must be a non-negative number');
  }
  if (typeof isVirtual !== 'boolean') {
    throw new ValidationError('isVirtual must be a boolean');
  }
  if (!category || typeof category !== 'string') {
    throw new ValidationError('Category is required and must be a string');
  }
  
  next();
};

const validateUser = (req, res, next) => {
  const { username, password, email, role } = req.body;
  if (!username || typeof username !== 'string') {
    throw new ValidationError('Username is required and must be a string');
  }
  if (!password || typeof password !== 'string' || password.length < 6) {
    throw new ValidationError('Password is required and must be at least 6 characters');
  }
  if (!email || !/\S+@\S+\.\S+/.test(email)) {
    throw new ValidationError('Valid email is required');
  }
  if (role && !['organizer', 'attendee'].includes(role)) {
    throw new ValidationError('Invalid role');
  }
  next();
};

module.exports = { validateEvent, validateUser };