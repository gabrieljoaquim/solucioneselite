
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

// Crear un nuevo usuario
router.post("/", async (req, res) => {
  try {
    const newUser = req.body;

    if (!newUser.email) {
      return res.status(400).json({ error: "El campo 'email' es requerido." });
    }

    const docRef = await db.collection("users").add(newUser);
    const doc = await docRef.get();

    res.status(201).json({ _id: doc.id, ...doc.data() });
  } catch (error) {
    console.error("Error al crear usuario:", error);
    res.status(500).json({ error: "Error al crear usuario: " + error.message });
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
