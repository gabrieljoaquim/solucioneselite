// Registra rutas especiales para funciones avanzadas
module.exports = function(app) {
  app.use('/api/reviews', require('./routes/reviewRoutes'));
  app.use('/api/verification', require('./routes/verificationRoutes'));
  app.use('/api/worker-search', require('./routes/workerSearchRoutes'));
  app.use('/api/gallery', require('./routes/galleryRoutes'));
  app.use('/api/schedule', require('./routes/scheduleRoutes'));
};
