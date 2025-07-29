const express = require("express");
const cors = require("cors");
const { google } = require("googleapis");
const { OAuth2Client } = require("google-auth-library");
const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));
// Configuración de Stripe con claves de producción
const stripe = require("stripe")(
  "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"
);
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3001;

// Configuración OAuth2 para Gmail
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const GOOGLE_REDIRECT_URI =
  process.env.GOOGLE_REDIRECT_URI ||
  `http://localhost:${PORT}/api/gmail/callback`;

// Middleware
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:8080",
    credentials: true,
  })
);
app.use(express.json());

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

// Crear sesión de checkout
app.post("/api/stripe/create-checkout-session", async (req, res) => {
  try {
    const { priceId, userId, successUrl, cancelUrl } = req.body;

    if (!priceId || !plans[priceId]) {
      return res.status(400).json({ error: "Plan no válido" });
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
              interval: "month",
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
      },
    });

    res.json({ sessionId: session.id });
  } catch (error) {
    console.error("Error creating checkout session:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

// Crear sesión del portal de cliente
app.post("/api/stripe/create-portal-session", async (req, res) => {
  try {
    const { customerId, returnUrl } = req.body;

    if (!customerId) {
      return res.status(400).json({ error: "Customer ID requerido" });
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl,
    });

    res.json({ url: session.url });
  } catch (error) {
    console.error("Error creating portal session:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

// Obtener estado de suscripción
app.get("/api/stripe/subscription-status", async (req, res) => {
  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({ error: "User ID requerido" });
    }

    // Buscar suscripciones activas para el usuario
    const subscriptions = await stripe.subscriptions.list({
      limit: 1,
      status: "active",
      expand: ["data.customer"],
    });

    const userSubscription = subscriptions.data.find(
      (sub) =>
        sub.metadata.userId === userId || sub.client_reference_id === userId
    );

    if (userSubscription) {
      res.json({
        hasActiveSubscription: true,
        plan: userSubscription.metadata.plan || "plus",
        customerId: userSubscription.customer.id,
        subscriptionId: userSubscription.id,
      });
    } else {
      res.json({ hasActiveSubscription: false });
    }
  } catch (error) {
    console.error("Error getting subscription status:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

// Webhook para eventos de Stripe
app.post(
  "/api/stripe/webhook",
  express.raw({ type: "application/json" }),
  async (req, res) => {
    const sig = req.headers["stripe-signature"];
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

    let event;

    try {
      event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    } catch (err) {
      console.error("Webhook signature verification failed:", err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Manejar eventos
    switch (event.type) {
      case "checkout.session.completed":
        const session = event.data.object;
        console.log(
          "Checkout completed for user:",
          session.client_reference_id
        );
        // Aquí podrías actualizar la base de datos del usuario
        break;

      case "customer.subscription.created":
        const subscription = event.data.object;
        console.log("Subscription created:", subscription.id);
        break;

      case "customer.subscription.updated":
        const updatedSubscription = event.data.object;
        console.log("Subscription updated:", updatedSubscription.id);
        break;

      case "customer.subscription.deleted":
        const deletedSubscription = event.data.object;
        console.log("Subscription deleted:", deletedSubscription.id);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    res.json({ received: true });
  }
);

// Ruta de salud
app.get("/api/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() });
});

// ===== ENDPOINTS DE GMAIL OAUTH2 =====

// Endpoint de prueba para Gmail con credenciales de servicio
app.get("/api/gmail/test", async (req, res) => {
  try {
    console.log("Probando Gmail API con credenciales de servicio...");

    // Usar credenciales de servicio
    const auth = new google.auth.GoogleAuth({
      keyFile: "./google-service-account.json",
      scopes: [
        "https://www.googleapis.com/auth/gmail.readonly",
        "https://www.googleapis.com/auth/gmail.send",
        "https://www.googleapis.com/auth/gmail.modify",
        "https://www.googleapis.com/auth/gmail.labels",
      ],
    });

    const authClient = await auth.getClient();
    const gmail = google.gmail({ version: "v1", auth: authClient });

    // Intentar obtener información del perfil de Gmail
    const profile = await gmail.users.getProfile({
      userId: "me",
    });

    console.log("Gmail API funcionando:", profile.data);

    res.json({
      success: true,
      profile: profile.data,
      message: "Gmail API funcionando correctamente",
    });
  } catch (error) {
    console.error("Error en Gmail test:", error);
    res.status(500).json({
      error: "Error en Gmail test",
      details: error.message,
      stack: error.stack,
    });
  }
});

// Endpoint de prueba para Gmail con OAuth2 de usuario
app.get("/api/gmail/test-oauth", async (req, res) => {
  try {
    const { accessToken } = req.query;

    if (!accessToken) {
      return res.status(400).json({ error: "Access token requerido" });
    }

    console.log("Probando Gmail API con OAuth2 de usuario...");

    const oauth2Client = new OAuth2Client();
    oauth2Client.setCredentials({ access_token: accessToken });

    const gmail = google.gmail({ version: "v1", auth: oauth2Client });

    // Intentar obtener información del perfil de Gmail
    const profile = await gmail.users.getProfile({
      userId: "me",
    });

    console.log("Gmail API funcionando con OAuth2:", profile.data);

    res.json({
      success: true,
      profile: profile.data,
      message: "Gmail API funcionando correctamente con OAuth2",
    });
  } catch (error) {
    console.error("Error en Gmail test OAuth2:", error);
    res.status(500).json({
      error: "Error en Gmail test OAuth2",
      details: error.message,
      stack: error.stack,
    });
  }
});

// Iniciar flujo de OAuth2
app.get("/api/gmail/auth", (req, res) => {
  try {
    if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
      return res
        .status(500)
        .json({ error: "Configuración de Google OAuth incompleta" });
    }

    const oauth2Client = new OAuth2Client(
      GOOGLE_CLIENT_ID,
      GOOGLE_CLIENT_SECRET,
      GOOGLE_REDIRECT_URI
    );

    const scopes = [
      "https://www.googleapis.com/auth/gmail.readonly",
      "https://www.googleapis.com/auth/gmail.send",
      "https://www.googleapis.com/auth/gmail.modify",
      "https://www.googleapis.com/auth/gmail.labels",
      "https://www.googleapis.com/auth/drive",
      "https://www.googleapis.com/auth/drive.file",
      "https://www.googleapis.com/auth/documents",
      "https://www.googleapis.com/auth/spreadsheets",
      "https://www.googleapis.com/auth/calendar",
      "https://www.googleapis.com/auth/calendar.events",
      "https://www.googleapis.com/auth/calendar.readonly",
      "https://www.googleapis.com/auth/userinfo.email",
      "https://www.googleapis.com/auth/userinfo.profile",
    ];

    const authUrl = oauth2Client.generateAuthUrl({
      access_type: "offline",
      scope: scopes,
      prompt: "consent",
    });

    res.json({ authUrl });
  } catch (error) {
    console.error("Error generating auth URL:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

// Callback de OAuth2
app.get("/api/gmail/callback", async (req, res) => {
  try {
    const { code } = req.query;

    if (!code) {
      return res
        .status(400)
        .json({ error: "Código de autorización requerido" });
    }

    const oauth2Client = new OAuth2Client(
      GOOGLE_CLIENT_ID,
      GOOGLE_CLIENT_SECRET,
      GOOGLE_REDIRECT_URI
    );

    const { tokens } = await oauth2Client.getToken(code);

    // En producción, aquí guardarías los tokens en una base de datos
    // asociados al usuario autenticado

    res.json({
      success: true,
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
      expiresIn: tokens.expires_in,
    });
  } catch (error) {
    console.error("Error in OAuth callback:", error);
    res.status(500).json({ error: "Error en la autenticación" });
  }
});

// Proxy para llamadas a Gmail API
app.post("/api/gmail/proxy", async (req, res) => {
  try {
    const { accessToken, endpoint, method = "GET", data } = req.body;

    if (!accessToken || !endpoint) {
      return res
        .status(400)
        .json({ error: "Access token y endpoint requeridos" });
    }

    const oauth2Client = new OAuth2Client();
    oauth2Client.setCredentials({ access_token: accessToken });

    const gmail = google.gmail({ version: "v1", auth: oauth2Client });

    let result;
    switch (method.toUpperCase()) {
      case "GET":
        result = await gmail.users.messages.list({
          userId: "me",
          ...data,
        });
        break;
      case "POST":
        result = await gmail.users.messages.send({
          userId: "me",
          requestBody: data,
        });
        break;
      case "PUT":
        result = await gmail.users.messages.modify({
          userId: "me",
          id: data.messageId,
          requestBody: data.modifications,
        });
        break;
      case "DELETE":
        result = await gmail.users.messages.delete({
          userId: "me",
          id: data.messageId,
        });
        break;
      default:
        return res.status(400).json({ error: "Método no soportado" });
    }

    res.json(result.data);
  } catch (error) {
    console.error("Error in Gmail proxy:", error);
    res.status(500).json({ error: "Error en la API de Gmail" });
  }
});

// ===== FIN ENDPOINTS DE GMAIL OAUTH2 =====

// ===== ENDPOINTS DE GOOGLE DRIVE =====

// Endpoint de prueba para Drive con credenciales de aplicación
app.get("/api/drive/test", async (req, res) => {
  try {
    console.log("Probando Drive API con credenciales de servicio...");

    // Usar credenciales de servicio
    const auth = new google.auth.GoogleAuth({
      keyFile: "./google-service-account.json",
      scopes: [
        "https://www.googleapis.com/auth/drive",
        "https://www.googleapis.com/auth/drive.file",
        "https://www.googleapis.com/auth/documents",
        "https://www.googleapis.com/auth/spreadsheets",
      ],
    });

    const authClient = await auth.getClient();
    const drive = google.drive({ version: "v3", auth: authClient });

    const result = await drive.files.list({
      pageSize: 10,
      fields: "nextPageToken, files(id, name, mimeType, size, modifiedTime)",
      orderBy: "modifiedTime desc",
    });

    console.log(
      "Drive API funcionando:",
      result.data.files?.length || 0,
      "archivos"
    );

    res.json({
      success: true,
      files: result.data.files || [],
      message: "Drive API funcionando correctamente",
    });
  } catch (error) {
    console.error("Error en Drive test:", error);
    res.status(500).json({
      error: "Error en Drive test",
      details: error.message,
      stack: error.stack,
    });
  }
});

// Obtener archivos de Drive
app.get("/api/drive/files", async (req, res) => {
  try {
    const { accessToken, query, pageSize = 20, pageToken } = req.query;

    if (!accessToken) {
      return res.status(400).json({ error: "Access token requerido" });
    }

    console.log("Access token recibido:", accessToken.substring(0, 20) + "...");

    const oauth2Client = new OAuth2Client();
    oauth2Client.setCredentials({ access_token: accessToken });

    const drive = google.drive({ version: "v3", auth: oauth2Client });

    const params = {
      pageSize: parseInt(pageSize),
      fields:
        "nextPageToken, files(id, name, mimeType, size, modifiedTime, parents, webViewLink)",
      orderBy: "modifiedTime desc",
    };

    if (query) params.q = query;
    if (pageToken) params.pageToken = pageToken;

    console.log("Llamando a Drive API con params:", params);

    const result = await drive.files.list(params);

    console.log(
      "Resultado de Drive API:",
      result.data.files?.length || 0,
      "archivos"
    );

    res.json({
      files: result.data.files || [],
      nextPageToken: result.data.nextPageToken,
    });
  } catch (error) {
    console.error("Error getting Drive files:", error);
    console.error("Error details:", error.message);
    res
      .status(500)
      .json({ error: "Error obteniendo archivos", details: error.message });
  }
});

// Leer contenido de archivo
app.get("/api/drive/files/:fileId/content", async (req, res) => {
  try {
    const { fileId } = req.params;
    const { accessToken } = req.query;

    if (!accessToken) {
      return res.status(400).json({ error: "Access token requerido" });
    }

    const oauth2Client = new OAuth2Client();
    oauth2Client.setCredentials({ access_token: accessToken });

    const drive = google.drive({ version: "v3", auth: oauth2Client });

    // Obtener información del archivo
    const fileInfo = await drive.files.get({
      fileId,
      fields: "id, name, mimeType, size",
    });

    // Obtener contenido según el tipo
    const mimeType = fileInfo.data.mimeType;

    if (mimeType === "application/vnd.google-apps.document") {
      // Documento de Google Docs
      const docs = google.docs({ version: "v1", auth: oauth2Client });
      const doc = await docs.documents.get({ documentId: fileId });
      res.json({
        type: "document",
        content: doc.data.body.content,
        name: fileInfo.data.name,
      });
    } else if (mimeType === "application/vnd.google-apps.spreadsheet") {
      // Hoja de cálculo de Google Sheets
      const sheets = google.sheets({ version: "v4", auth: oauth2Client });
      const sheet = await sheets.spreadsheets.get({ spreadsheetId: fileId });
      res.json({
        type: "spreadsheet",
        content: sheet.data,
        name: fileInfo.data.name,
      });
    } else {
      // Archivo binario (PDF, imagen, etc.)
      const response = await drive.files.get({
        fileId,
        alt: "media",
      });

      res.json({
        type: "binary",
        content: response.data,
        name: fileInfo.data.name,
        mimeType,
      });
    }
  } catch (error) {
    console.error("Error reading file content:", error);
    res.status(500).json({ error: "Error leyendo archivo" });
  }
});

// Crear nuevo documento
app.post("/api/drive/documents", async (req, res) => {
  try {
    const { accessToken, title, content } = req.body;

    if (!accessToken || !title) {
      return res
        .status(400)
        .json({ error: "Access token y título requeridos" });
    }

    const oauth2Client = new OAuth2Client();
    oauth2Client.setCredentials({ access_token: accessToken });

    const drive = google.drive({ version: "v3", auth: oauth2Client });
    const docs = google.docs({ version: "v1", auth: oauth2Client });

    // Crear documento vacío
    const document = await docs.documents.create({
      requestBody: {
        title: title,
      },
    });

    // Agregar contenido si se proporciona
    if (content) {
      await docs.documents.batchUpdate({
        documentId: document.data.documentId,
        requestBody: {
          requests: [
            {
              insertText: {
                location: {
                  index: 1,
                },
                text: content,
              },
            },
          ],
        },
      });
    }

    res.json({
      success: true,
      documentId: document.data.documentId,
      title: document.data.title,
    });
  } catch (error) {
    console.error("Error creating document:", error);
    res.status(500).json({ error: "Error creando documento" });
  }
});

// Crear nueva hoja de cálculo
app.post("/api/drive/spreadsheets", async (req, res) => {
  try {
    const { accessToken, title, data } = req.body;

    if (!accessToken || !title) {
      return res
        .status(400)
        .json({ error: "Access token y título requeridos" });
    }

    const oauth2Client = new OAuth2Client();
    oauth2Client.setCredentials({ access_token: accessToken });

    const sheets = google.sheets({ version: "v4", auth: oauth2Client });

    // Crear hoja de cálculo
    const spreadsheet = await sheets.spreadsheets.create({
      requestBody: {
        properties: {
          title: title,
        },
        sheets: [
          {
            properties: {
              title: "Hoja 1",
            },
          },
        ],
      },
    });

    // Agregar datos si se proporcionan
    if (data && Array.isArray(data)) {
      await sheets.spreadsheets.values.update({
        spreadsheetId: spreadsheet.data.spreadsheetId,
        range: "A1",
        valueInputOption: "RAW",
        requestBody: {
          values: data,
        },
      });
    }

    res.json({
      success: true,
      spreadsheetId: spreadsheet.data.spreadsheetId,
      title: spreadsheet.data.properties.title,
    });
  } catch (error) {
    console.error("Error creating spreadsheet:", error);
    res.status(500).json({ error: "Error creando hoja de cálculo" });
  }
});

// Subir archivo
app.post("/api/drive/upload", async (req, res) => {
  try {
    const { accessToken, fileName, mimeType, content } = req.body;

    if (!accessToken || !fileName || !content) {
      return res
        .status(400)
        .json({ error: "Access token, nombre y contenido requeridos" });
    }

    const oauth2Client = new OAuth2Client();
    oauth2Client.setCredentials({ access_token: accessToken });

    const drive = google.drive({ version: "v3", auth: oauth2Client });

    const fileMetadata = {
      name: fileName,
      mimeType: mimeType || "text/plain",
    };

    const media = {
      mimeType: mimeType || "text/plain",
      body: content,
    };

    const file = await drive.files.create({
      requestBody: fileMetadata,
      media: media,
      fields: "id, name, webViewLink",
    });

    res.json({
      success: true,
      fileId: file.data.id,
      name: file.data.name,
      link: file.data.webViewLink,
    });
  } catch (error) {
    console.error("Error uploading file:", error);
    res.status(500).json({ error: "Error subiendo archivo" });
  }
});

// ===== FIN ENDPOINTS DE GOOGLE DRIVE =====

// ===== ENDPOINTS DE GOOGLE MAPS =====

// Buscar lugares
app.get("/api/maps/places", async (req, res) => {
  try {
    const { query, location, radius = 5000, type, maxResults = 20 } = req.query;

    if (!query) {
      return res.status(400).json({ error: "Query requerido" });
    }

    const apiKey = process.env.GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      return res
        .status(500)
        .json({ error: "Google Maps API key no configurada" });
    }

    let url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(
      query
    )}&key=${apiKey}`;

    if (location) {
      url += `&location=${location}`;
    }

    if (radius) {
      url += `&radius=${radius}`;
    }

    if (type) {
      url += `&type=${type}`;
    }

    const response = await fetch(url);
    const data = await response.json();

    if (data.status !== "OK") {
      return res
        .status(400)
        .json({ error: `Error de Google Maps: ${data.status}` });
    }

    const places = data.results.slice(0, parseInt(maxResults)).map((place) => ({
      id: place.place_id,
      name: place.name,
      address: place.formatted_address,
      location: place.geometry?.location,
      rating: place.rating,
      userRatingsTotal: place.user_ratings_total,
      types: place.types,
      photos: place.photos?.map((photo) => ({
        reference: photo.photo_reference,
        width: photo.width,
        height: photo.height,
      })),
      openingHours: place.opening_hours,
      priceLevel: place.price_level,
      vicinity: place.vicinity,
    }));

    res.json({
      success: true,
      places,
      totalResults: data.results.length,
      nextPageToken: data.next_page_token,
    });
  } catch (error) {
    console.error("Error searching places:", error);
    res.status(500).json({ error: "Error buscando lugares" });
  }
});

// Obtener detalles de un lugar
app.get("/api/maps/places/:placeId", async (req, res) => {
  try {
    const { placeId } = req.params;
    const {
      fields = "name,formatted_address,geometry,rating,user_ratings_total,types,photos,opening_hours,price_level,vicinity,website,formatted_phone_number,reviews",
    } = req.query;

    const apiKey = process.env.GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      return res
        .status(500)
        .json({ error: "Google Maps API key no configurada" });
    }

    const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=${fields}&key=${apiKey}`;

    const response = await fetch(url);
    const data = await response.json();

    if (data.status !== "OK") {
      return res
        .status(400)
        .json({ error: `Error de Google Maps: ${data.status}` });
    }

    const place = data.result;
    res.json({
      success: true,
      place: {
        id: place.place_id,
        name: place.name,
        address: place.formatted_address,
        location: place.geometry?.location,
        rating: place.rating,
        userRatingsTotal: place.user_ratings_total,
        types: place.types,
        photos: place.photos?.map((photo) => ({
          reference: photo.photo_reference,
          width: photo.width,
          height: photo.height,
        })),
        openingHours: place.opening_hours,
        priceLevel: place.price_level,
        vicinity: place.vicinity,
        website: place.website,
        phone: place.formatted_phone_number,
        reviews: place.reviews?.slice(0, 5),
      },
    });
  } catch (error) {
    console.error("Error getting place details:", error);
    res.status(500).json({ error: "Error obteniendo detalles del lugar" });
  }
});

// Calcular ruta entre dos puntos
app.get("/api/maps/directions", async (req, res) => {
  try {
    const {
      origin,
      destination,
      mode = "driving",
      alternatives = false,
      waypoints,
    } = req.query;

    if (!origin || !destination) {
      return res.status(400).json({ error: "Origin y destination requeridos" });
    }

    const apiKey = process.env.GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      return res
        .status(500)
        .json({ error: "Google Maps API key no configurada" });
    }

    let url = `https://maps.googleapis.com/maps/api/directions/json?origin=${encodeURIComponent(
      origin
    )}&destination=${encodeURIComponent(
      destination
    )}&mode=${mode}&alternatives=${alternatives}&key=${apiKey}`;

    if (waypoints) {
      url += `&waypoints=${encodeURIComponent(waypoints)}`;
    }

    const response = await fetch(url);
    const data = await response.json();

    if (data.status !== "OK") {
      return res
        .status(400)
        .json({ error: `Error de Google Maps: ${data.status}` });
    }

    const routes = data.routes.map((route) => ({
      summary: route.summary,
      distance: route.legs[0]?.distance,
      duration: route.legs[0]?.duration,
      steps: route.legs[0]?.steps?.map((step) => ({
        instruction: step.html_instructions,
        distance: step.distance,
        duration: step.duration,
        polyline: step.polyline?.points,
      })),
      polyline: route.overview_polyline?.points,
      bounds: route.bounds,
      warnings: route.warnings,
    }));

    res.json({
      success: true,
      routes,
      totalRoutes: routes.length,
    });
  } catch (error) {
    console.error("Error calculating directions:", error);
    res.status(500).json({ error: "Error calculando ruta" });
  }
});

// Geocodificación (dirección a coordenadas)
app.get("/api/maps/geocode", async (req, res) => {
  try {
    const { address } = req.query;

    if (!address) {
      return res.status(400).json({ error: "Address requerido" });
    }

    const apiKey = process.env.GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      return res
        .status(500)
        .json({ error: "Google Maps API key no configurada" });
    }

    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
      address
    )}&key=${apiKey}`;

    const response = await fetch(url);
    const data = await response.json();

    if (data.status !== "OK") {
      return res
        .status(400)
        .json({ error: `Error de Google Maps: ${data.status}` });
    }

    const results = data.results.map((result) => ({
      address: result.formatted_address,
      location: result.geometry?.location,
      types: result.types,
      placeId: result.place_id,
      components: result.address_components,
    }));

    res.json({
      success: true,
      results,
    });
  } catch (error) {
    console.error("Error geocoding address:", error);
    res.status(500).json({ error: "Error en geocodificación" });
  }
});

// Geocodificación inversa (coordenadas a dirección)
app.get("/api/maps/reverse-geocode", async (req, res) => {
  try {
    const { lat, lng } = req.query;

    if (!lat || !lng) {
      return res.status(400).json({ error: "Lat y lng requeridos" });
    }

    const apiKey = process.env.GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      return res
        .status(500)
        .json({ error: "Google Maps API key no configurada" });
    }

    const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${apiKey}`;

    const response = await fetch(url);
    const data = await response.json();

    if (data.status !== "OK") {
      return res
        .status(400)
        .json({ error: `Error de Google Maps: ${data.status}` });
    }

    const results = data.results.map((result) => ({
      address: result.formatted_address,
      location: result.geometry?.location,
      types: result.types,
      placeId: result.place_id,
      components: result.address_components,
    }));

    res.json({
      success: true,
      results,
    });
  } catch (error) {
    console.error("Error reverse geocoding:", error);
    res.status(500).json({ error: "Error en geocodificación inversa" });
  }
});

// Buscar lugares cercanos
app.get("/api/maps/nearby", async (req, res) => {
  try {
    const {
      location,
      radius = 5000,
      type,
      keyword,
      maxResults = 20,
    } = req.query;

    if (!location) {
      return res.status(400).json({ error: "Location requerido" });
    }

    const apiKey = process.env.GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      return res
        .status(500)
        .json({ error: "Google Maps API key no configurada" });
    }

    let url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${location}&radius=${radius}&key=${apiKey}`;

    if (type) {
      url += `&type=${type}`;
    }

    if (keyword) {
      url += `&keyword=${encodeURIComponent(keyword)}`;
    }

    const response = await fetch(url);
    const data = await response.json();

    if (data.status !== "OK") {
      return res
        .status(400)
        .json({ error: `Error de Google Maps: ${data.status}` });
    }

    const places = data.results.slice(0, parseInt(maxResults)).map((place) => ({
      id: place.place_id,
      name: place.name,
      address: place.vicinity,
      location: place.geometry?.location,
      rating: place.rating,
      userRatingsTotal: place.user_ratings_total,
      types: place.types,
      photos: place.photos?.map((photo) => ({
        reference: photo.photo_reference,
        width: photo.width,
        height: photo.height,
      })),
      openingHours: place.opening_hours,
      priceLevel: place.price_level,
      distance: place.distance,
    }));

    res.json({
      success: true,
      places,
      totalResults: data.results.length,
      nextPageToken: data.next_page_token,
    });
  } catch (error) {
    console.error("Error searching nearby places:", error);
    res.status(500).json({ error: "Error buscando lugares cercanos" });
  }
});

// Obtener foto de un lugar
app.get("/api/maps/photos/:photoReference", async (req, res) => {
  try {
    const { photoReference } = req.params;
    const { maxWidth = 400, maxHeight = 400 } = req.query;

    const apiKey = process.env.GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      return res
        .status(500)
        .json({ error: "Google Maps API key no configurada" });
    }

    const url = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=${maxWidth}&maxheight=${maxHeight}&photo_reference=${photoReference}&key=${apiKey}`;

    const response = await fetch(url);

    if (!response.ok) {
      return res.status(400).json({ error: "Error obteniendo foto" });
    }

    const imageBuffer = await response.arrayBuffer();
    const base64Image = Buffer.from(imageBuffer).toString("base64");

    res.json({
      success: true,
      image: `data:image/jpeg;base64,${base64Image}`,
      width: response.headers.get("x-width"),
      height: response.headers.get("x-height"),
    });
  } catch (error) {
    console.error("Error getting photo:", error);
    res.status(500).json({ error: "Error obteniendo foto" });
  }
});

// ===== FIN ENDPOINTS DE GOOGLE MAPS =====

// Endpoints para límites de tokens
app.get("/api/tokens/usage", async (req, res) => {
  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({ error: "User ID requerido" });
    }

    // Obtener el plan del usuario
    const subscriptionStatus = await stripe.subscriptions.list({
      limit: 1,
      status: "active",
      expand: ["data.customer"],
    });

    const userSubscription = subscriptionStatus.data.find(
      (sub) =>
        sub.metadata.userId === userId || sub.client_reference_id === userId
    );

    const plan = userSubscription
      ? userSubscription.metadata.plan || "plus"
      : "free";
    const today = new Date().toISOString().split("T")[0];

    // En una implementación real, esto vendría de una base de datos
    // Por ahora, simulamos el uso de tokens
    const mockUsage = {
      userId,
      date: today,
      tokensUsed: Math.floor(Math.random() * 500), // Simular uso aleatorio
      plan,
      lastReset: new Date().toISOString(),
    };

    res.json(mockUsage);
  } catch (error) {
    console.error("Error getting token usage:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

app.post("/api/tokens/usage", async (req, res) => {
  try {
    const { userId, tokensUsed } = req.body;

    if (!userId || tokensUsed === undefined) {
      return res.status(400).json({ error: "User ID y tokensUsed requeridos" });
    }

    // En una implementación real, esto se guardaría en una base de datos
    console.log(`Usuario ${userId} usó ${tokensUsed} tokens`);

    res.json({ success: true, message: "Uso de tokens actualizado" });
  } catch (error) {
    console.error("Error updating token usage:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

// Endpoint para verificar límites
app.get("/api/tokens/limits", async (req, res) => {
  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({ error: "User ID requerido" });
    }

    // Obtener el plan del usuario
    const subscriptionStatus = await stripe.subscriptions.list({
      limit: 1,
      status: "active",
      expand: ["data.customer"],
    });

    const userSubscription = subscriptionStatus.data.find(
      (sub) =>
        sub.metadata.userId === userId || sub.client_reference_id === userId
    );

    const plan = userSubscription
      ? userSubscription.metadata.plan || "plus"
      : "free";

    // Configuración de límites (basado en ChatGPT)
    const limits = {
      free: { daily: 5000, monthly: 150000 },
      plus: { daily: 20000, monthly: 600000 },
      pro: { daily: 100000, monthly: 3000000 },
    };

    const currentLimit = limits[plan];
    const today = new Date().toISOString().split("T")[0];

    // Simular uso actual
    const currentUsage = Math.floor(Math.random() * currentLimit.daily);

    res.json({
      plan,
      dailyUsed: currentUsage,
      dailyLimit: currentLimit.daily,
      monthlyUsed: currentUsage * 30, // Simulación
      monthlyLimit: currentLimit.monthly,
      remainingDaily: Math.max(0, currentLimit.daily - currentUsage),
      remainingMonthly: Math.max(0, currentLimit.monthly - currentUsage * 30),
      isDailyExceeded: currentUsage >= currentLimit.daily,
      isMonthlyExceeded: currentUsage * 30 >= currentLimit.monthly,
    });
  } catch (error) {
    console.error("Error getting token limits:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

// ===== ENDPOINTS DE GOOGLE CALENDAR =====

// Listar calendarios del usuario
app.get("/api/calendar/calendars", async (req, res) => {
  try {
    const { accessToken } = req.query;
    if (!accessToken) {
      return res.status(400).json({ error: "Access token requerido" });
    }

    const oauth2Client = new OAuth2Client();
    oauth2Client.setCredentials({ access_token: accessToken });
    const calendar = google.calendar({ version: "v3", auth: oauth2Client });

    const response = await calendar.calendarList.list();
    res.json({
      success: true,
      calendars: response.data.items || [],
      message: "Calendarios obtenidos correctamente",
    });
  } catch (error) {
    console.error("Error getting calendars:", error);
    res.status(500).json({
      error: "Error obteniendo calendarios",
      details: error.message,
    });
  }
});

// Listar eventos de un calendario
app.get("/api/calendar/events", async (req, res) => {
  try {
    const {
      accessToken,
      calendarId = "primary",
      timeMin,
      timeMax,
      maxResults = 20,
    } = req.query;
    if (!accessToken) {
      return res.status(400).json({ error: "Access token requerido" });
    }

    const oauth2Client = new OAuth2Client();
    oauth2Client.setCredentials({ access_token: accessToken });
    const calendar = google.calendar({ version: "v3", auth: oauth2Client });

    const params = {
      calendarId,
      maxResults: parseInt(maxResults),
      singleEvents: true,
      orderBy: "startTime",
    };

    if (timeMin) params.timeMin = timeMin;
    if (timeMax) params.timeMax = timeMax;

    const response = await calendar.events.list(params);
    res.json({
      success: true,
      events: response.data.items || [],
      nextPageToken: response.data.nextPageToken,
      message: "Eventos obtenidos correctamente",
    });
  } catch (error) {
    console.error("Error getting events:", error);
    res.status(500).json({
      error: "Error obteniendo eventos",
      details: error.message,
    });
  }
});

// Crear nuevo evento
app.post("/api/calendar/events", async (req, res) => {
  try {
    const { accessToken, calendarId = "primary", event } = req.body;
    if (!accessToken || !event) {
      return res
        .status(400)
        .json({ error: "Access token y evento requeridos" });
    }

    const oauth2Client = new OAuth2Client();
    oauth2Client.setCredentials({ access_token: accessToken });
    const calendar = google.calendar({ version: "v3", auth: oauth2Client });

    const response = await calendar.events.insert({
      calendarId,
      requestBody: event,
    });

    res.json({
      success: true,
      event: response.data,
      message: "Evento creado correctamente",
    });
  } catch (error) {
    console.error("Error creating event:", error);
    res.status(500).json({
      error: "Error creando evento",
      details: error.message,
    });
  }
});

// Actualizar evento existente
app.put("/api/calendar/events/:eventId", async (req, res) => {
  try {
    const { accessToken, calendarId = "primary" } = req.body;
    const { eventId } = req.params;
    const { event } = req.body;

    if (!accessToken || !event) {
      return res
        .status(400)
        .json({ error: "Access token y evento requeridos" });
    }

    const oauth2Client = new OAuth2Client();
    oauth2Client.setCredentials({ access_token: accessToken });
    const calendar = google.calendar({ version: "v3", auth: oauth2Client });

    const response = await calendar.events.update({
      calendarId,
      eventId,
      requestBody: event,
    });

    res.json({
      success: true,
      event: response.data,
      message: "Evento actualizado correctamente",
    });
  } catch (error) {
    console.error("Error updating event:", error);
    res.status(500).json({
      error: "Error actualizando evento",
      details: error.message,
    });
  }
});

// Eliminar evento
app.delete("/api/calendar/events/:eventId", async (req, res) => {
  try {
    const { accessToken, calendarId = "primary" } = req.query;
    const { eventId } = req.params;

    if (!accessToken) {
      return res.status(400).json({ error: "Access token requerido" });
    }

    const oauth2Client = new OAuth2Client();
    oauth2Client.setCredentials({ access_token: accessToken });
    const calendar = google.calendar({ version: "v3", auth: oauth2Client });

    await calendar.events.delete({
      calendarId,
      eventId,
    });

    res.json({
      success: true,
      message: "Evento eliminado correctamente",
    });
  } catch (error) {
    console.error("Error deleting event:", error);
    res.status(500).json({
      error: "Error eliminando evento",
      details: error.message,
    });
  }
});

// Obtener evento específico
app.get("/api/calendar/events/:eventId", async (req, res) => {
  try {
    const { accessToken, calendarId = "primary" } = req.query;
    const { eventId } = req.params;

    if (!accessToken) {
      return res.status(400).json({ error: "Access token requerido" });
    }

    const oauth2Client = new OAuth2Client();
    oauth2Client.setCredentials({ access_token: accessToken });
    const calendar = google.calendar({ version: "v3", auth: oauth2Client });

    const response = await calendar.events.get({
      calendarId,
      eventId,
    });

    res.json({
      success: true,
      event: response.data,
      message: "Evento obtenido correctamente",
    });
  } catch (error) {
    console.error("Error getting event:", error);
    res.status(500).json({
      error: "Error obteniendo evento",
      details: error.message,
    });
  }
});

// Buscar eventos por texto
app.get("/api/calendar/search", async (req, res) => {
  try {
    const {
      accessToken,
      calendarId = "primary",
      query,
      timeMin,
      timeMax,
      maxResults = 20,
    } = req.query;
    if (!accessToken || !query) {
      return res.status(400).json({ error: "Access token y query requeridos" });
    }

    const oauth2Client = new OAuth2Client();
    oauth2Client.setCredentials({ access_token: accessToken });
    const calendar = google.calendar({ version: "v3", auth: oauth2Client });

    const params = {
      calendarId,
      q: query,
      maxResults: parseInt(maxResults),
      singleEvents: true,
      orderBy: "startTime",
    };

    if (timeMin) params.timeMin = timeMin;
    if (timeMax) params.timeMax = timeMax;

    const response = await calendar.events.list(params);
    res.json({
      success: true,
      events: response.data.items || [],
      nextPageToken: response.data.nextPageToken,
      message: "Búsqueda completada correctamente",
    });
  } catch (error) {
    console.error("Error searching events:", error);
    res.status(500).json({
      error: "Error buscando eventos",
      details: error.message,
    });
  }
});

// Obtener disponibilidad (tiempos libres)
app.get("/api/calendar/freebusy", async (req, res) => {
  try {
    const { accessToken, timeMin, timeMax, calendarIds } = req.query;
    if (!accessToken || !timeMin || !timeMax) {
      return res
        .status(400)
        .json({ error: "Access token, timeMin y timeMax requeridos" });
    }

    const oauth2Client = new OAuth2Client();
    oauth2Client.setCredentials({ access_token: accessToken });
    const calendar = google.calendar({ version: "v3", auth: oauth2Client });

    const requestBody = {
      timeMin,
      timeMax,
      items: calendarIds
        ? calendarIds.split(",").map((id) => ({ id }))
        : [{ id: "primary" }],
    };

    const response = await calendar.freebusy.query({
      requestBody,
    });

    res.json({
      success: true,
      freebusy: response.data,
      message: "Disponibilidad obtenida correctamente",
    });
  } catch (error) {
    console.error("Error getting freebusy:", error);
    res.status(500).json({
      error: "Error obteniendo disponibilidad",
      details: error.message,
    });
  }
});

// ===== FIN ENDPOINTS DE GOOGLE CALENDAR =====

// ===== WEB SEARCH ENDPOINTS =====

// Búsqueda web general
app.post("/api/search", async (req, res) => {
  try {
    const { query, count = 10, searchType = "web", language = "es" } = req.body;

    if (!query) {
      return res.status(400).json({ error: "Query requerida" });
    }

    // Usar DuckDuckGo Instant Answer API (gratuito, sin API key)
    const searchUrl = `https://api.duckduckgo.com/`;
    const params = new URLSearchParams({
      q: query,
      format: "json",
      no_html: "1",
      skip_disambig: "1",
    });

    const response = await fetch(`${searchUrl}?${params}`, {
      headers: {
        Accept: "application/json",
        "User-Agent": "Mozilla/5.0 (compatible; WebSearch/1.0)",
      },
    });

    if (!response.ok) {
      throw new Error(`Search API error: ${response.status}`);
    }

    const data = await response.json();

    // Crear resultados simulados basados en la respuesta de DuckDuckGo
    const results = [];

    if (data.Abstract) {
      results.push({
        title: data.Heading || query,
        url:
          data.AbstractURL ||
          `https://duckduckgo.com/?q=${encodeURIComponent(query)}`,
        description: data.Abstract,
        source: data.AbstractSource || "DuckDuckGo",
        published: null,
      });
    }

    if (data.RelatedTopics && data.RelatedTopics.length > 0) {
      data.RelatedTopics.slice(0, Math.min(count - 1, 5)).forEach((topic) => {
        if (topic.Text && topic.FirstURL) {
          results.push({
            title: topic.Text.split(" - ")[0] || topic.Text,
            url: topic.FirstURL,
            description: topic.Text,
            source: "DuckDuckGo Related",
            published: null,
          });
        }
      });
    }

    // Si no hay resultados, crear uno genérico
    if (results.length === 0) {
      results.push({
        title: `Resultados para: ${query}`,
        url: `https://duckduckgo.com/?q=${encodeURIComponent(query)}`,
        description: `Busca "${query}" en DuckDuckGo para obtener más resultados.`,
        source: "DuckDuckGo",
        published: null,
      });
    }

    res.json({
      success: true,
      results,
      totalResults: results.length,
      query,
    });
  } catch (error) {
    console.error("Error en búsqueda web:", error);
    res.status(500).json({
      error: "Error en búsqueda web",
      details: error.message,
    });
  }
});

// Búsqueda de noticias
app.post("/api/search/news", async (req, res) => {
  try {
    const { query, count = 10, language = "es" } = req.body;

    if (!query) {
      return res.status(400).json({ error: "Query requerida" });
    }

    // Usar DuckDuckGo para noticias (simulado)
    const searchUrl = `https://api.duckduckgo.com/`;
    const params = new URLSearchParams({
      q: `${query} news`,
      format: "json",
      no_html: "1",
      skip_disambig: "1",
    });

    const response = await fetch(`${searchUrl}?${params}`, {
      headers: {
        Accept: "application/json",
        "User-Agent": "Mozilla/5.0 (compatible; WebSearch/1.0)",
      },
    });

    if (!response.ok) {
      throw new Error(`News API error: ${response.status}`);
    }

    const data = await response.json();

    const results = [];

    if (data.Abstract) {
      results.push({
        title: data.Heading || `${query} - Noticias`,
        url:
          data.AbstractURL ||
          `https://duckduckgo.com/?q=${encodeURIComponent(query + " news")}`,
        description: data.Abstract,
        source: data.AbstractSource || "DuckDuckGo News",
        published: null,
      });
    }

    // Agregar resultados simulados
    for (let i = 1; i < Math.min(count, 5); i++) {
      results.push({
        title: `Noticia ${i} sobre ${query}`,
        url: `https://duckduckgo.com/?q=${encodeURIComponent(query + " news")}`,
        description: `Información actualizada sobre ${query} - fuente ${i}`,
        source: `Fuente ${i}`,
        published: null,
      });
    }

    res.json({
      success: true,
      results,
      totalResults: results.length,
      query,
    });
  } catch (error) {
    console.error("Error en búsqueda de noticias:", error);
    res.status(500).json({
      error: "Error en búsqueda de noticias",
      details: error.message,
    });
  }
});

// Búsqueda de imágenes
app.post("/api/search/images", async (req, res) => {
  try {
    const { query, count = 10, language = "es" } = req.body;

    if (!query) {
      return res.status(400).json({ error: "Query requerida" });
    }

    // Usar DuckDuckGo para imágenes (simulado)
    const searchUrl = `https://api.duckduckgo.com/`;
    const params = new URLSearchParams({
      q: `${query} images`,
      format: "json",
      no_html: "1",
      skip_disambig: "1",
    });

    const response = await fetch(`${searchUrl}?${params}`, {
      headers: {
        Accept: "application/json",
        "User-Agent": "Mozilla/5.0 (compatible; WebSearch/1.0)",
      },
    });

    if (!response.ok) {
      throw new Error(`Images API error: ${response.status}`);
    }

    const data = await response.json();

    const results = [];

    if (data.Image) {
      results.push({
        title: `${query} - Imagen`,
        url: data.Image,
        description: `Imagen relacionada con ${query}`,
        source: "DuckDuckGo Images",
        published: null,
      });
    }

    // Agregar resultados simulados
    for (let i = 1; i < Math.min(count, 5); i++) {
      results.push({
        title: `Imagen ${i} de ${query}`,
        url: `https://duckduckgo.com/?q=${encodeURIComponent(
          query + " images"
        )}`,
        description: `Imagen ${i} relacionada con ${query}`,
        source: `Fuente ${i}`,
        published: null,
      });
    }

    res.json({
      success: true,
      results,
      totalResults: results.length,
      query,
    });
  } catch (error) {
    console.error("Error en búsqueda de imágenes:", error);
    res.status(500).json({
      error: "Error en búsqueda de imágenes",
      details: error.message,
    });
  }
});

// Obtener resumen de página
app.post("/api/search/summary", async (req, res) => {
  try {
    const { url } = req.body;

    if (!url) {
      return res.status(400).json({ error: "URL requerida" });
    }

    // Obtener contenido de la página
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; WebSearch/1.0)",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error: ${response.status}`);
    }

    const html = await response.text();

    // Extraer texto del HTML (simplificado)
    const textContent = html
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .substring(0, 1000);

    res.json({
      success: true,
      summary: textContent,
      url,
    });
  } catch (error) {
    console.error("Error obteniendo resumen:", error);
    res.status(500).json({
      error: "Error obteniendo resumen de página",
      details: error.message,
    });
  }
});

// ===== FIN WEB SEARCH ENDPOINTS =====

// Obtener email del usuario
app.get("/api/user/email", async (req, res) => {
  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({ error: "User ID requerido" });
    }

    // Aquí normalmente obtendrías el email desde Firebase Admin SDK
    // Por ahora, vamos a simular la respuesta
    // En producción, deberías usar Firebase Admin para obtener el usuario

    // Simulación: retornar un email de ejemplo
    // En producción, reemplazar con:
    // const userRecord = await admin.auth().getUser(userId);
    // res.json({ email: userRecord.email });

    res.json({
      email: "soporte@rubiplus.com", // Temporal para testing
      userId,
    });
  } catch (error) {
    console.error("Error obteniendo email del usuario:", error);
    res.status(500).json({
      error: "Error obteniendo email del usuario",
      details: error.message,
    });
  }
});

// Manejo de errores
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Algo salió mal!" });
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
  console.log(`📧 Gmail OAuth: http://localhost:${PORT}/auth/gmail`);
  console.log(`📁 Drive OAuth: http://localhost:${PORT}/auth/drive`);
  console.log(
    `🗺️ Maps API Key: ${
      process.env.GOOGLE_MAPS_API_KEY ? "✅ Configurado" : "❌ No configurado"
    }`
  );
  console.log(`📅 Calendar OAuth: http://localhost:${PORT}/auth/calendar`);
  console.log(`🔍 Web Search: ✅ Configurado con DuckDuckGo API`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
});
