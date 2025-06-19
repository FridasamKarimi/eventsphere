const express = require('express');
const { v4: uuidv4 } = require('uuid');
const Event = require('../models/Event');
const { NotFoundError } = require('../middleware/errorHandler');
const { validateEvent } = require('../middleware/validate');
const { roleMiddleware } = require('../middleware/auth');

const router = express.Router();

// GET all events with filtering and pagination
router.get('/', async (req, res, next) => {
    const { category, startDate, endDate, page = 1, limit = 10, search } = req.query;
    const query = {};

    if (category) query.category = new RegExp(category, 'i');
    if (search) query.title = new RegExp(search, 'i');
    if (startDate || endDate) {
        query.date = {};
        if (startDate) query.date.$gte = new Date(startDate);
        if (endDate) query.date.$lte = new Date(endDate);
    }

    try {
        const events = await Event.find(query)
            .sort({ date: 1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit));

        const total = await Event.countDocuments(query);

        res.json({
            events,
            total,
            page: parseInt(page),
            limit: parseInt(limit)
        });
    } catch (err) {
        next(err);
    }
});

// GET event by ID
router.get('/:id', async (req, res, next) => {
    try {
        const event = await Event.findOne({ id: req.params.id });
        if (!event) {
            throw new NotFoundError('Event not found');
        }
        res.json(event);
    } catch (err) {
        next(err);
    }
});

// POST new event (organizer only)
router.post('/', roleMiddleware(['organizer']), validateEvent, async (req, res, next) => {
    try {
        const event = new Event({
            id: uuidv4(),
            ...req.body
        });
        await event.save();
        res.status(201).json(event);
    } catch (err) {
        next(err);
    }
});

// PUT update event (organizer only)
router.put('/:id', roleMiddleware(['organizer']), validateEvent, async (req, res, next) => {
    try {
        const event = await Event.findOneAndUpdate(
            { id: req.params.id },
            { $set: req.body },
            { new: true }
        );
        if (!event) {
            throw new NotFoundError('Event not found');
        }
        res.status(200).json(event);
    } catch (err) {
        next(err);
    }
});

// DELETE event (organizer only)
router.delete('/:id', roleMiddleware(['organizer']), async (req, res, next) => {
    try {
        const event = await Event.findOneAndDelete({ id: req.params.id });
        if (!event) {
            throw new NotFoundError('Event not found');
        }
        res.status(204).send();
    } catch (err) {
        next(err);
    }
});

// GET event statistics
router.get('/stats', async (req, res, next) => {
    try {
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
    } catch (err) {
        next(err);
    }
});

module.exports = router;
