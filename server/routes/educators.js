// server/routes/educators.js
const express = require('express');
const router = express.Router();
const Educator = require('../models/Educator');
const { protect } = require('../middleware/auth'); // Importar el middleware de protección
const bcrypt = require('bcryptjs'); // Para hashear contraseñas en update

// Todas las rutas CRUD para educadores estarán protegidas
//router.use(protect); // Aplica el middleware 'protect' a todas las rutas definidas en este router

// @route   GET /api/educators
// @desc    Obtener todos los educadores
// @access  Private
router.get('/', async (req, res) => {
    try {
        const educators = await Educator.find().select('-password'); // No retornar contraseñas
        res.json(educators);
    } catch (err) {
        console.error('Error al obtener educadores:', err.message);
        res.status(500).send('Error del servidor');
    }
});

// @route   GET /api/educators/:id
// @desc    Obtener un educador por ID
// @access  Private
router.get('/:id', async (req, res) => {
    try {
        const educator = await Educator.findById(req.params.id).select('-password');
        if (!educator) {
            return res.status(404).json({ message: 'Educador no encontrado' });
        }
        res.json(educator);
    } catch (err) {
        console.error('Error al obtener educador por ID:', err.message);
        if (err.kind === 'ObjectId') {
            return res.status(400).json({ message: 'ID de educador inválido' });
        }
        res.status(500).send('Error del servidor');
    }
});

// @route   POST /api/educators
// @desc    Crear un nuevo educador
// @access  Private
router.post('/', async (req, res) => {
    const { firstName, lastName, email, password, school } = req.body;

    // Validaciones básicas
    if (!firstName || !lastName || !email || !password || !school) {
        return res.status(400).json({ message: 'Todos los campos son requeridos para crear un educador.' });
    }

    try {
        // Verificar si el email ya está registrado
        let educator = await Educator.findOne({ email });
        if (educator) {
            return res.status(400).json({ message: 'El email ya está registrado.' });
        }

        educator = new Educator({ firstName, lastName, email, password, school });
        await educator.save(); // La contraseña se hashea en el pre-save hook del modelo

        // Devolver el educador creado (sin la contraseña)
        const newEducatorResponse = await Educator.findById(educator._id).select('-password');
        res.status(201).json(newEducatorResponse);
    } catch (err) {
        console.error('Error al crear educador:', err.message);
        res.status(500).send('Error del servidor');
    }
});

// @route   PUT /api/educators/:id
// @desc    Actualizar un educador existente
// @access  Private
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { firstName, lastName, email, school, password } = req.body;

    const educatorFields = {};
    if (firstName) educatorFields.firstName = firstName;
    if (lastName) educatorFields.lastName = lastName;
    if (email) educatorFields.email = email;
    if (school) educatorFields.school = school;

    // Si se proporciona una nueva contraseña, hashearla
    if (password) {
        const salt = await bcrypt.genSalt(10);
        educatorFields.password = await bcrypt.hash(password, salt);
    }

    try {
        let educator = await Educator.findById(id);
        if (!educator) {
            return res.status(404).json({ message: 'Educador no encontrado' });
        }

        // Si se intenta cambiar el email a uno ya existente por otro usuario
        if (email && email !== educator.email) {
            const existingEducator = await Educator.findOne({ email });
            if (existingEducator && existingEducator._id.toString() !== id) {
                return res.status(400).json({ message: 'El email ya está registrado por otro educador.' });
            }
        }

        educator = await Educator.findByIdAndUpdate(
            id,
            { $set: educatorFields },
            { new: true, runValidators: true } // 'new: true' retorna el doc actualizado; 'runValidators' ejecuta validaciones del esquema
        ).select('-password'); // No retornar password

        res.json(educator);
    } catch (err) {
        console.error('Error al actualizar educador:', err.message);
        if (err.kind === 'ObjectId') {
            return res.status(400).json({ message: 'ID de educador inválido' });
        }
        res.status(500).send('Error del servidor');
    }
});

// @route   DELETE /api/educators/:id
// @desc    Eliminar un educador
// @access  Private
router.delete('/:id', protect, async (req, res) => {
    console.log(`[DELETE] Petición para eliminar educador con ID: ${req.params.id}`); // <-- Añade esto
    try {
        const educator = await Educator.findById(req.params.id);
        if (!educator) {
            console.log(`[DELETE] Educador con ID ${req.params.id} no encontrado.`); // <-- Añade esto
            return res.status(404).json({ message: 'Educador no encontrado' });
        }
        await Educator.findByIdAndDelete(req.params.id); // Este es el método correcto
        console.log(`[DELETE] Educador con ID ${req.params.id} eliminado correctamente.`); // <-- Añade esto
        res.json({ message: 'Educador eliminado correctamente' }); // Cambiado a 200 OK con mensaje
        // Anteriormente: res.status(204).send(); // 204 No Content no envía cuerpo, es más difícil de depurar
    } catch (err) {
        console.error(`[DELETE] Error al eliminar educador con ID ${req.params.id}:`, err.message); // <-- Añade esto
        if (err.kind === 'ObjectId') {
            return res.status(400).json({ message: 'ID de educador inválido' });
        }
        res.status(500).send('Error del servidor');
    }
});

module.exports = router;