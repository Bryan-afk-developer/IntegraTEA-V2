// server/routes/pictograms.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Pictogram = require('../models/Pictogram');
const { protect } = require('../middleware/auth');

// Crear directorio si no existe
const uploadsDir = path.join(__dirname, '..', 'uploads', 'pictograms');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
    console.log('Directorio de pictogramas creado:', uploadsDir);
}

// Configuración de multer
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/pictograms/');
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Solo se permiten archivos de imagen'), false);
    }
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 }
});

// Proteger todas las rutas
router.use(protect);

// GET - Obtener todos los pictogramas
router.get('/', async (req, res) => {
    try {
        const pictograms = await Pictogram.find().select('name category imageUrl');

        // Construir URL completa para las imágenes
        const port = process.env.PORT || 5001;
        const serverUrl = process.env.SERVER_URL || `http://localhost:${port}`;

        const pictogramsWithFullUrl = pictograms.map(picto => ({
            ...picto.toObject(),
            imageUrl: picto.imageUrl.startsWith('http')
                ? picto.imageUrl
                : `${serverUrl}${picto.imageUrl}`
        }));

        res.json(pictogramsWithFullUrl);
    } catch (err) {
        console.error('Error al obtener pictogramas:', err.message);
        res.status(500).json({ message: 'Error del servidor' });
    }
});

// POST - Crear pictograma
router.post('/', upload.single('image'), async (req, res) => {
    try {
        const { name, category } = req.body;

        if (!req.file) {
            return res.status(400).json({ message: 'La imagen es requerida' });
        }

        const imageUrl = `/uploads/pictograms/${req.file.filename}`;

        const newPictogram = new Pictogram({
            name,
            category,
            imageUrl
        });

        await newPictogram.save();

        // Devolver con URL completa
        const port = process.env.PORT || 5001;
        const serverUrl = process.env.SERVER_URL || `http://localhost:${port}`;

        res.status(201).json({
            message: 'Pictograma creado correctamente',
            pictogram: {
                ...newPictogram.toObject(),
                imageUrl: `${serverUrl}${imageUrl}`
            }
        });
    } catch (err) {
        console.error('Error al crear pictograma:', err.message);
        res.status(500).json({ message: 'Error al guardar pictograma' });
    }
});

module.exports = router;
