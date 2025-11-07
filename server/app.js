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
const pictogramRoutes = require('./routes/pictograms');
const activityRoutes = require('./routes/activities');

// Conectar a la base de datos
connectDB();

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// --- LÍNEAS CORREGIDAS ---
// 1. Definir la ruta a la carpeta 'dist' de Angular
// La ruta correcta desde 'server/app.js' es subir un nivel ('..'), entrar a 'client-angular', luego a 'dist', etc.
const angularAppPath = path.join(__dirname, '..', 'client-angular', 'dist', 'client-angular', 'browser');

// 2. Servir los archivos estáticos desde la carpeta de Angular
app.use(express.static(angularAppPath));
// -------------------------


// Definir rutas de la API (DEBEN ir ANTES de la ruta catch-all del frontend)
app.use('/api/auth', authRoutes);
app.use('/api/educators', educatorRoutes);
app.use('/api/children', childrenRoutes);
app.use('/api/pictograms', pictogramRoutes);
app.use('/api/activities', activityRoutes);


// --- RUTA CATCH-ALL CORREGIDA ---
// Servir el index.html de Angular para cualquier otra ruta que no sea de la API.
// Esto permite que el enrutamiento de Angular funcione.
app.get('*', (req, res) => {
  res.sendFile(path.join(angularAppPath, 'index.html'));
});
// ---------------------------------


// Iniciar el servidor
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});