// server/models/Pictogram.js
const mongoose = require('mongoose');

const PictogramSchema = new mongoose.Schema({
    name: { type: String, required: true },
    category: { type: String, required: true },
    imageUrl: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Pictogram', PictogramSchema);