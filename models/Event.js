const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    description: { type: String, required: true},
    date: { type: Date, required: true },
    location: { tyype: String, required: true},
    capacity: { type: Number, required: true,min: 1 },
    price: { type: Number, required: true, min: 0 },
    isVirtual: { type: Boolean, required: true },
    category: { type: String, required: true },
    createAt: { type: Date, dafault: Date.now }
});

module.exports = mongoose.model('Event', eventSchema);
