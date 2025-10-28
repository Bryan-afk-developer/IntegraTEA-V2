// server/models/Child.js
const mongoose = require('mongoose');

const ChildSchema = new mongoose.Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    age: { type: Number, required: true },
    educatorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Educator', required: true },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Child', ChildSchema);