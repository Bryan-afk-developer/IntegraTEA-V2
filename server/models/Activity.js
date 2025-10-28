// server/models/Activity.js
const mongoose = require('mongoose');

const ActivitySchema = new mongoose.Schema({
    childId: { type: mongoose.Schema.Types.ObjectId, ref: 'Child', required: true },
    educatorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Educator', required: true },
    pictogramIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Pictogram' }],
    status: { type: String, enum: ['asignada', 'completada'], default: 'asignada' },
    score: { type: Number },
    createdAt: { type: Date, default: Date.now },
    completedAt: { type: Date }
});

module.exports = mongoose.model('Activity', ActivitySchema);