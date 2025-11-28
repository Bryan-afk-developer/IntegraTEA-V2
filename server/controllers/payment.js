// server/controllers/payment.js
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Educator = require('../models/Educator');

/**
 * Crear una sesión de checkout de Stripe
 */
exports.createCheckoutSession = async (req, res) => {
    try {
        const educatorId = req.educator._id; // Del middleware de autenticación
        const educator = await Educator.findById(educatorId);

        if (!educator) {
            return res.status(404).json({ message: 'Educador no encontrado' });
        }

        // Si el educador ya es premium, no permitir crear otra sesión
        if (educator.isPremium && educator.premiumExpiresAt > new Date()) {
            return res.status(400).json({
                message: 'Ya tienes una suscripción premium activa',
                expiresAt: educator.premiumExpiresAt
            });
        }

        // Crear o recuperar el cliente de Stripe
        let customerId = educator.stripeCustomerId;

        if (!customerId) {
            const customer = await stripe.customers.create({
                email: educator.email,
                metadata: {
                    educatorId: educatorId.toString()
                }
            });
            customerId = customer.id;

            // Guardar el ID del cliente en la base de datos
            educator.stripeCustomerId = customerId;
            await educator.save();
        }

        // Crear sesión de checkout
        const session = await stripe.checkout.sessions.create({
            customer: customerId,
            payment_method_types: ['card'],
            line_items: [
                {
                    price_data: {
                        currency: 'usd',
                        product_data: {
                            name: 'IntegraTEA Premium',
                            description: 'Elimina todos los anuncios y disfruta de una experiencia sin interrupciones',
                        },
                        unit_amount: 499, // $4.99 en centavos
                    },
                    quantity: 1,
                },
            ],
            mode: 'payment',
            success_url: `${process.env.CLIENT_URL || 'http://localhost:4200'}/dashboard?payment=success&session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.CLIENT_URL || 'http://localhost:4200'}/dashboard?payment=cancelled`,
            metadata: {
                educatorId: educatorId.toString()
            }
        });

        res.json({ sessionId: session.id, url: session.url });
    } catch (error) {
        console.error('Error creating checkout session:', error);
        res.status(500).json({
            message: 'Error al crear la sesión de pago',
            error: error.message
        });
    }
};

/**
 * Verificar el estado del pago
 */
exports.verifyPaymentStatus = async (req, res) => {
    try {
        const { sessionId } = req.params;

        if (!sessionId) {
            return res.status(400).json({ message: 'Session ID es requerido' });
        }

        const session = await stripe.checkout.sessions.retrieve(sessionId);

        if (session.payment_status === 'paid') {
            // Actualizar el estado premium del educador
            const educatorId = session.metadata.educatorId;
            const educator = await Educator.findById(educatorId);

            if (educator) {
                educator.isPremium = true;
                // Premium por 1 año desde ahora
                const expiresAt = new Date();
                expiresAt.setFullYear(expiresAt.getFullYear() + 1);
                educator.premiumExpiresAt = expiresAt;
                await educator.save();

                res.json({
                    success: true,
                    isPremium: true,
                    message: '¡Pago exitoso! Ya eres premium.',
                    expiresAt: expiresAt
                });
            } else {
                res.status(404).json({ message: 'Educador no encontrado' });
            }
        } else {
            res.json({
                success: false,
                isPremium: false,
                message: 'El pago aún no se ha completado',
                status: session.payment_status
            });
        }
    } catch (error) {
        console.error('Error verifying payment:', error);
        res.status(500).json({ message: 'Error al verificar el pago', error: error.message });
    }
};

/**
 * Webhook de Stripe para eventos de pago
 */
exports.handleStripeWebhook = async (req, res) => {
    const sig = req.headers['stripe-signature'];
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    let event;

    try {
        event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
    } catch (err) {
        console.error('Webhook signature verification failed:', err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Manejar el evento
    switch (event.type) {
        case 'checkout.session.completed':
            const session = event.data.object;

            // Actualizar el estado premium del educador
            const educatorId = session.metadata.educatorId;
            const educator = await Educator.findById(educatorId);

            if (educator) {
                educator.isPremium = true;
                const expiresAt = new Date();
                expiresAt.setFullYear(expiresAt.getFullYear() + 1);
                educator.premiumExpiresAt = expiresAt;
                await educator.save();
                console.log(`Educator ${educatorId} upgraded to premium via webhook`);
            }
            break;

        case 'customer.subscription.deleted':
            // Si usas suscripciones recurrentes en el futuro
            console.log('Subscription deleted:', event.data.object);
            break;

        default:
            console.log(`Unhandled event type ${event.type}`);
    }

    res.json({ received: true });
};

/**
 * Obtener el estado premium del educador actual
 */
exports.getPremiumStatus = async (req, res) => {
    try {
        const educatorId = req.educator._id;
        const educator = await Educator.findById(educatorId);

        if (!educator) {
            return res.status(404).json({ message: 'Educador no encontrado' });
        }

        // Verificar si el premium ha expirado
        const isPremium = educator.isPremium &&
            educator.premiumExpiresAt &&
            educator.premiumExpiresAt > new Date();

        // Si ha expirado pero aún está marcado como premium, actualizar
        if (educator.isPremium && !isPremium) {
            educator.isPremium = false;
            await educator.save();
        }

        res.json({
            isPremium: isPremium,
            premiumExpiresAt: educator.premiumExpiresAt
        });
    } catch (error) {
        console.error('Error getting premium status:', error);
        res.status(500).json({ message: 'Error al obtener el estado premium', error: error.message });
    }
};

/**
 * Obtener la clave pública de Stripe
 */
exports.getPublishableKey = async (req, res) => {
    try {
        const publishableKey = process.env.STRIPE_PUBLISHABLE_KEY;

        if (!publishableKey) {
            return res.status(500).json({
                message: 'La clave pública de Stripe no está configurada'
            });
        }

        res.json({ publishableKey });
    } catch (error) {
        console.error('Error getting publishable key:', error);
        res.status(500).json({
            message: 'Error al obtener la clave pública',
            error: error.message
        });
    }
};

/**
 * Cancelar suscripción premium
 */
exports.cancelSubscription = async (req, res) => {
    try {
        const educatorId = req.educator._id;
        const educator = await Educator.findById(educatorId);

        if (!educator) {
            return res.status(404).json({ message: 'Educador no encontrado' });
        }

        // Verificar si el educador tiene una suscripción activa
        if (!educator.isPremium) {
            return res.status(400).json({
                message: 'No tienes una suscripción premium activa'
            });
        }

        // Cancelar el estado premium
        educator.isPremium = false;
        educator.premiumExpiresAt = null;
        await educator.save();

        res.json({
            success: true,
            message: 'Suscripción cancelada exitosamente',
            isPremium: false
        });
    } catch (error) {
        console.error('Error canceling subscription:', error);
        res.status(500).json({
            message: 'Error al cancelar la suscripción',
            error: error.message
        });
    }
};
