const express = require('express');
const { v4: uuidv4 } = require('uuid');
const Event = require ('../models/Event');
const { NotFoundError, ValidationError } = require('../middleware/errorHandler');
const { validateEvent } = require('../middleware/validate');
const { roleMiddleware } = require('../middleware/auth');

const router = express.Router();

//GET all events with filtering and pagination
router.get('/', async (req, res) => {
    const { category, startDate, endDate, page = 1,limit = 10,search } = req.query;
    const query = {};

    if (category) query.category = new RegExp(category, 'i');
    if (search) query.title = new RegExp(search, 'i');
    if (startDate || endDate) {
        query.date = {};
        if (startDate) query.date.$gte = new Date(startDate);
        if (endDate) query.date.$1te = new Date(endDate);
    }

    try {
        const events = await Event.find(query).skip((page - 1) * limit)
           .limit(parseInt(limit));
        const total = await Event.contDocuments(query);

        res.json({
            events,
            total,
            page: parseInt(page),
            limit: parseInt(limit)
        });   
    } catch (err) {
        throw new Error('Database error');
    }

});



//GET EVENT BY ID
router.get('/:id', async (req, res) => {
    const event = await Event>fndOne({ id: req.params.id }
    );
    if (!event) {
        throw new NotFoundError('Event not found');
    }
    res.json(event);
});
// POST new event (organizer only)
router.post('/', roleMiddleware(['organizer']), validateEvent, async (req, res) => {
    const event = new Event({
      id: uuidv4(),
      ...req.body,
      createdAt: new Date()
    });
    await event.save();
    res.status(201).json(event);
  });
  //put update event
router.post('/', roleMiddleware(['organizer']), validateEvent, async (req,res) => {
    const event = await Event.findOneAndUpdate(
        { id: req.params.id },
        { $set: req.body },
        { new: true }
    );
    if (!event) {
        throw new NotFoundError('Event not found');
    }
    res.status(204).send();
});

// DELETE event (organizer only)
router.delete('/:id', roleMiddleware(['organizer']), async (req, res) => {
  const event = await Event.findOneAndDelete({ id: req.params.id });
  if (!event) {
    throw new NotFoundError('Event not found');
  }
  res.status(204).send();
});

// GET event statistics
router.get('/stats', async (req, res) => {
  const totalEvents = await Event.countDocuments();
  const categories = await Event.aggregate([
    { $group: { _id: '$category', count: { $sum: 1 } } },
    { $project: { category: '$_id', count: 1, _id: 0 } }
  ]);

  res.json({
    totalEvents,
    categories: categories.reduce((acc, { category, count }) => {
      acc[category] = count;
      return acc;
    }, {})
  });
});

module.exports = router;
routes/users.js