const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

async function setupStripeProducts() {
  try {
    console.log('🚀 Configurando productos de Stripe con precios competitivos...\n');

    // Crear producto Rubi Plus
    console.log('📦 Creando producto Rubi Plus...');
    const plusProduct = await stripe.products.create({
      name: 'Rubi Plus',
      description: 'Plan Plus de Rubi - Similar a ChatGPT Plus',
      metadata: {
        plan: 'plus'
      }
    });
    console.log(`✅ Producto Plus creado: ${plusProduct.id}`);

    // Crear precio para Rubi Plus (€20/mes)
    console.log('💰 Creando precio para Rubi Plus (€20/mes)...');
    const plusPrice = await stripe.prices.create({
      product: plusProduct.id,
      unit_amount: 2000, // 20.00 EUR en centavos
      currency: 'eur',
      recurring: {
        interval: 'month'
      },
      metadata: {
        plan: 'plus'
      }
    });
    console.log(`✅ Precio Plus creado: ${plusPrice.id}`);

    // Crear producto Rubi Pro
    console.log('📦 Creando producto Rubi Pro...');
    const proProduct = await stripe.products.create({
      name: 'Rubi Pro',
      description: 'Plan Pro de Rubi - Similar a ChatGPT Pro',
      metadata: {
        plan: 'pro'
      }
    });
    console.log(`✅ Producto Pro creado: ${proProduct.id}`);

    // Crear precio para Rubi Pro (€200/mes)
    console.log('💰 Creando precio para Rubi Pro (€200/mes)...');
    const proPrice = await stripe.prices.create({
      product: proProduct.id,
      unit_amount: 20000, // 200.00 EUR en centavos
      currency: 'eur',
      recurring: {
        interval: 'month'
      },
      metadata: {
        plan: 'pro'
      }
    });
    console.log(`✅ Precio Pro creado: ${proPrice.id}`);

    console.log('\n🎉 Configuración completada!');
    console.log('\n📋 Resumen de productos:');
    console.log(`Rubi Plus (€20/mes) - Producto: ${plusProduct.id}, Precio: ${plusPrice.id}`);
    console.log(`Rubi Pro (€200/mes) - Producto: ${proProduct.id}, Precio: ${proPrice.id}`);

    // Actualizar el archivo de configuración
    console.log('\n📝 Actualizando configuración...');
    console.log('Actualiza los siguientes archivos con los nuevos IDs:');
    console.log('1. src/services/stripe.ts - stripePriceId');
    console.log('2. server/index.js - plans object');

  } catch (error) {
    console.error('❌ Error configurando productos:', error);
  }
}

// Ejecutar la configuración
setupStripeProducts();
