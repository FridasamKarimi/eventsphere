const mongoose = require('moongose');

const registrationSchema = new moongose.Schema({
    eventId: { type: String, required: true },
    userId: { type: String, required: true},
    registeredAt: { type: Date,default: Date.now }
});

module.exports = mongoose.model('Registration', registrationSchema);
