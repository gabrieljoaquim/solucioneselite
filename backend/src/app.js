require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 5000;
const TEST_PORT = process.env.TEST_PORT || 5001; // Use a different port for testing
const isTestEnvironment = process.env.NODE_ENV === 'test';
const serverPort = isTestEnvironment ? TEST_PORT : PORT;
const path = require("path");

// Middleware
app.use(express.json({ limit: '10mb' })); // Permitir payloads grandes para imágenes
app.use(cors({
  origin: ['https://solucioneselite-u60d.onrender.com', 'https://solucioneselite.onrender.com', 'http://localhost:8080'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Middleware CORS para todas las rutas y métodos
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Middleware para registrar solicitudes, respuestas y errores
app.use((req, res, next) => {
  console.log(`Solicitud: ${req.method} ${req.url}`);
  console.log(`Headers: ${JSON.stringify(req.headers)}`);
  console.log(`Body: ${JSON.stringify(req.body)}`);
  res.on('finish', () => {
    console.log(`Respuesta: ${res.statusCode}`);
  });
  next();
});

// Middleware para capturar errores
app.use((err, req, res, next) => {
  console.error(`Error: ${err.message}`);
  res.status(err.status || 500).json({ error: err.message });
});

// Middleware para ajustar la política de seguridad de contenido
app.use((req, res, next) => {
  res.header('Content-Security-Policy', "default-src 'self'; img-src * data: blob:;");

  next();
});

const uploadsPath = path.join(__dirname, "src/uploads");

// Aplica cabeceras CORS manualmente
app.use('/uploads', (req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*'); // puedes usar origen específico si lo deseas
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  next();
}, express.static(uploadsPath));


// MongoDB Connection
mongoose.set('strictQuery', true); // Suppress deprecation warning
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));


// Rutas principales
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/services', require('./routes/serviceRoutes'));
app.use('/api/messages', require('./routes/messageRoutes'));

// Rutas especiales (funciones avanzadas)
require('./registerSpecialRoutes')(app);

app.get('/api/test', (req, res) => {
  console.log('TEST ENDPOINT CALLED');
  res.json({ ok: true });
});

// Start Server
app.listen(serverPort, () => {
  console.log(`Server running on port ${serverPort}`);
});

app.use(express.urlencoded({ extended: true }));