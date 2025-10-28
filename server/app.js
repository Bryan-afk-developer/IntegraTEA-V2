// server/app.js
const express = require('express');
const path = require('path');
const cors = require('cors');
const connectDB = require('./config/db');
require('dotenv').config(); // Cargar variables de entorno

const app = express();
const PORT = process.env.PORT || 5000; // Usa el puerto de tu .env o 5000 por defecto

// Importar rutas de la API
const authRoutes = require('./routes/auth');
const educatorRoutes = require('./routes/educators');
const childrenRoutes = require('./routes/children'); // NUEVA LÍNEA: Importar rutas de niños

// Conectar a la base de datos
connectDB();

// Middlewares
app.use(express.json()); // Para parsear JSON en el body de las peticiones
app.use(express.urlencoded({ extended: true })); // Para parsear data de formularios
app.use(cors()); // Permite peticiones desde dominios diferentes (útil en desarrollo)

// Servir archivos estáticos del frontend desde la carpeta 'public'
// Esto permite que el navegador acceda a index.html, /css/style.css, /js/main.js, etc.
app.use(express.static(path.join(__dirname, '..', 'public')));

// Definir rutas de la API
app.use('/api/auth', authRoutes);
app.use('/api/educators', educatorRoutes);
app.use('/api/children', childrenRoutes); // NUEVA LÍNEA: Usar rutas de niños

// Para cualquier otra ruta que no sea una API, servir el index.html del frontend.
// Esto es esencial para Single Page Applications (SPA) cuando el frontend maneja el enrutamiento.
app.get('*', (req, res) => {
    // Si la solicitud no es a una ruta API, sirve el index.html
    // Esto asegura que al recargar una ruta de frontend (ej. /#users), Express sirva el SPA base
    if (!req.path.startsWith('/api')) {
        res.sendFile(path.resolve(__dirname, '..', 'public', 'index.html'));
    } else {
        // Si es una ruta API que no se encontró, devuelve 404
        res.status(404).json({ message: 'API endpoint not found' });
    }
});

// Iniciar el servidor
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Frontend served at http://localhost:${PORT}`);
    console.log(`API endpoints available at http://localhost:${PORT}/api/...`);
});