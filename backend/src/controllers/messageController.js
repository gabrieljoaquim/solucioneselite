const Message = require('../models/messageModel');

// Obtener mensajes entre dos usuarios
exports.getMessages = async (req, res) => {
  const { userId, expertId } = req.params;
  try {
    const messages = await Message.find({
      $or: [
        { senderId: userId, receiverId: expertId },
        { senderId: expertId, receiverId: userId },
      ],
    }).sort({ createdAt: 1 });
    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener mensajes' });
  }
};

// Obtener conversaciones donde el usuario es receptor o remitente (ambos sentidos)
exports.getInbox = async (req, res) => {
  const { userId } = req.params;
  try {
    // Buscar todos los mensajes donde el usuario es receptor o remitente
    const messages = await Message.find({
      $or: [
        { receiverId: userId },
        { senderId: userId },
      ],
    }).sort({ createdAt: -1 });
    // Agrupar por el otro participante (ignorando mensajes a sí mismo)
    const userMap = new Map();
    for (const msg of messages) {
      const senderIdStr = msg.senderId.toString();
      const receiverIdStr = msg.receiverId.toString();
      const userIdStr = userId.toString();
      // Ignorar mensajes a sí mismo
      if (senderIdStr === userIdStr && receiverIdStr === userIdStr) continue;
      // El otro participante es el que NO es el usuario actual
      let otherId = senderIdStr === userIdStr ? receiverIdStr : senderIdStr;
      // Para evitar duplicados, usa siempre el mismo par ordenado
      const key = [userIdStr, otherId].sort().join('-');
      if (!userMap.has(key)) {
        userMap.set(key, { msg, otherId });
      }
    }
    // Obtener datos de usuario para cada participante
    const conversations = await Promise.all(
      Array.from(userMap.values()).map(async ({ msg, otherId }) => {
        const user = await require('../models/userModel').findById(otherId);
        return {
          userId: otherId,
          name: user ? user.name : 'Usuario',
          profilePhoto: user ? user.profilePhoto : '',
          lastMessage: msg.text,
          lastSenderId: msg.senderId.toString(),
        };
      })
    );
    res.json(conversations);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener la bandeja de entrada' });
  }
};

// Enviar mensaje
exports.sendMessage = async (req, res) => {
  const { senderId, senderName, receiverId, text } = req.body;
  if (!senderId || !receiverId || !text) {
    return res.status(400).json({ error: 'Faltan datos requeridos' });
  }
  try {
    const message = new Message({ senderId, senderName, receiverId, text });
    await message.save();
    res.status(201).json(message);
  } catch (err) {
    res.status(500).json({ error: 'Error al enviar mensaje' });
  }
};
