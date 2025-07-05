// backend/pdf-reader.js
const express = require("express");
const multer = require("multer");
const fs = require("fs");
const pdfParse = require("pdf-parse");
const router = express.Router();

const upload = multer({ dest: "uploads/" });

router.post("/pdf-reader", upload.single("pdf"), async (req, res) => {
  try {
    const dataBuffer = fs.readFileSync(req.file.path);
    const data = await pdfParse(dataBuffer);
    const text = data.text;

    const extract = (label, regex) => {
      const match = text.match(regex);
      return match ? match[1].trim() : "";
    };

    const parsedData = {
      requester: extract(/Nombres Apellidos\s+([A-ZÁÉÍÓÚÑ\s]+)/i, /Nombres Apellidos\s+([\w\sÁÉÍÓÚÑ]+)/i),
      phone: extract(/Télefono de contacto:\s*(.*)/i, /Télefono de contacto:\s*(.*)/i),
      address: extract(/DIRECCION:\s*(.*)/i, /DIRECCION:\s*(.*)/i),
      workingHours: extract(/Horario de apertura:\s*(\d{1,2}:\d{2})\s*Horario de cierre:\s*(\d{1,2}:\d{2})/i, /Horario de apertura:\s*(\d{1,2}:\d{2})\s*Horario de cierre:\s*(\d{1,2}:\d{2})/i),
      serviceType: extract(/Tipo de mantenimiento Locativo:\s*(.*)/i, /Tipo de mantenimiento Locativo:\s*(.*)/i),
      details: extract(/Descripción de la novedad:\s*([\s\S]+?)Cordialmente/i, /Descripción de la novedad:\s*([\s\S]+?)Cordialmente/i),
      puntoVentaCodigo: extract(/Punto de venta código:\s*(.*)/i, /Punto de venta código:\s*(.*)/i),
      proveedorAsignado: extract(/Proveedor asignado:\s*(.*)/i, /Proveedor asignado:\s*(.*)/i),
      nombreOficina: extract(/Nombre de Oficina:\s*(.*)/i, /Nombre de Oficina:\s*(.*)/i),
      observations: "", // Este puedes completarlo luego si hay otra sección en el PDF
      pdfReferencia: req.file.originalname.replace(".pdf", ""),
    };

    fs.unlinkSync(req.file.path); // limpiar archivo

    res.json(parsedData);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al procesar el PDF" });
  }
});

module.exports = router;
