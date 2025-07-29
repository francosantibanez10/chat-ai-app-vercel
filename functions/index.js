/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

const {setGlobalOptions} = require("firebase-functions");
const {onRequest} = require("firebase-functions/https");
const logger = require("firebase-functions/logger");
const stripe = require("stripe")("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");

// Configuración global
setGlobalOptions({ maxInstances: 10 });

// Configuración de planes (versión 2.0 - precios reales)
const plans = {
  // Plus Plan
  price_1Rnnf9K8PyGecaUxPEAR5fjH: {
    name: "Plus",
    price: 1499, // 14.99 EUR en centavos
    currency: "eur",
    interval: "month",
  },
  price_1Rnnf9K8PyGecaUxhfdzUgus: {
    name: "Plus",
    price: 11999, // 119.99 EUR en centavos
    currency: "eur",
    interval: "year",
  },
  // Pro Plan
  price_1Rnnf9K8PyGecaUxJBH3t5uD: {
    name: "Pro",
    price: 15999, // 159.99 EUR en centavos
    currency: "eur",
    interval: "month",
  },
  price_1Rnnf9K8PyGecaUxWgNk9rsq: {
    name: "Pro",
    price: 99900, // 999.00 EUR en centavos
    currency: "eur",
    interval: "year",
  },
};

// API de Chat
exports.chat = onRequest(async (request, response) => {
  // Configurar CORS
  response.set('Access-Control-Allow-Origin', '*');
  response.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  response.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (request.method === 'OPTIONS') {
    response.status(204).send('');
    return;
  }

  if (request.method !== 'POST') {
    response.status(405).json({ error: 'Método no permitido' });
    return;
  }

  try {
    logger.info('API Chat: Request recibida', { 
      method: request.method,
      body: request.body 
    });

    // Aquí iría la lógica del chat
    // Por ahora, devolvemos una respuesta de prueba
    response.status(200).json({
      message: "API de Chat funcionando correctamente",
      timestamp: new Date().toISOString(),
      project: "mineral-nebula-459522-a9"
    });

  } catch (error) {
    logger.error('Error en API Chat:', error);
    response.status(500).json({ error: 'Error interno del servidor' });
  }
});

// API de Generate Image
exports.generateImage = onRequest(async (request, response) => {
  // Configurar CORS
  response.set('Access-Control-Allow-Origin', '*');
  response.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  response.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (request.method === 'OPTIONS') {
    response.status(204).send('');
    return;
  }

  if (request.method !== 'POST') {
    response.status(405).json({ error: 'Método no permitido' });
    return;
  }

  try {
    logger.info('API Generate Image: Request recibida', { 
      method: request.method,
      body: request.body 
    });

    // Aquí iría la lógica de generación de imágenes
    response.status(200).json({
      message: "API de Generate Image funcionando correctamente",
      timestamp: new Date().toISOString(),
      project: "mineral-nebula-459522-a9"
    });

  } catch (error) {
    logger.error('Error en API Generate Image:', error);
    response.status(500).json({ error: 'Error interno del servidor' });
  }
});

// API de Web Search
exports.webSearch = onRequest(async (request, response) => {
  // Configurar CORS
  response.set('Access-Control-Allow-Origin', '*');
  response.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  response.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (request.method === 'OPTIONS') {
    response.status(204).send('');
    return;
  }

  if (request.method !== 'POST') {
    response.status(405).json({ error: 'Método no permitido' });
    return;
  }

  try {
    logger.info('API Web Search: Request recibida', { 
      method: request.method,
      body: request.body 
    });

    // Aquí iría la lógica de búsqueda web
    response.status(200).json({
      message: "API de Web Search funcionando correctamente",
      timestamp: new Date().toISOString(),
      project: "mineral-nebula-459522-a9"
    });

  } catch (error) {
    logger.error('Error en API Web Search:', error);
    response.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Crear sesión de checkout
exports.createCheckoutSession = onRequest(async (request, response) => {
  // Configurar CORS
  response.set('Access-Control-Allow-Origin', '*');
  response.set('Access-Control-Allow-Methods', 'GET, POST');
  response.set('Access-Control-Allow-Headers', 'Content-Type');

  if (request.method === 'OPTIONS') {
    response.status(204).send('');
    return;
  }

  if (request.method !== 'POST') {
    response.status(405).json({ error: 'Método no permitido' });
    return;
  }

  try {
    const { priceId, userId, successUrl, cancelUrl } = request.body;

    logger.info('Creando sesión de checkout', { priceId, userId });

    if (!priceId || !plans[priceId]) {
      logger.error('Plan no válido', { priceId });
      return response.status(400).json({ error: "Plan no válido" });
    }

    const plan = plans[priceId];

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: plan.currency,
            product_data: {
              name: `Rubi ${plan.name}`,
              description: `Plan ${plan.name} de Rubi`,
            },
            unit_amount: plan.price,
            recurring: {
              interval: plan.interval,
            },
          },
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: successUrl,
      cancel_url: cancelUrl,
      client_reference_id: userId,
      metadata: {
        userId: userId,
        plan: plan.name.toLowerCase(),
        interval: plan.interval,
      },
    });

    logger.info('Sesión de checkout creada exitosamente', { sessionId: session.id });
    response.json({ sessionId: session.id });

  } catch (error) {
    logger.error('Error creando sesión de checkout', error);
    response.status(500).json({ error: "Error interno del servidor" });
  }
});

