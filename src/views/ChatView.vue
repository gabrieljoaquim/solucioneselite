<template>
  <div class="chat-view">
    <div class="sidebar">
      <div class="sidebar-header">Chats</div>
      <div class="conversation-list">
        <div
          v-for="conv in conversations"
          :key="conv.userId"
          class="conversation-item"
          :class="{
            selected: selectedUser && selectedUser.userId === conv.userId,
          }"
          @click="selectConversation(conv)"
        >
          <img
            :src="conv.profilePhoto || '/default-user-photo.jpg'"
            class="user-photo"
          />
          <div>
            <div class="user-name">{{ conv.name }}</div>
            <div class="last-message">{{ conv.lastMessage }}</div>
          </div>
        </div>
      </div>
    </div>
    <div class="chat-panel" v-if="selectedUser">
      <div class="chat-messages-container">
        <ChatBox
          :user-id="userId"
          :user-name="userName"
          :expert="{
            _id: selectedUser.userId,
            name: selectedUser.name,
            profilePhoto: selectedUser.profilePhoto,
          }"
          key="selectedUser.userId"
        />
      </div>
      <form class="chat-input-bar" @submit.prevent="sendMessage">
        <input
          v-model="newMessage"
          placeholder="Escribe tu mensaje..."
          class="chat-input-field"
          autocomplete="off"
        />
        <button type="submit" class="chat-send-btn">Enviar</button>
      </form>
    </div>
    <div class="chat-panel empty" v-else>
      <p>Selecciona un chat para comenzar a conversar.</p>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import { mapState } from "vuex";
import ChatBox from "../components/ChatBox.vue";

export default {
  name: "ChatView",
  components: { ChatBox },
  data() {
    return {
      conversations: [],
      selectedUser: null,
      intervalId: null,
      newMessage: "",
    };
  },
  computed: {
    ...mapState({ currentUser: (state) => state.currentUser }),
    userId() {
      return this.currentUser?._id;
    },
    userName() {
      return this.currentUser?.name;
    },
  },
  async mounted() {
    await this.fetchConversations();
    // Si viene un userId en la ruta, selecciona ese chat y lo pone primero
    if (this.$route.params.userId) {
      this.selectById(this.$route.params.userId);
      this.moveSelectedToTop();
    }
    this.intervalId = setInterval(this.fetchConversations, 5000);
  },
  beforeUnmount() {
    if (this.intervalId) clearInterval(this.intervalId);
  },
  methods: {
    async fetchConversations() {
      if (!this.userId) return;
      try {
        const res = await axios.get(
          `http://localhost:5000/api/messages/inbox/${this.userId}`
        );
        this.conversations = res.data;
        // Si hay userId en la ruta, selecciona y mueve al tope
        if (this.$route.params.userId) {
          this.selectById(this.$route.params.userId);
          this.moveSelectedToTop();
        } else if (!this.selectedUser && res.data.length > 0) {
          this.selectedUser = res.data[0];
        }
      } catch (err) {
        this.conversations = [];
      }
    },
    selectConversation(conv) {
      this.selectedUser = conv;
      this.moveSelectedToTop();
    },
    selectById(id) {
      const found = this.conversations.find((c) => c.userId === id);
      if (found) this.selectedUser = found;
      else this.selectedUser = null;
    },
    moveSelectedToTop() {
      if (!this.selectedUser) return;
      const idx = this.conversations.findIndex(
        (c) => c.userId === this.selectedUser.userId
      );
      if (idx > 0) {
        const [item] = this.conversations.splice(idx, 1);
        this.conversations.unshift(item);
      }
    },
    async sendMessage() {
      if (!this.newMessage.trim() || !this.selectedUser) return;
      try {
        const payload = {
          senderId: this.userId,
          senderName: this.userName,
          receiverId: this.selectedUser.userId,
          text: this.newMessage.trim(),
        };
        await axios.post("http://localhost:5000/api/messages", payload);
        this.newMessage = "";
        // Forzar actualización de mensajes
        if (this.$refs.chatBox && this.$refs.chatBox.fetchMessages) {
          this.$refs.chatBox.fetchMessages();
        }
      } catch (err) {}
    },
  },
  watch: {
    "$route.params.userId"(val) {
      if (val) {
        this.selectById(val);
        this.moveSelectedToTop();
      }
    },
  },
};
</script>

<style scoped>
.chat-view {
  display: flex;
  height: 80vh;
  max-width: 1100px;
  margin: 32px auto;
  background: var(--color-main-white);
  border-radius: 16px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  overflow: hidden;
}
.sidebar {
  width: 320px;
  background: #f7f7f7;
  border-right: 1px solid #e0e0e0;
  display: flex;
  flex-direction: column;
}
.sidebar-header {
  font-weight: bold;
  font-size: 1.2em;
  padding: 18px 24px;
  border-bottom: 1px solid #e0e0e0;
  background: #fff;
}
.conversation-list {
  flex: 1;
  overflow-y: auto;
  padding: 12px 0;
}
.conversation-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 12px 18px;
  border-radius: 8px;
  background: #f7f7f7;
  cursor: pointer;
  transition: background 0.2s;
  margin-bottom: 4px;
}
.conversation-item.selected {
  background: var(--color-bright-green);
  color: #fff;
}
.user-photo {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid var(--color-bright-green);
}
.user-name {
  font-weight: 700;
  font-size: 1.1em;
  color: #222;
}
.last-message {
  color: #666;
  font-size: 0.95em;
}
.chat-panel {
  flex: 1;
  padding: 32px;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  min-width: 0;
}
.chat-panel.empty {
  display: flex;
  align-items: center;
  justify-content: center;
  color: #888;
  font-size: 1.1em;
}
.chat-messages-container {
  flex: 1;
  min-height: 0;
  margin-bottom: 18px;
}
.chat-input-bar {
  display: flex;
  gap: 10px;
  align-items: center;
  margin-top: 8px;
}
.chat-input-field {
  flex: 1;
  padding: 10px;
  border-radius: 8px;
  border: 1px solid #ccc;
  font-size: 1em;
}
.chat-send-btn {
  background: var(--color-electric-blue);
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 10px 24px;
  font-weight: 700;
  font-size: 1em;
  cursor: pointer;
  transition: background 0.2s;
}
.chat-send-btn:hover {
  background: var(--color-bright-green);
}
</style>
