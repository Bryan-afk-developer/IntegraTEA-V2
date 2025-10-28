// server/routes/pictograms.js
const express = require('express');
const router = express.Router();
const Pictogram = require('../models/Pictogram');
const { protect } = require('../middleware/auth');

// Proteger todas las rutas de pictogramas
router.use(protect);

// @route   GET /api/pictograms
// @desc    Obtener todos los pictogramas
// @access  Private
router.get('/', async (req, res) => {
    try {
        // Devolver solo nombre, categoría e ID (lo necesario para el formulario)
        const pictograms = await Pictogram.find().select('name category');
        res.json(pictograms);
    } catch (err) {
        console.error('Error al obtener pictogramas:', err.message);
        res.status(500).send('Error del servidor');
    }
});

module.exports = router;
