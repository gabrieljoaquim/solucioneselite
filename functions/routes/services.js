// backend/routes/services.js
const express = require("express");
const router = express.Router();
const { db } = require("../firebase");

// Obtener todos los servicios
router.get("/", async (req, res) => {
  try {
    const snapshot = await db.collection("services").get();
    const services = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(services);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener servicios" });
  }
});

module.exports = router;
