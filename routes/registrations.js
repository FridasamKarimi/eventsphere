const express = require('express');
const Event = require('../models/Event');
const Registration = require('../models/Registration');
const { NotFoundError, ValidationError } = require('../middleware/errorHandler');
const { createCsv } = require('../utils/csvGenerator');

const router = express.Router();

// Register for an event
router.post('/:eventId', async (req, res) => {
  const event = await Event.findOne({ id: req.params.eventId });
  if (!event) {
    throw new NotFoundError('Event not found');
  }
  const currentRegistrations = await Registration.countDocuments({ eventId: req.params.eventId });
  if (currentRegistrations >= event.capacity) {
    throw new ValidationError('Event is at full capacity');
  }
  const registration = new Registration({
    eventId: req.params.eventId,
    userId: req.user.id
  });
  await registration.save();
  res.status(201).json({ message: 'Registered successfully' });
});

// Get attendees for an event (organizer only)
router.get('/:eventId/attendees', async (req, res) => {
  const registrations = await Registration.find({ eventId: req.params.eventId })
    .populate('userId', 'username email');
  res.json(registrations);
});

// Export attendees as CSV (organizer only)
router.get('/:eventId/attendees/csv', async (req, res) => {
  const registrations = await Registration.find({ eventId: req.params.eventId })
    .populate('userId', 'username email');
  const csvPath = await createCsv(registrations.map(r => ({
    eventId: r.eventId,
    username: r.userId.username,
    email: r.userId.email,
    registeredAt: r.registeredAt
  })));
  res.download(csvPath, `attendees_${req.params.eventId}.csv`);
});

module.exports = router;