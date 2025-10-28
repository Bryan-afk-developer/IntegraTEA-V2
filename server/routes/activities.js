// server/routes/activities.js
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Activity = require('../models/Activity');
const Child = require('../models/Child');
const Pictogram = require('../models/Pictogram');
const { protect } = require('../middleware/auth');

// Proteger todas las rutas de actividades
router.use(protect);

// @route   GET /api/activities
// @desc    Obtener todas las actividades
// @access  Private
router.get('/', async (req, res) => {
    try {
        // Usamos .populate para obtener los nombres del niño y educador,
        // en lugar de solo sus IDs.
        const activities = await Activity.find()
            .populate('childId', 'firstName lastName')
            .populate('educatorId', 'firstName lastName')
            .populate('pictogramIds', 'name imageUrl'); // Poblar también pictogramas
            
        res.json(activities);
    } catch (err) {
        console.error('Error al obtener actividades:', err.message);
        res.status(500).send('Error del servidor');
    }
});

// @route   GET /api/activities/:id
// @desc    Obtener una actividad por ID
// @access  Private
router.get('/:id', async (req, res) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return res.status(400).json({ message: 'ID de actividad inválido.' });
    }
    try {
        const activity = await Activity.findById(req.params.id)
            .populate('childId', 'firstName lastName')
            .populate('educatorId', 'firstName lastName')
            .populate('pictogramIds');

        if (!activity) {
            return res.status(404).json({ message: 'Actividad no encontrada' });
        }
        res.json(activity);
    } catch (err) {
        console.error('Error al obtener actividad por ID:', err.message);
        res.status(500).send('Error del servidor');
    }
});


// @route   POST /api/activities
// @desc    Crear una nueva actividad
// @access  Private
router.post('/', async (req, res) => {
    const { childId, pictogramIds, status } = req.body;

    // El educatorId lo tomamos del usuario autenticado (req.educator)
    const educatorId = req.educator._id;

    if (!childId || !pictogramIds || !pictogramIds.length) {
        return res.status(400).json({ message: 'Se requieren el ID del niño y al menos un pictograma.' });
    }

    try {
        // Validar que el niño y los pictogramas existan
        const childExists = await Child.findById(childId);
        if (!childExists) {
            return res.status(400).json({ message: 'El niño seleccionado no existe.' });
        }
        
        const foundPictograms = await Pictogram.countDocuments({ _id: { $in: pictogramIds } });
        if (foundPictograms !== pictogramIds.length) {
            return res.status(400).json({ message: 'Uno o más pictogramas seleccionados son inválidos.' });
        }

        const newActivity = new Activity({
            childId,
            educatorId,
            pictogramIds,
            status: status || 'asignada'
        });

        await newActivity.save();
        
        // Devolvemos la actividad recién creada y populada
        const populatedActivity = await Activity.findById(newActivity._id)
            .populate('childId', 'firstName lastName')
            .populate('educatorId', 'firstName lastName');
            
        res.status(201).json(populatedActivity);
    } catch (err) {
        console.error('Error al crear actividad:', err.message);
        res.status(500).send('Error del servidor');
    }
});

// @route   PUT /api/activities/:id
// @desc    Actualizar una actividad (ej. marcar como completada, cambiar pictogramas)
// @access  Private
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { childId, pictogramIds, status, score } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: 'ID de actividad inválido.' });
    }

    const activityFields = {};
    if (childId) activityFields.childId = childId;
    if (pictogramIds) activityFields.pictogramIds = pictogramIds;
    if (status) activityFields.status = status;
    if (score !== undefined) activityFields.score = score;
    if (status === 'completada' && !req.body.completedAt) {
        activityFields.completedAt = new Date();
    }

    try {
        const updatedActivity = await Activity.findByIdAndUpdate(
            id,
            { $set: activityFields },
            { new: true, runValidators: true }
        ).populate('childId', 'firstName lastName')
         .populate('educatorId', 'firstName lastName');

        if (!updatedActivity) {
            return res.status(404).json({ message: 'Actividad no encontrada' });
        }
        res.json(updatedActivity);
    } catch (err) {
        console.error('Error al actualizar actividad:', err.message);
        res.status(500).send('Error del servidor');
    }
});

// @route   DELETE /api/activities/:id
// @desc    Eliminar una actividad
// @access  Private
router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: 'ID de actividad inválido.' });
    }
    try {
        const activity = await Activity.findById(id);
        if (!activity) {
            return res.status(404).json({ message: 'Actividad no encontrada' });
        }
        
        // Opcional: ¿Solo el educador que la creó puede borrarla?
        // if (activity.educatorId.toString() !== req.educator._id.toString()) {
        //     return res.status(401).json({ message: 'No autorizado para eliminar esta actividad' });
        // }

        await Activity.findByIdAndDelete(id);
        res.json({ message: 'Actividad eliminada correctamente' });
    } catch (err) {
        console.error('Error al eliminar actividad:', err.message);
        res.status(500).send('Error del servidor');
    }
});

module.exports = router;
