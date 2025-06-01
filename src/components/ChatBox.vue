<template>
  <div class="chat-section">
    <h2 v-if="expert">Chat con {{ expert.name }}</h2>
    <div class="chat-box">
      <div
        v-for="msg in messages"
        :key="msg._id"
        :class="['chat-message', { own: msg.senderId === userId }]"
      >
        <span class="msg-user">{{ msg.senderName }}:</span>
        <span class="msg-text">{{ msg.text }}</span>
        <span class="msg-date">{{ formatDate(msg.createdAt) }}</span>
      </div>
    </div>
    <form class="chat-input" @submit.prevent="sendMessage">
      <input
        v-model="newMessage"
        placeholder="Escribe tu mensaje..."
        autocomplete="off"
      />
      <button type="submit">Enviar</button>
    </form>
  </div>
</template>

<script>
import api from "../axios";

export default {
  name: "ChatBox",
  props: {
    userId: { type: String, required: true },
    userName: { type: String, required: true },
    expert: { type: Object, required: true },
  },
  data() {
    return {
      messages: [],
      newMessage: "",
    };
  },
  watch: {
    expert: {
      immediate: true,
      handler() {
        this.fetchMessages();
      },
    },
  },
  methods: {
    async fetchMessages() {
      if (!this.userId || !this.expert?._id) return;
      try {
        const res = await api.get(
          `/api/messages/${this.userId}/${this.expert._id}`
        );
        this.messages = res.data;
        this.$nextTick(() => {
          this.scrollToBottom();
        });
      } catch (err) {
        this.messages = [];
      }
    },
    async sendMessage() {
      if (!this.newMessage.trim()) return;
      try {
        const payload = {
          senderId: this.userId,
          senderName: this.userName,
          receiverId: this.expert._id,
          text: this.newMessage.trim(),
        };
        await api.post("/api/messages", payload);
        this.newMessage = "";
        await this.fetchMessages();
        this.$nextTick(() => {
          this.scrollToBottom();
        });
      } catch (err) {}
    },
    scrollToBottom() {
      const chatBox = this.$el.querySelector(".chat-box");
      if (chatBox) {
        chatBox.scrollTop = chatBox.scrollHeight;
      }
    },
    formatDate(dateStr) {
      const d = new Date(dateStr);
      return d.toLocaleString();
    },
  },
};
</script>

<style scoped>
.chat-section {
  margin-top: 32px;
}
.chat-box {
  background: #f7f7f7;
  border-radius: 8px;
  padding: 16px;
  max-height: 260px;
  overflow-y: auto;
  margin-bottom: 12px;
}
.chat-message {
  margin-bottom: 8px;
  padding: 6px 10px;
  border-radius: 8px;
  background: #e9e9e9;
  display: flex;
  flex-direction: column;
  font-size: 1em;
  color: #222 !important; /* gris oscuro para todo el texto */
}
.chat-message.own {
  background: var(--color-bright-green);
  color: #222 !important; /* gris oscuro para mensajes propios */
  align-items: flex-end;
}
.msg-user {
  font-weight: 700;
  margin-right: 6px;
  color: #222 !important; /* gris oscuro para el nombre */
}
.msg-text {
  margin: 2px 0;
  color: #222 !important; /* gris oscuro para el mensaje */
}
.chat-message.own .msg-text {
  color: #222 !important; /* gris oscuro para mensaje propio */
}
.msg-date {
  font-size: 0.85em;
  color: #888;
  align-self: flex-end;
}
.chat-input {
  display: flex;
  gap: 8px;
}
.chat-input input {
  flex: 1;
  padding: 8px;
  border-radius: 6px;
  border: 1px solid #ccc;
}
.chat-input button {
  background: #117e2c; /* Verde fuerte, visible */
  color: #fff;
  border: none;
  border-radius: 6px;
  padding: 8px 18px;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.2s;
}
.chat-input button:hover {
  background: #0b661c; /* Verde más oscuro al pasar el mouse */
}
</style>
