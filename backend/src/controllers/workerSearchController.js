const User = require('../models/userModel');
const { getDistance } = require('../utils/geoUtils');

// Buscar trabajadores por ciudad, especialidad y/o cercanía
exports.searchWorkers = async (req, res) => {
  try {
    const { city, specialty, lat, lon, maxDistance } = req.query;
    let query = { role: 'trabajador' };
    if (city) query['address'] = { $regex: city, $options: 'i' };
    if (specialty) query['specialty'] = { $in: [specialty] };
    let workers = await User.find(query).lean();
    // Si hay coordenadas, filtrar por distancia
    if (lat && lon && maxDistance) {
      workers = workers.filter(w =>
        w.location &&
        getDistance(lat, lon, w.location.lat, w.location.lon) <= maxDistance
      );
    }
    // Ordenar por rating descendente
    workers.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    res.json(workers);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
