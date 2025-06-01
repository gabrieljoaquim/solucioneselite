<template>
  <div class="inbox-view">
    <h1>Bandeja de Entrada</h1>
    <div v-if="conversations.length === 0" class="no-messages">
      No tienes mensajes nuevos.
    </div>
    <div v-else class="conversation-list">
      <div
        v-for="conv in conversations"
        :key="conv.userId"
        class="conversation-item"
        @click="selectConversation(conv)"
        :class="{
          selected: selectedUser && selectedUser.userId === conv.userId,
        }"
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
    <div v-if="selectedUser" class="chat-panel">
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
  </div>
</template>

<script>
import api from "../axios";
import { mapState } from "vuex";
import ChatBox from "../components/ChatBox.vue";

export default {
  name: "InboxView",
  components: { ChatBox },
  data() {
    return {
      conversations: [],
      selectedUser: null,
      unreadCount: 0,
      intervalId: null,
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
        // Lógica de mensajes no leídos: cuenta mensajes donde el último mensaje no es tuyo
        let unread = 0;
        for (const conv of res.data) {
          // Si el último mensaje no es tuyo, lo consideramos no leído
          if (conv.lastSenderId && conv.lastSenderId !== this.userId) unread++;
        }
        this.unreadCount = unread;
        this.$emit("update-unread", unread);
      } catch (err) {
        this.conversations = [];
        this.unreadCount = 0;
        this.$emit("update-unread", 0);
      }
    },
    selectConversation(conv) {
      this.selectedUser = conv;
      // Al abrir la conversación, la marcamos como leída
      if (this.unreadCount > 0) {
        this.unreadCount--;
        this.$emit("update-unread", this.unreadCount);
      }
    },
  },
};
</script>

<style scoped>
.inbox-view {
  max-width: 900px;
  margin: 32px auto;
  background: var(--color-main-white);
  border-radius: 16px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  padding: 32px;
  min-height: 400px;
}
.conversation-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 24px;
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
.no-messages {
  color: #888;
  text-align: center;
  margin: 32px 0;
}
.chat-panel {
  margin-top: 32px;
}
</style>
