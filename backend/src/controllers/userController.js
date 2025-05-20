const crypto = require('crypto');
const nodemailer = require('nodemailer');
// Configuración de nodemailer (ajusta con tus credenciales reales)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Solicitar recuperación de contraseña
exports.resetPasswordRequest = async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'El correo es obligatorio.' });
  try {
    const user = await User.findOne({ email });
    if (!user) {
      // No revelar si el usuario existe
      return res.json({ message: 'Si el correo está registrado, se enviará un enlace de recuperación.' });
    }
    // Generar token seguro
    const token = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = token;
    user.resetPasswordExpires = Date.now() + 60 * 60 * 1000; // 1 hora
    await user.save();

    // Enlace de recuperación (ajusta la URL a tu frontend)
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:8080'}/reset-password/${token}`;

    // Email
    const mailOptions = {
      to: user.email,
      from: process.env.EMAIL_USER,
      subject: 'Recuperación de contraseña - Soluciones Elite',
      text: `Hola,\n\nRecibiste este correo porque solicitaste restablecer tu contraseña.\n\nHaz clic en el siguiente enlace o pégalo en tu navegador para establecer una nueva contraseña:\n\n${resetUrl}\n\nSi no solicitaste esto, ignora este correo.\n\nSaludos,\nEquipo Soluciones Elite`,
    };
    await transporter.sendMail(mailOptions);
    res.json({ message: 'Si el correo está registrado, se enviará un enlace de recuperación.' });
  } catch (err) {
    res.status(500).json({ error: 'Error al procesar la solicitud.' });
  }
};

// Cambiar la contraseña usando el token
exports.resetPassword = async (req, res) => {
  const { token, password } = req.body;
  if (!token || !password) return res.status(400).json({ error: 'Token y nueva contraseña son obligatorios.' });
  try {
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });
    if (!user) return res.status(400).json({ error: 'Token inválido o expirado.' });
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();
    res.json({ message: 'Contraseña actualizada correctamente.' });
  } catch (err) {
    res.status(500).json({ error: 'Error al actualizar la contraseña.' });
  }
};
// Eliminar usuario por ID
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });
    res.json({ message: 'Usuario eliminado correctamente' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
const User = require('../models/userModel');

exports.createUser = async (req, res) => {
  const { name, email, password, role } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Todos los campos son obligatorios: nombre, correo y contraseña.' });
  }
  try {
    const user = new User({ name, email, password, role });
    await user.save();
    res.status(201).json(user);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.getUsers = async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.loginUser = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Correo y contraseña son obligatorios.' });
  }
  try {
    const user = await User.findOne({ email });
    if (!user || user.password !== password) {
      return res.status(401).json({ error: 'Credenciales incorrectas.' });
    }
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      profilePhoto: user.profilePhoto || '',
      role: user.role || 'usuario',
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { email, ...profileData } = req.body;
    const user = await User.findOneAndUpdate(
      { email },
      { $set: profileData },
      { new: true }
    );
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    console.log('Perfil actualizado en la BD:', user);
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Obtener un usuario por ID
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener usuario' });
  }
};