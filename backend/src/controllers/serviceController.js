const Service = require('../models/serviceModel');
const path = require('path');
const fs = require('fs');
const pdfParse = require('pdf-parse');

exports.createService = async (req, res) => {
  try {
    const data = { ...req.body };
    if (req.user && req.user._id) {
      data.registranteId = req.user._id;
    }
    const service = new Service(data);
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

exports.updateService = async (req, res) => {
  try {
    const { id } = req.params;

    if (req.body.$push?.observations) {
      const updated = await Service.findByIdAndUpdate(
        id,
        { $push: { observations: req.body.$push.observations } },
        { new: true }
      );
      if (!updated) return res.status(404).json({ error: 'Servicio no encontrado' });
      return res.json(updated);
    }

    if (typeof req.body.precio !== 'undefined') {
      const service = await Service.findById(id);
      if (!service) return res.status(404).json({ error: 'Servicio no encontrado' });
      const { currentUserId, currentUserRole } = req.body;
      const takenByIdStr = service.takenById ? String(service.takenById) : '';
      const currentUserIdStr = currentUserId ? String(currentUserId) : '';
      if (
        !currentUserIdStr ||
        !currentUserRole ||
        !(
          currentUserRole === 'administrador' ||
          (currentUserRole === 'trabajador' && takenByIdStr === currentUserIdStr)
        )
      ) {
        return res.status(403).json({ error: 'No autorizado para editar el precio de este servicio' });
      }
      service.precio = req.body.precio;
      await service.save();
      return res.json(service);
    }

    if (req.body.backgroundColor || req.body.status) {
      const currentUserId = req.body.currentUserId;
      const currentUserRole = req.body.currentUserRole;
      const service = await Service.findById(id);
      if (!service) return res.status(404).json({ error: 'Servicio no encontrado' });

      if (!service.takenById) {
        const updated = await Service.findByIdAndUpdate(id, req.body, { new: true });
        return res.json(updated);
      }

      if (
        !currentUserId ||
        (!currentUserRole || (
          (service.takenById !== currentUserId &&
            service.takenBy !== req.body.takenBy &&
            service.takenByEmail !== req.body.takenByEmail) &&
          currentUserRole !== 'administrador')
        )
      ) {
        return res.status(403).json({ error: 'No autorizado para cambiar el estado/color de este servicio' });
      }
      const updated = await Service.findByIdAndUpdate(id, req.body, { new: true });
      return res.json(updated);
    }

    if (typeof req.body.details === 'string') {
      const updated = await Service.findByIdAndUpdate(id, { details: req.body.details }, { new: true });
      if (!updated) return res.status(404).json({ error: 'Servicio no encontrado' });
      return res.json(updated);
    }

    if (typeof req.body.precioAprobado !== 'undefined') {
      const update = {
        precioAprobado: !!req.body.precioAprobado,
        precioAprobadoFecha: req.body.precioAprobado ? new Date() : null
      };
      const updated = await Service.findByIdAndUpdate(id, update, { new: true });
      if (!updated) return res.status(404).json({ error: 'Servicio no encontrado' });
      return res.json(updated);
    }

    const updated = await Service.findByIdAndUpdate(id, req.body, { new: true });
    if (!updated) return res.status(404).json({ error: 'Servicio no encontrado' });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.deleteService = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Service.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ error: 'Servicio no encontrado' });
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// ✅ Nuevo endpoint: Procesa PDF y devuelve datos sin guardar en la BD
exports.uploadPdfDataOnly = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No se subió ningún archivo PDF' });
  }

  try {
    const pdfPath = req.file.path;
    const dataBuffer = fs.readFileSync(pdfPath);
    const data = await pdfParse(dataBuffer);
    const text = data.text;

    function extractField(label, fallback = "") {
      const regex = new RegExp(`${label}:\\s*(.+)`, "i");
      const match = text.match(regex);
      return match ? match[1].trim() : fallback;
    }

    const extractedData = {
      serviceType: extractField("Tipo de mantenimiento Locativo"),
      requester: req.user?.name || req.user?.email || '',
      phone: extractField("Télefono de contacto"),
      address: extractField("Ubicación"),
      workingHours: `${extractField("Horario de apertura") || ''} - ${extractField("Horario de cierre") || ''}`.trim(),
      details: extractField("Descripción de la novedad"),
      puntoVentaCodigo: extractField("Punto de venta código"),
      proveedorAsignado: extractField("Proveedor asignado"),
      nombreOficina: extractField("Nombre de Oficina"),
      reportDate: new Date().toISOString().split('T')[0],
      observations: [],
    };

    fs.unlinkSync(pdfPath); // Elimina el archivo temporal

    res.status(200).json(extractedData);
  } catch (err) {
    console.error('[ERROR] Error al procesar el PDF:', err);
    res.status(500).json({ error: 'Error al procesar el PDF', details: err.message });
  }
};

exports.uploadServicePhotos = async (req, res) => {
  try {
    const { serviceId } = req.params;
    const service = await Service.findById(serviceId);
    if (!service) {
      return res.status(404).json({ error: 'Servicio no encontrado' });
    }

    const photoPaths = req.files.map((file) => file.path);
    service.photos = [...(service.photos || []), ...photoPaths];
    await service.save();

    res.status(200).json({ message: 'Fotos subidas exitosamente', photos: photoPaths });
  } catch (err) {
    res.status(500).json({ error: 'Error al subir las fotos', details: err.message });
  }
};
