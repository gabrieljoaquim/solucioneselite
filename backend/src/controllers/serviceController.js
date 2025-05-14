const Service = require('../models/serviceModel');

exports.createService = async (req, res) => {
  try {
    const service = new Service(req.body);
    await service.save();
    res.status(201).json(service);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.getServices = async (req, res) => {
  try {
    const services = await Service.find().lean();
    res.json(services);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Actualizar un servicio (por id)
exports.updateService = async (req, res) => {
  try {
    const { id } = req.params;
    // Si se envía $push, usar $push para agregar observación
    if (req.body.$push && req.body.$push.observations) {
      const updated = await Service.findByIdAndUpdate(
        id,
        { $push: { observations: req.body.$push.observations } },
        { new: true }
      );
      if (!updated) return res.status(404).json({ error: 'Servicio no encontrado' });
      return res.json(updated);
    }
    // Si no, actualizar normalmente
    const updated = await Service.findByIdAndUpdate(id, req.body, { new: true });
    if (!updated) return res.status(404).json({ error: 'Servicio no encontrado' });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};