// Crear sesión del portal de cliente
exports.createPortalSession = onRequest(async (request, response) => {
  // Configurar CORS
  response.set('Access-Control-Allow-Origin', '*');
  response.set('Access-Control-Allow-Methods', 'GET, POST');
  response.set('Access-Control-Allow-Headers', 'Content-Type');

  if (request.method === 'OPTIONS') {
    response.status(204).send('');
    return;
  }

  if (request.method !== 'POST') {
    response.status(405).json({ error: 'Método no permitido' });
    return;
  }

  try {
    const { customerId, returnUrl } = request.body;

    if (!customerId) {
      return response.status(400).json({ error: "Customer ID requerido" });
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl,
    });

    response.json({ url: session.url });
  } catch (error) {
    logger.error('Error creando sesión del portal', error);
    response.status(500).json({ error: "Error interno del servidor" });
  }
});

// Obtener productos y precios de Stripe
exports.getStripeProducts = onRequest(async (request, response) => {
  // Configurar CORS
  response.set('Access-Control-Allow-Origin', '*');
  response.set('Access-Control-Allow-Methods', 'GET');
  response.set('Access-Control-Allow-Headers', 'Content-Type');

  if (request.method === 'OPTIONS') {
    response.status(204).send('');
    return;
  }

  if (request.method !== 'GET') {
    response.status(405).json({ error: 'Método no permitido' });
    return;
  }

  try {
    // Obtener productos
    const products = await stripe.products.list({
      active: true,
    });

    // Obtener precios
    const prices = await stripe.prices.list({
      active: true,
    });

    response.json({
      products: products.data,
      prices: prices.data,
      total_products: products.data.length,
      total_prices: prices.data.length,
    });

  } catch (error) {
    logger.error('Error obteniendo productos de Stripe', error);
    response.status(500).json({ error: "Error al obtener productos de Stripe" });
  }
});

// Webhook para eventos de Stripe
exports.stripeWebhook = onRequest(async (request, response) => {
  const sig = request.headers['stripe-signature'];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;

  try {
    event = stripe.webhooks.constructEvent(request.rawBody, sig, endpointSecret);
  } catch (err) {
    logger.error('Error verificando webhook', err.message);
    return response.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Manejar eventos
  switch (event.type) {
    case 'checkout.session.completed':
      const session = event.data.object;
      logger.info('Checkout completado', { sessionId: session.id, customerId: session.customer });
      break;
    
    case 'customer.subscription.created':
      const subscription = event.data.object;
      logger.info('Suscripción creada', { subscriptionId: subscription.id, customerId: subscription.customer });
      break;
    
    case 'customer.subscription.updated':
      const updatedSubscription = event.data.object;
      logger.info('Suscripción actualizada', { subscriptionId: updatedSubscription.id, status: updatedSubscription.status });
      break;
    
    case 'customer.subscription.deleted':
      const deletedSubscription = event.data.object;
      logger.info('Suscripción cancelada', { subscriptionId: deletedSubscription.id });
      break;
    
    default:
      logger.info(`Evento no manejado: ${event.type}`);
  }

  response.json({ received: true });
});
