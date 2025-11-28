# Configuración del Sistema de Pagos con Stripe

Esta guía explica cómo configurar el sistema de pagos de IntegraTEA con Stripe.

## Requisitos Previos

1. Una cuenta de Stripe (gratuita): https://dashboard.stripe.com/register
2. Node.js y npm instalados
3. El servidor de IntegraTEA configurado

## Obtener las Claves de Stripe

### 1. Claves de Prueba (Development/Testing)

1. Inicia sesión en tu cuenta de Stripe
2. Ve a: https://dashboard.stripe.com/test/apikeys
3. Verás dos claves:
   - **Clave publicable** (Publishable key): Comienza con `pk_test_...`
   - **Clave secreta** (Secret key): Comienza con `sk_test_...` (haz clic en "Revelar clave de prueba")

### 2. Claves de Producción (cuando estés listo)

1. En el dashboard de Stripe, cambia de "Modo de prueba" a "Modo real"
2. Ve a: https://dashboard.stripe.com/apikeys
3. Las claves de producción comienzan con `pk_live_...` y `sk_live_...`

## Configuración del Archivo .env

1. En la raíz del proyecto (`IntegraTEA-V2/`), asegúrate de tener un archivo `.env`
2. Agrega o actualiza estas variables:

```env
# Stripe API Keys (Claves de PRUEBA para desarrollo)
STRIPE_SECRET_KEY=sk_test_tu_clave_secreta_aqui
STRIPE_PUBLISHABLE_KEY=pk_test_tu_clave_publicable_aqui
STRIPE_WEBHOOK_SECRET=whsec_tu_webhook_secret_aqui

# Cliente URL (para redirecciones después del pago)
CLIENT_URL=http://localhost:4200

# Otras variables necesarias
MONGO_URI=tu_mongodb_uri
JWT_SECRET=tu_jwt_secret
PORT=5001
```

## Configuración del Webhook de Stripe

Los webhooks permiten que Stripe notifique a tu servidor cuando ocurren eventos (como pagos completados).

### Para Desarrollo Local (usando Stripe CLI)

1. **Instala Stripe CLI**: https://stripe.com/docs/stripe-cli#install
   
   ```powershell
   # Windows (con Scoop)
   scoop install stripe
   ```

2. **Inicia sesión en Stripe CLI**:
   
   ```powershell
   stripe login
   ```

3. **Inicia el listener del webhook**:
   
   ```powershell
   stripe listen --forward-to localhost:5001/api/payments/webhook
   ```

4. **Copia el webhook secret** que se muestra (comienza con `whsec_...`) y agrégalo a tu archivo `.env` como `STRIPE_WEBHOOK_SECRET`

### Para Producción

1. Ve a: https://dashboard.stripe.com/webhooks
2. Haz clic en "Agregar endpoint"
3. URL del endpoint: `https://tu-dominio.com/api/payments/webhook`
4. Selecciona los eventos a escuchar:
   - `checkout.session.completed`
   - `customer.subscription.deleted` (si usas suscripciones)
5. Copia el "Signing secret" y agrégalo a tu archivo `.env` de producción

## Probar el Sistema de Pagos

### 1. Inicia el servidor

```powershell
npm start
```

### 2. Inicia la aplicación Angular

```powershell
cd client-angular
ng serve
```

### 3. Prueba con tarjetas de prueba de Stripe

Stripe proporciona tarjetas de prueba que puedes usar:

- **Tarjeta exitosa**: `4242 4242 4242 4242`
- **Tarjeta que requiere autenticación**: `4000 0027 6000 3184`
- **Tarjeta declinada**: `4000 0000 0000 0002`

Detalles adicionales para el formulario de prueba:
- **Fecha de expiración**: Cualquier fecha futura (ej: 12/25)
- **CVC**: Cualquier 3 dígitos (ej: 123)
- **ZIP**: Cualquier código postal (ej: 12345)

Más tarjetas de prueba: https://stripe.com/docs/testing

## Verificar que Funciona

1. Inicia sesión como educador en IntegraTEA
2. Ve al dashboard
3. Haz clic en el botón para actualizar a Premium
4. Completa el formulario de Stripe con una tarjeta de prueba
5. Verifica que:
   - Eres redirigido de vuelta al dashboard
   - Tu cuenta ahora muestra el estado Premium
   - En el dashboard de Stripe, ves el pago registrado

## Solución de Problemas

### Error: "Clave pública no configurada"
- Verifica que `STRIPE_PUBLISHABLE_KEY` esté en tu archivo `.env`
- Reinicia el servidor después de modificar `.env`

### Error: "Webhook signature verification failed"
- Asegúrate de que `STRIPE_WEBHOOK_SECRET` esté configurado correctamente
- Si usas Stripe CLI, verifica que el listener esté activo

### El pago se completa pero el usuario no se actualiza a Premium
- Verifica los logs del servidor para errores del webhook
- Asegúrate de que el webhook esté recibiendo eventos de Stripe

### Error de CORS
- Verifica que `CLIENT_URL` en `.env` coincida con la URL de tu aplicación Angular

## Recursos Adicionales

- [Documentación de Stripe Checkout](https://stripe.com/docs/payments/checkout)
- [Documentación de Webhooks](https://stripe.com/docs/webhooks)
- [Dashboard de Stripe](https://dashboard.stripe.com/)
- [Tarjetas de prueba de Stripe](https://stripe.com/docs/testing)
