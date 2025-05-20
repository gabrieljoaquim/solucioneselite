const Review = require('../models/reviewModel');
const User = require('../models/userModel');

const Service = require('../models/serviceModel');

exports.createReview = async (req, res) => {
  try {
    const { worker, client, service, comment, stars, publicClientName } = req.body;

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

    const review = new Review({ worker, client, service, comment, stars, publicClientName });
    await review.save();
    // Actualizar reputación del trabajador
    const reviews = await Review.find({ worker });
    const avg = reviews.reduce((acc, r) => acc + r.stars, 0) / reviews.length;
    await User.findByIdAndUpdate(worker, { rating: avg });
    res.status(201).json(review);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.getWorkerReviews = async (req, res) => {
  try {
    const { workerId } = req.params;
    const reviews = await Review.find({ worker: workerId }).populate('client', 'name');
    res.json(reviews);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.getWorkerRating = async (req, res) => {
  try {
    const { workerId } = req.params;
    const reviews = await Review.find({ worker: workerId });
    const avg = reviews.length ? (reviews.reduce((acc, r) => acc + r.stars, 0) / reviews.length) : 0;
    res.json({ rating: avg });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
