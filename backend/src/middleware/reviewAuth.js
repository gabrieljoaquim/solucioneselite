// Middleware para validar que solo clientes puedan dejar reseñas tras un servicio cerrado
const User = require('../models/userModel');
const Service = require('../models/serviceModel');
const Review = require('../models/reviewModel');

// Uso: reviewAuth(req, res, next)
module.exports = async function reviewAuth(req, res, next) {
  try {
    const { worker, client, service } = req.body;
    // Validar que el usuario sea cliente
    const user = await User.findById(client);
    if (!user || user.role !== 'cliente') {
      return res.status(403).json({ error: 'Solo los clientes pueden dejar reseñas.' });
    }
    // Validar que el cliente haya recibido el servicio y que esté cerrado
    const serviceDoc = await Service.findById(service);
    if (!serviceDoc) {
      return res.status(400).json({ error: 'Servicio no encontrado.' });
    }
    if (!serviceDoc.clienteCerro) {
      return res.status(403).json({ error: 'Solo puedes dejar una reseña después de que el servicio haya sido cerrado.' });
    }
    if (
      (serviceDoc.requester !== user.name && serviceDoc.requester !== user.email)
      && String(serviceDoc.requester) !== String(user._id)
    ) {
      return res.status(403).json({ error: 'Solo el cliente que solicitó el servicio puede dejar una reseña.' });
    }
    // Validar que no exista ya una reseña para este servicio y cliente
    const existing = await Review.findOne({ client, service });
    if (existing) {
      return res.status(400).json({ error: 'Ya has dejado una reseña para este servicio.' });
    }
    next();
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
