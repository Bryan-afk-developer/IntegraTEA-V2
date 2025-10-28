// server/app.js
const express = require('express');
const path = require('path');
const cors = require('cors');

// Apuntar .env a la carpeta raíz (un nivel arriba de __dirname)
require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') });

const connectDB = require('./config/db');

const app = express();
const PORT = process.env.PORT || 5000;

// Importar rutas de la API
const authRoutes = require('./routes/auth');
const educatorRoutes = require('./routes/educators');
const childrenRoutes = require('./routes/children');
const pictogramRoutes = require('./routes/pictograms'); // Ruta para pictogramas
const activityRoutes = require('./routes/activities'); // Ruta para actividades

// Conectar a la base de datos
connectDB();

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// Servir archivos estáticos del frontend
app.use(express.static(path.join(__dirname, '..', 'public')));

// Definir rutas de la API
app.use('/api/auth', authRoutes);
app.use('/api/educators', educatorRoutes);
app.use('/api/children', childrenRoutes);
app.use('/api/pictograms', pictogramRoutes); // <-- REGISTRAR RUTA
app.use('/api/activities', activityRoutes); // <-- REGISTRAR RUTA

// Servir el index.html para rutas de SPA (Catch-all para frontend)
// IMPORTANTE: Esto debe ir DESPUÉS de todas las rutas API
app.get('*', (req, res) => {
    if (!req.path.startsWith('/api')) {
        res.sendFile(path.resolve(__dirname, '..', 'public', 'index.html'));
    } else {
        // Si es una ruta API que no coincidió con ninguna anterior, es 404
        res.status(404).json({ message: 'API endpoint not found' });
    }
});

// Iniciar el servidor
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Frontend served at http://localhost:${PORT}`);
    console.log(`API endpoints available at http://localhost:${PORT}/api/...`);
});

