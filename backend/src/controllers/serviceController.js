const Service = require('../models/serviceModel');
const path = require('path');
const fs = require('fs');
const pdfParse = require('pdf-parse');

exports.createService = async (req, res) => {
  try {
    // Always set registranteId from authenticated user
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

// Validación global: impedir que un trabajador tome un nuevo servicio si tiene uno pendiente de cierre por cliente
// canWorkerTakeService removed: client closure logic deleted

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

    // Control de edición de precio: solo trabajador asignado o admin
    if (typeof req.body.precio !== 'undefined') {
      const service = await Service.findById(id);
      if (!service) return res.status(404).json({ error: 'Servicio no encontrado' });
      const { currentUserId, currentUserRole } = req.body;
      // Debug log for troubleshooting
      console.log('[DEBUG] Precio edit request:', {
        takenById: service.takenById,
        currentUserId,
        currentUserRole,
        takenByIdType: typeof service.takenById,
        currentUserIdType: typeof currentUserId
      });
      // Always compare as strings, and force takenById to string if possible
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
      // Always store takenById as string
      if (service.takenById && typeof service.takenById !== 'string') {
        service.takenById = String(service.takenById);
      }
      await service.save();
      return res.json(service);
    }
    // Solo permitir cambios de color/estado si el usuario es el que tomó el servicio o admin
    if (req.body.backgroundColor || req.body.status) {
      const currentUserId = req.body.currentUserId;
      const currentUserRole = req.body.currentUserRole;
      const service = await Service.findById(id);
      if (!service) return res.status(404).json({ error: 'Servicio no encontrado' });
      // Permitir tomar el servicio si está libre
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
    // Si se actualiza el campo 'details' (descripción del arreglo)
    if (typeof req.body.details === 'string') {
      const updated = await Service.findByIdAndUpdate(id, { details: req.body.details }, { new: true });
      if (!updated) return res.status(404).json({ error: 'Servicio no encontrado' });
      return res.json(updated);
    }

    // Si el cliente aprueba el precio
    if (typeof req.body.precioAprobado !== 'undefined') {
      const update = {
        precioAprobado: !!req.body.precioAprobado,
        precioAprobadoFecha: req.body.precioAprobado ? new Date() : null
      };
      const updated = await Service.findByIdAndUpdate(id, update, { new: true });
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

// Eliminar un servicio (por id)
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

// Endpoint para subir PDF y extraer datos (NO crear servicio)
exports.uploadPdfAndCreateService = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No se subió ningún archivo PDF' });
  }
  try {
    console.log('[DEBUG] Archivo recibido:', req.file);
    const pdfPath = req.file.path;
    const dataBuffer = fs.readFileSync(pdfPath);
    console.log('[DEBUG] Archivo leído correctamente:', pdfPath);
    const data = await pdfParse(dataBuffer);
    console.log('[DEBUG] Datos del PDF extraídos:', data);
    const text = data.text;

    // Lógica de extracción de campos (puedes mejorarla según el formato real)
    function extractField(label, fallback = "") {
      const regex = new RegExp(label + ":?\s*(.*)", "i");
      const match = text.match(regex);
      return match ? match[1].trim() : fallback;
    }

    const extractedData = {
      serviceType: extractField("Tipo de mantenimiento Locativo"),
      requester: extractField("Nombres Apellidos"),
      phone: extractField("Télefono de contacto"),
      address: extractField("Ubicación"),
      workingHours: `${extractField("Horario de apertura") || ''} - ${extractField("Horario de cierre") || ''}`.trim(),
      details: extractField("Descripción de la novedad"),
      puntoVentaCodigo: extractField("Punto de venta código"),
      proveedorAsignado: extractField("Proveedor asignado"),
      nombreOficina: extractField("Nombre de Oficina"),
      reportDate: new Date().toISOString().split('T')[0],
      observations: [],
      status: 'Nuevo',
    };

    console.log('[DEBUG] Datos extraídos del PDF:', extractedData);

    // Validar datos antes de guardar
    if (!extractedData.serviceType || !extractedData.requester || !extractedData.phone) {
      throw new Error('Datos incompletos extraídos del PDF');
    }

    // Asegurar que el campo registranteId esté presente antes de guardar
    const currentUser = req.user; // Suponiendo que req.user contiene los datos del usuario autenticado
    if (!currentUser || !currentUser._id) {
      throw new Error('El campo registranteId es obligatorio y no está presente');
    }

    const pdfName = req.file.originalname;
    const newService = new Service({
      ...extractedData,
      pdfName,
      registranteId: currentUser._id, // Asignar el ID del usuario autenticado
    });
    await newService.save();
    console.log('[DEBUG] Servicio guardado en la base de datos:', newService);

    fs.unlinkSync(pdfPath);
    console.log('[DEBUG] Archivo PDF eliminado:', pdfPath);
    res.status(200).json(newService);
  } catch (err) {
    console.error('[ERROR] Error al procesar el PDF:', err);
    res.status(500).json({ error: 'Error al procesar el PDF', details: err.message });
  }
};

// Endpoint para que el cliente cierre el servicio
// closeByClient endpoint removed: client closure logic deleted

// Endpoint para subir fotos del servicio
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