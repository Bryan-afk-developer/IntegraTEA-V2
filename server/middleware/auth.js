// server/middleware/auth.js
const jwt = require('jsonwebtoken');
const Educator = require('../models/Educator');
require('dotenv').config();

const protect = async (req, res, next) => {
  let token;

  // Verificar si el token está en el encabezado Authorization (Bearer Token)
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1]; // Obtener el token
      const decoded = jwt.verify(token, process.env.JWT_SECRET); // Verificar y decodificar el token

      // Encontrar al educador por ID y adjuntarlo al objeto 'req' (sin la contraseña)
      req.educator = await Educator.findById(decoded.id).select('-password');
      next(); // Pasar al siguiente middleware/ruta
    } catch (error) {
      console.error('Error en el middleware de autenticación (JWT inválido):', error.message);
      return res.status(401).json({ message: 'No autorizado, token fallido o expirado' });
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'No autorizado, no hay token' });
  }
};

module.exports = { protect };