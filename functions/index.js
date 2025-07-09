const functions = require("firebase-functions");
const express = require("express");
const cors = require("cors");
const admin = require("firebase-admin");

admin.initializeApp();

const app = express();

// Configurar CORS correctamente
app.use(cors({
  origin: [
    "https://servilinkstore-8f04c.web.app",
    "https://servilinkstore-8f04c.firebaseapp.com",
    "http://localhost:8080",
    "http://127.0.0.1:8080"
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Importar rutas
const servicesRouter = require("./routes/services");
app.use("/services", servicesRouter);

// Ruta de prueba
app.get("/", (req, res) => {
  res.json({ message: "API funcionando correctamente" });
});

// Exportar como función HTTPS
exports.api = functions.https.onRequest(app);