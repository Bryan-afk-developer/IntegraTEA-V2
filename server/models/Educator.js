// server/models/Educator.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const EducatorSchema = new mongoose.Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true, select: false }, // No retornar password por defecto
    school: { type: String, required: true },
    isPremium: { type: Boolean, default: false },
    stripeCustomerId: { type: String },
    premiumExpiresAt: { type: Date },
    createdAt: { type: Date, default: Date.now }
});

// Hash de la contraseña antes de guardar
EducatorSchema.pre('save', async function (next) {
    if (!this.isModified('password')) { // Solo hashear si la contraseña ha sido modificada
        next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// Método para comparar contraseñas
EducatorSchema.methods.matchPassword = async function (enteredPassword) {
    // 'this.password' es accesible aquí si el documento fue recuperado con .select('+password')
    return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('Educator', EducatorSchema);