const Message = require('../models/messageModel');
const mongoose = require('mongoose');

// Obtener mensajes entre dos usuarios y marcar como leídos los mensajes recibidos
exports.getMessages = async (req, res) => {
  const { userId, expertId } = req.params;
  try {
    const userObjId = mongoose.Types.ObjectId.isValid(userId) ? new mongoose.Types.ObjectId(userId) : userId;
    const expertObjId = mongoose.Types.ObjectId.isValid(expertId) ? new mongoose.Types.ObjectId(expertId) : expertId;
    const messages = await Message.find({
      $or: [
        { senderId: userObjId, receiverId: expertObjId },
        { senderId: expertObjId, receiverId: userObjId },
      ],
    }).sort({ createdAt: 1 }).lean();
    // Marcar como leídos los mensajes recibidos por el usuario actual
    await Message.updateMany(
      { senderId: expertObjId, receiverId: userObjId, read: false },
      { $set: { read: true } }
    );
    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener mensajes' });
  }
};

// Obtener conversaciones donde el usuario es receptor o remitente (ambos sentidos)
exports.getInbox = async (req, res) => {
  const { userId } = req.params;
  try {
    const userObjId = mongoose.Types.ObjectId.isValid(userId) ? new mongoose.Types.ObjectId(userId) : userId;
    // Buscar todos los mensajes donde el usuario es receptor o remitente
    const messages = await Message.find({
      $or: [
        { receiverId: userObjId },
        { senderId: userObjId },
      ],
    }).sort({ createdAt: -1 }).lean();
    // Agrupar por el otro participante (ignorando mensajes a sí mismo)
    const userMap = new Map();
    for (const msg of messages) {
      if (!msg.senderId || !msg.receiverId) {
        console.error('Mensaje con senderId o receiverId nulo:', msg);
        continue;
      }
      const senderIdStr = msg.senderId.toString();
      const receiverIdStr = msg.receiverId.toString();
      const userIdStr = userObjId.toString();
      // Ignorar mensajes a sí mismo
      if (senderIdStr === userIdStr && receiverIdStr === userIdStr) continue;
      // El otro participante es el que NO es el usuario actual
      let otherId = senderIdStr === userIdStr ? receiverIdStr : senderIdStr;
      // FIX: Solo mostrar conversaciones con usuarios que existen
      const user = await require('../models/userModel').findById(otherId);
      if (!user) continue;
      // Para evitar duplicados, usa siempre el mismo par ordenado
      const key = [userIdStr, otherId].sort().join('-');
      if (!userMap.has(key)) {
        userMap.set(key, { msg, otherId });
      }
    }
    // Obtener datos de usuario para cada participante
    const conversations = await Promise.all(
      Array.from(userMap.values()).map(async ({ msg, otherId }) => {
        try {
          const user = await require('../models/userModel').findById(otherId);
          // Contar mensajes no leídos de este usuario hacia el usuario actual
          const unreadCount = await Message.countDocuments({ senderId: otherId, receiverId: userObjId, read: false });
          return {
            userId: otherId,
            name: user ? user.name : 'Usuario',
            profilePhoto: user ? user.profilePhoto : '',
            lastMessage: msg.text,
            lastSenderId: msg.senderId.toString(),
            unreadCount,
          };
        } catch (e) {
          console.error('Error buscando usuario', otherId, e);
          // Contar mensajes no leídos de este usuario hacia el usuario actual
          const unreadCount = await Message.countDocuments({ senderId: otherId, receiverId: userObjId, read: false });
          return {
            userId: otherId,
            name: 'Usuario',
            profilePhoto: '',
            lastMessage: msg.text,
            lastSenderId: msg.senderId.toString(),
            unreadCount,
          };
        }
      })
    );
    res.json(conversations);
  } catch (err) {
    console.error('Error en getInbox:', err);
    res.status(500).json({ error: 'Error al obtener la bandeja de entrada', details: err.message });
  }
};

// Enviar mensaje
exports.sendMessage = async (req, res) => {
  const { senderId, senderName, receiverId, text } = req.body;
  if (!senderId || !receiverId || !text) {
    return res.status(400).json({ error: 'Faltan datos requeridos' });
  }
  try {
    const senderObjId = mongoose.Types.ObjectId.isValid(senderId) ? new mongoose.Types.ObjectId(senderId) : senderId;
    const receiverObjId = mongoose.Types.ObjectId.isValid(receiverId) ? new mongoose.Types.ObjectId(receiverId) : receiverId;
    const message = new Message({ senderId: senderObjId, senderName, receiverId: receiverObjId, text });
    await message.save();
    res.status(201).json(message);
  } catch (err) {
    res.status(500).json({ error: 'Error al enviar mensaje' });
  }
};
