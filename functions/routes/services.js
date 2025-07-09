const express = require("express");
const router = express.Router();
const admin = require("firebase-admin");

const db = admin.firestore();

// Obtener todos los servicios
router.get("/", async (req, res) => {
  try {
    const snapshot = await db.collection("services").get();
    const services = snapshot.docs.map(doc => ({ 
      _id: doc.id, 
      ...doc.data() 
    }));
    res.json(services);
  } catch (error) {
    console.error("Error al obtener servicios:", error);
    res.status(500).json({ error: "Error al obtener servicios: " + error.message });
  }
});

// Actualizar un servicio
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };
    
    // Remover campos de control
    delete updateData.currentUserId;
    delete updateData.currentUserRole;
    
    // Agregar timestamp de actualización
    updateData.updatedAt = admin.firestore.FieldValue.serverTimestamp();
    
    // Validaciones específicas por tipo de actualización
    if (updateData.status === "tomado") {
      updateData.takenAt = admin.firestore.FieldValue.serverTimestamp();
    }
    
    if (updateData.status === "con_observacion") {
      updateData.observationAt = admin.firestore.FieldValue.serverTimestamp();
      // Validar que haya una observación
      if (!updateData.observations || updateData.observations.trim() === "") {
        return res.status(400).json({ error: "Las observaciones son requeridas" });
      }
    }
    
    if (updateData.status === "terminado") {
      updateData.finalizedAt = admin.firestore.FieldValue.serverTimestamp();
    }
    
    if (updateData.precioAprobado) {
      updateData.precioAprobadoFecha = admin.firestore.FieldValue.serverTimestamp();
    }
    
    await db.collection("services").doc(id).update(updateData);
    
    // Obtener el documento actualizado
    const doc = await db.collection("services").doc(id).get();
    const updatedService = { _id: doc.id, ...doc.data() };
    
    res.json(updatedService);
  } catch (error) {
    console.error("Error al actualizar servicio:", error);
    res.status(500).json({ error: "Error al actualizar servicio: " + error.message });
  }
});

// Eliminar un servicio
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await db.collection("services").doc(id).delete();
    res.json({ message: "Servicio eliminado exitosamente" });
  } catch (error) {
    console.error("Error al eliminar servicio:", error);
    res.status(500).json({ error: "Error al eliminar servicio: " + error.message });
  }
});

module.exports = router;