const express = require("express");
const router = express.Router();
const axios = require("axios");
const admin = require("firebase-admin");

const db = admin.firestore();

// POST /auth/login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const apiKey = process.env.FIREBASE_API_KEY;

    const firebaseRes = await axios.post(
      `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${apiKey}`,
      {
        email,
        password,
        returnSecureToken: true,
      }
    );

    const { localId: uid, email: userEmail, idToken } = firebaseRes.data;

    // Obtener perfil del usuario desde Firestore
    const userSnap = await db.collection("users").doc(uid).get();

    if (!userSnap.exists) {
      return res.status(404).json({ error: "El usuario no tiene un perfil en Firestore" });
    }

    const userData = userSnap.data();

    res.json({
      uid,
      email: userEmail,
      role: userData.role || "cliente",
      idToken,
    });

  } catch (err) {
    console.error("Error en login:", err.response?.data || err.message);
    return res.status(401).json({ error: "Email o contraseña inválidos." });
  }
});

// POST /auth/register
router.post("/register", async (req, res) => {
  const {
    name,
    email,
    password,
    phone,
    zone,
    specialty,
    experience,
    description,
    role,
    profilePhoto
  } = req.body;

  try {
    const apiKey = process.env.FIREBASE_API_KEY;

    // Crear el usuario en Firebase Auth
    const firebaseRes = await axios.post(
      `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${apiKey}`,
      {
        email,
        password,
        returnSecureToken: true,
      }
    );

    const { localId: uid } = firebaseRes.data;

    // Guardar perfil en Firestore
    await db.collection("users").doc(uid).set({
      name,
      email,
      phone,
      zone,
      specialty,
      experience,
      description,
      role: role || "cliente",
      profilePhoto,
    });

    res.status(201).json({ message: "Usuario registrado con éxito", userId: uid });
  } catch (err) {
    console.error("Error en register:", err.response?.data || err.message);
    return res.status(400).json({ error: "No se pudo registrar el usuario." });
  }
});


module.exports = router;
