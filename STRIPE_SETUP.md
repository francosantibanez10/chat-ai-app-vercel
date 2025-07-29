# Configuración de Stripe

## Pasos para configurar Stripe en tu aplicación

### 1. Crear cuenta en Stripe
1. Ve a [stripe.com](https://stripe.com) y crea una cuenta
2. Completa la verificación de tu cuenta

### 2. Obtener las claves de API
1. En el dashboard de Stripe, ve a **Developers > API keys**
2. Copia tu **Publishable key** y **Secret key**

### 3. Crear los productos y precios en Stripe
1. Ve a **Products** en el dashboard de Stripe
2. Crea dos productos:
   - **Plus Plan** ($14.99/mes)
   - **Pro Plan** ($159.99/mes)

3. Para cada producto, crea dos precios:
   - **Mensual**: $14.99/mes y $159.99/mes
   - **Anual**: $11.99/mes y $127.99/mes (con 20% de descuento)

4. Copia los **Price IDs** de cada precio

### 4. Configurar las variables de entorno
Añade estas variables a tu archivo `.env.local`:

```env
# Stripe
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...

# Precios de Stripe
STRIPE_PLUS_MONTHLY_PRICE_ID=price_...
STRIPE_PLUS_YEARLY_PRICE_ID=price_...
STRIPE_PRO_MONTHLY_PRICE_ID=price_...
STRIPE_PRO_YEARLY_PRICE_ID=price_...

# URL base de tu aplicación
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

### 5. Configurar webhooks (opcional)
Para manejar eventos de pago en tiempo real:

1. Ve a **Developers > Webhooks** en Stripe
2. Crea un endpoint con la URL: `https://tu-dominio.com/api/webhooks`
3. Selecciona los eventos:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`

### 6. Probar la integración
1. Usa las tarjetas de prueba de Stripe:
   - **Éxito**: `4242 4242 4242 4242`
   - **Fallo**: `4000 0000 0000 0002`
   - **Requiere autenticación**: `4000 0025 0000 3155`

2. Fecha de expiración: cualquier fecha futura
3. CVC: cualquier número de 3 dígitos

### 7. Configurar el dominio en producción
Cuando despliegues tu aplicación:

1. Actualiza `NEXT_PUBLIC_BASE_URL` con tu dominio real
2. Cambia a las claves de producción de Stripe
3. Configura los webhooks con tu dominio de producción

## Estructura de precios recomendada

### Plus Plan
- **Mensual**: $14.99/mes
- **Anual**: $143.88/año ($11.99/mes, 20% descuento)

### Pro Plan
- **Mensual**: $159.99/mes
- **Anual**: $1,535.88/año ($127.99/mes, 20% descuento)

## Notas importantes
- Siempre usa las claves de prueba (`sk_test_`, `pk_test_`) en desarrollo
- Las claves de producción (`sk_live_`, `pk_live_`) solo en producción
- Los webhooks son importantes para mantener sincronizados los estados de suscripción
- Considera implementar un sistema de gestión de suscripciones para cancelaciones y cambios de plan 