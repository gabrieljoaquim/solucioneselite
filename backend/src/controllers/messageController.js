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
