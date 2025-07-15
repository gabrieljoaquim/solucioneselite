
const express = require("express");
const router = express.Router();
const cors = require("cors");
const admin = require("firebase-admin");
const db = admin.firestore();

// Middleware CORS para todas las rutas de usuarios
router.use(cors());

// Obtener todos los usuarios
router.get("/", async (req, res) => {
  try {
    const snapshot = await db.collection("users").get();
    const users = snapshot.docs.map(doc => ({ _id: doc.id, ...doc.data() }));
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener usuarios" });
  }
});

// Actualizar usuario
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;
    await db.collection("users").doc(id).update(data);
    const updatedDoc = await db.collection("users").doc(id).get();
    res.json({ _id: updatedDoc.id, ...updatedDoc.data() });
  } catch (error) {
    res.status(500).json({ error: "Error al actualizar usuario" });
  }
});

// Eliminar usuario
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await db.collection("users").doc(id).delete();
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Error al eliminar usuario" });
  }
});

module.exports = router;
