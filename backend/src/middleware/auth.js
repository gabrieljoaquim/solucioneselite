// Simple JWT auth middleware for Express
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

module.exports = async function auth(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token provided' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    // Attach user object to req
    const user = await User.findById(decoded._id || decoded.userId);
    if (!user) return res.status(401).json({ error: 'Usuario no encontrado' });
    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Token inválido' });
  }
}
