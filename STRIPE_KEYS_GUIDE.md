# Obtener Claves de Stripe

Para que el sistema de pagos funcione, necesitas obtener claves válidas de Stripe.

## Pasos para Obtener las Claves de Prueba

### 1. Crear Cuenta en Stripe (si no tienes)

Ve a: https://dashboard.stripe.com/register

### 2. Acceder a las Claves de Prueba

1. Inicia sesión en tu cuenta de Stripe
2. Ve a: https://dashboard.stripe.com/test/apikeys
3. Verás dos claves:
   - **Publishable key** (Clave publicable) - comienza con `pk_test_...`
   - **Secret key** (Clave secreta) - comienza con `sk_test_...` 
     - Haz clic en "Reveal test key" para ver la clave completa

### 3. Actualizar el Archivo .env

Abre el archivo `IntegraTEA-V2/.env` y reemplaza las claves:

```env
STRIPE_SECRET_KEY=sk_test_TU_CLAVE_SECRETA_AQUI
STRIPE_PUBLISHABLE_KEY=pk_test_TU_CLAVE_PUBLICABLE_AQUI
```

### 4. Reiniciar el Servidor

Después de actualizar las claves, reinicia el servidor Node.js:

1. Presiona `Ctrl + C` en la terminal donde corre `npm start`
2. Ejecuta nuevamente: `npm start`

## Error Actual

El error 401 que estás viendo indica que las claves actuales en tu `.env` no son válidas o han expirado. Necesitas reemplazarlas con claves válidas de tu propia cuenta de Stripe.

## Tarjetas de Prueba

Una vez que tengas las claves configuradas, puedes probar con estas tarjetas:

- **Éxito**: `4242 4242 4242 4242`
- **Requiere autenticación**: `4000 0027 6000 3184`
- **Declinada**: `4000 0000 0000 0002`

Más información: https://stripe.com/docs/testing
