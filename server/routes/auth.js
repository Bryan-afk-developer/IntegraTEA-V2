// server/routes/auth.js
const express = require('express');
const router = express.Router();
const Educator = require('../models/Educator');
const jwt = require('jsonwebtoken');
require('dotenv').config();

// Función auxiliar para generar un JWT
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '1h' }); // Token válido por 1 hora
};

// @route   POST /api/auth/login
// @desc    Autenticar educador y obtener token JWT
// @access  Public
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        // Buscar educador por email, incluyendo la contraseña para poder compararla
        const educator = await Educator.findOne({ email }).select('+password');

        if (!educator) {
            return res.status(401).json({ message: 'Credenciales inválidas' });
        }

        // Comparar la contraseña proporcionada con la hasheada en la DB
        const isMatch = await educator.matchPassword(password);

        if (!isMatch) {
            return res.status(401).json({ message: 'Credenciales inválidas' });
        }

        // Si las credenciales son válidas, generar y retornar el token JWT
        res.json({
            message: 'Login exitoso',
            token: generateToken(educator._id),
            educator: { // Datos básicos del educador para el frontend
                id: educator._id,
                firstName: educator.firstName,
                lastName: educator.lastName,
                email: educator.email,
                school: educator.school,
                isPremium: educator.isPremium || false,
            },
        });

    } catch (err) {
        console.error('Error en el login:', err.message);
        res.status(500).json({ message: 'Error del servidor al intentar iniciar sesión' });
    }
});

module.exports = router;