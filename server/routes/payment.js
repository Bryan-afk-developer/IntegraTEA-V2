// server/routes/payment.js
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
    createCheckoutSession,
    verifyPaymentStatus,
    handleStripeWebhook,
    getPremiumStatus,
    getPublishableKey,
    cancelSubscription
} = require('../controllers/payment');

// Ruta pública para obtener la clave pública de Stripe
router.get('/publishable-key', getPublishableKey);

// Rutas protegidas (requieren autenticación)
router.post('/create-checkout', protect, createCheckoutSession);
router.get('/verify/:sessionId', protect, verifyPaymentStatus);
router.get('/premium-status', protect, getPremiumStatus);
router.post('/cancel-subscription', protect, cancelSubscription);

// Webhook de Stripe (no requiere autenticación pero requiere firma de Stripe)
// NOTA: El raw body parser se configura en app.js para esta ruta específica
router.post('/webhook', handleStripeWebhook);

module.exports = router;


