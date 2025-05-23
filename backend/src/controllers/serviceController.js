const Service = require('../models/serviceModel');
const path = require('path');
const fs = require('fs');
const pdfParse = require('pdf-parse');

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

// Validación global: impedir que un trabajador tome un nuevo servicio si tiene uno pendiente de cierre por cliente
exports.canWorkerTakeService = async (req, res, next) => {
  try {
    const { currentUserId, currentUserRole } = req.body;
    if (currentUserRole !== 'trabajador') return next();
    const openService = await Service.findOne({ takenById: currentUserId, clienteCerro: false });
    if (openService) {
      return res.status(400).json({ error: 'No puedes tomar un nuevo servicio hasta que el cliente cierre el anterior.' });
    }
    next();
  } catch (err) {
    res.status(400).json({ error: err.message });
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
        if (req.body.backgroundColor === 'lightgreen' && service.takenById == null) {
          // Validar que el trabajador no tenga otro servicio abierto
          const openService = await Service.findOne({
            takenById: req.body.currentUserId,
            clienteCerro: false
          });
          if (openService) {
            return res.status(400).json({ error: 'No puedes tomar un nuevo servicio hasta que el cliente cierre el anterior.' });
          }
        }
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
    const pdfPath = req.file.path;
    const dataBuffer = fs.readFileSync(pdfPath);
    const data = await pdfParse(dataBuffer);
    const text = data.text;

    // Lógica de extracción de campos (puedes mejorarla según el formato real)
    function extractField(label, fallback = "") {
      const regex = new RegExp(label + ":?\s*(.*)", "i");
      const match = text.match(regex);
      return match ? match[1].trim() : fallback;
    }

    // Extraer la descripción entre 'Descripción de la novedad' y la primera fecha (formato dd/m/yy)
    function extractDescriptionUntilDate(startLabel) {
      const normalizedText = text.replace(/[\r\f]+/g, '\n').replace(/[\u200B-\u200D\uFEFF]/g, '').replace(/ +/g, ' ');
      // Regex para encontrar la posición del label de inicio
      const startPattern = startLabel.split(' ').join('[ \n\r\f]*');
      const startRegex = new RegExp(startPattern + "[ \n\r\f]*:?", "i");
      const startMatch = startRegex.exec(normalizedText);
      if (!startMatch) {
        console.log(`[DEBUG] No se encontró el label de inicio '${startLabel}' en el texto extraído.`);
        return "";
      }
      const startIdx = startMatch.index + startMatch[0].length;
      const afterStart = normalizedText.substring(startIdx);
      // Regex para encontrar la primera fecha (ej: 13/5/25 o 13/05/2025)
      const dateRegex = /\b\d{1,2}\/\d{1,2}\/\d{2,4}(?:,? [0-9]{1,2}:[0-9]{2} ?[ap]\.?m\.?)*\b/;
      const dateMatch = dateRegex.exec(afterStart);
      let description;
      if (dateMatch) {
        description = afterStart.substring(0, dateMatch.index).trim();
      } else {
        description = afterStart.trim();
      }
      console.log(`[DEBUG] Descripción extraída entre '${startLabel}' y la primera fecha:`);
      console.log(description.substring(0, 500));
      return description;
    }

    // Extraer los datos pero NO guardar en la base de datos
    const extractedData = {
      serviceType: extractField("Tipo de mantenimiento Locativo"),
      requester: extractField("Nombres Apellidos"),
      phone: extractField("Télefono de contacto"),
      address: extractField("Ubicación"),
      workingHours: `${extractField("Horario de apertura") || ''} - ${extractField("Horario de cierre") || ''}`.trim(),
      details: extractDescriptionUntilDate("Descripción de la novedad"),
      puntoVentaCodigo: extractField("Punto de venta código"),
      proveedorAsignado: extractField("Proveedor asignado"),
      nombreOficina: extractField("Nombre de Oficina"),
      reportDate: new Date().toISOString().split('T')[0],
      observations: [],
      status: 'Nuevo',
    };
    // Limpieza: elimina el archivo subido
    fs.unlinkSync(pdfPath);
    res.status(200).json(extractedData);
  } catch (err) {
    res.status(500).json({ error: 'Error al procesar el PDF', details: err.message });
  }
};

// Endpoint para que el cliente cierre el servicio
exports.closeByClient = async (req, res) => {
  try {
    const { id } = req.params;
    const { currentUserId, currentUserRole, currentUserName } = req.body;
    const service = await Service.findById(id);
    if (!service) return res.status(404).json({ error: 'Servicio no encontrado' });
    // Solo el registrante puede cerrar
    if (service.registrante !== currentUserName && currentUserRole !== 'administrador') {
      return res.status(403).json({ error: 'Solo el registrante o un administrador puede cerrar el servicio.' });
    }
    // Solo puede cerrar si el trabajador ya lo marcó como terminado (backgroundColor azul)
    if (service.backgroundColor !== 'lightblue') {
      return res.status(400).json({ error: 'El trabajador debe marcar el servicio como terminado antes de que el cliente lo cierre.' });
    }
    if (service.clienteCerro) {
      return res.status(400).json({ error: 'El servicio ya fue cerrado por el cliente.' });
    }
    service.clienteCerro = true;
    service.backgroundColor = '#b3e5fc'; // azul más claro para cerrado por cliente
    await service.save();
    res.json(service);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};