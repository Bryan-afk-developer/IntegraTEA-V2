// server/routes/children.js
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose'); // Importar Mongoose para validar ObjectId
const Child = require('../models/Child');
const Educator = require('../models/Educator'); // Importar el modelo Educator para validación
const { protect } = require('../middleware/auth');

// Todas las rutas CRUD para niños estarán protegidas
router.use(protect);

// @route   GET /api/children
// @desc    Obtener todos los niños
// @access  Private
router.get('/', async (req, res) => {
    try {
        const children = await Child.find();
        const childrenWithRole = children.map(child => ({
            _id: child._id,
            firstName: child.firstName,
            lastName: child.lastName,
            age: child.age,
            educatorId: child.educatorId, // Mantener el ID para futuras referencias
            createdAt: child.createdAt,
            role: 'Niño' // Añadir la propiedad 'role' directamente aquí
        }));
        res.json(childrenWithRole);
    } catch (err) {
        console.error('Error al obtener niños:', err.message);
        res.status(500).send('Error del servidor');
    }
});

// NUEVA RUTA AÑADIDA: GET un niño por ID (para edición)
// @route   GET /api/children/:id
// @desc    Obtener un niño por ID
// @access  Private
router.get('/:id', async (req, res) => {
    const { id } = req.params;
    // Validar si el ID proporcionado es un ObjectId válido antes de buscar en la DB
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: 'ID de niño inválido.' });
    }
    try {
        const child = await Child.findById(id);
        if (!child) {
            return res.status(404).json({ message: 'Niño no encontrado' });
        }
        // Devolver los datos del niño incluyendo el rol para consistencia con el frontend
        res.json({ ...child.toObject(), role: 'Niño' }); 
    } catch (err) {
        console.error('Error al obtener niño por ID:', err.message);
        // Si hay un error diferente a un ObjectId inválido (ej. problema de conexión)
        res.status(500).send('Error del servidor');
    }
});


// @route   POST /api/children
// @desc    Crear un nuevo niño
// @access  Private
router.post('/', async (req, res) => {
    const { firstName, lastName, age, educatorId } = req.body;

    // Validaciones básicas
    if (!firstName || !lastName || !age || !educatorId) {
        return res.status(400).json({ message: 'Todos los campos (nombre, apellido, edad, educador) son requeridos para crear un niño.' });
    }
    if (isNaN(age) || age < 0 || age > 18) { // Validar que la edad sea un número razonable
        return res.status(400).json({ message: 'La edad debe ser un número válido entre 0 y 18.' });
    }
    if (!mongoose.Types.ObjectId.isValid(educatorId)) {
        return res.status(400).json({ message: 'ID de educador asignado inválido.' });
    }

    try {
        // Verificar que el educatorId realmente existe
        const educatorExists = await Educator.findById(educatorId);
        if (!educatorExists) {
            return res.status(400).json({ message: 'El educador asignado no existe.' });
        }

        const newChild = new Child({ firstName, lastName, age: parseInt(age), educatorId });
        await newChild.save();
        res.status(201).json({ ...newChild.toObject(), role: 'Niño' }); // Añadir rol para consistencia con el frontend
    } catch (err) {
        console.error('Error al crear niño:', err.message);
        res.status(500).send('Error del servidor');
    }
});

// @route   PUT /api/children/:id
// @desc    Actualizar un niño existente
// @access  Private
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { firstName, lastName, age, educatorId } = req.body;

    const childFields = {};
    if (firstName) childFields.firstName = firstName;
    if (lastName) childFields.lastName = lastName;
    if (age !== undefined) { // Permite 0 como edad válida
        if (isNaN(age) || age < 0 || age > 18) {
            return res.status(400).json({ message: 'La edad debe ser un número válido entre 0 y 18.' });
        }
        childFields.age = parseInt(age);
    }
    if (educatorId) {
        // Validar que el educatorId sea un ObjectId válido
        if (!mongoose.Types.ObjectId.isValid(educatorId)) {
            return res.status(400).json({ message: 'ID de educador asignado inválido.' });
        }
        try {
            // Verificar que el educatorId realmente existe
            const educatorExists = await Educator.findById(educatorId);
            if (!educatorExists) {
                return res.status(400).json({ message: 'El educador asignado no existe.' });
            }
        } catch (error) {
            console.error('Error verificando educador asignado:', error.message);
            return res.status(500).json({ message: 'Error interno al verificar educador asignado.' });
        }
        childFields.educatorId = educatorId;
    }

    try {
        const updatedChild = await Child.findByIdAndUpdate(
            id,
            { $set: childFields },
            { new: true, runValidators: true } // 'new: true' retorna el doc actualizado; 'runValidators' ejecuta validaciones del esquema
        );
        if (!updatedChild) {
            return res.status(404).json({ message: 'Niño no encontrado' });
        }
        res.json({ ...updatedChild.toObject(), role: 'Niño' }); // Añadir rol para consistencia con el frontend
    } catch (err) {
        console.error('Error al actualizar niño:', err.message);
        if (err.kind === 'ObjectId') {
            return res.status(400).json({ message: 'ID de niño inválido.' });
        }
        res.status(500).send('Error del servidor');
    }
});

// @route   DELETE /api/children/:id
// @desc    Eliminar un niño
// @access  Private
router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: 'ID de niño inválido.' });
    }
    try {
        const child = await Child.findById(id);
        if (!child) {
            return res.status(404).json({ message: 'Niño no encontrado' });
        }
        await Child.findByIdAndDelete(id);
        res.json({ message: 'Niño eliminado correctamente' });
    } catch (err) {
        console.error('Error al eliminar niño:', err.message);
        if (err.kind === 'ObjectId') {
            return res.status(400).json({ message: 'ID de niño inválido.' });
        }
        res.status(500).send('Error del servidor');
    }
});

module.exports = router;