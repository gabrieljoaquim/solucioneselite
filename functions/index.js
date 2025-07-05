/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

const {onRequest} = require("firebase-functions/v2/https");
const logger = require("firebase-functions/logger");

// Create and deploy your first functions
// https://firebase.google.com/docs/functions/get-started

// exports.helloWorld = onRequest((request, response) => {
//   logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });
const functions = require("firebase-functions");
const express = require("express");
const cors = require("cors");
const admin = require("firebase-admin");

admin.initializeApp();
const db = admin.firestore();

const app = express();
app.use(cors());
app.use(express.json());

// Endpoint para obtener servicios
app.get("/api/services", async (req, res) => {
  try {
    const snapshot = await db.collection("services").get();
    const services = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(services);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener servicios" });
  }
});

// Exportar como función HTTPS
exports.api = functions.https.onRequest(app);
