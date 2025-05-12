const User = require('../models/userModel');

exports.createUser = async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Todos los campos son obligatorios: nombre, correo y contraseña.' });
  }
  try {
    const user = new User({ name, email, password });
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
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};