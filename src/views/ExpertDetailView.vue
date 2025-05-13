<template>
  <div class="expert-detail-view" v-if="expert">
    <div class="expert-header">
      <img
        :src="expert.profilePhoto || '/default-user-photo.jpg'"
        alt="Foto de perfil"
        class="expert-photo"
      />
      <div class="expert-info">
        <h1>{{ expert.name }}</h1>
        <p><strong>Especialidad:</strong> {{ expert.specialty?.join(", ") }}</p>
        <p><strong>Zona:</strong> {{ expert.zone }}</p>
        <p>
          <strong>Calificación:</strong>
          {{ expert.rating ? expert.rating.toFixed(1) : "Sin calificación" }}
        </p>
        <p v-if="expert.description">
          <strong>Descripción:</strong> {{ expert.description }}
        </p>
        <p v-if="expert.phone"><strong>Teléfono:</strong> {{ expert.phone }}</p>
        <p v-if="expert.address">
          <strong>Dirección:</strong> {{ expert.address }}
        </p>
      </div>
    </div>
    <div v-if="!userId" class="chat-login-warning">
      <p>Debes iniciar sesión para contactar al experto.</p>
    </div>
    <div v-else class="expert-actions">
      <button
        class="chat-expert-btn"
        @click="
          $router.push({ name: 'chat-user', params: { userId: expert._id } })
        "
      >
        Chatear con este experto
      </button>
    </div>
  </div>
  <div v-else class="loading">Cargando experto...</div>
</template>

<script>
import axios from "axios";
import { mapState } from "vuex";

export default {
  name: "ExpertDetailView",
  data() {
    return {
      expert: null,
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
  async created() {
    const expertId = this.$route.params.id;
    try {
      const res = await axios.get(
        `http://localhost:5000/api/users/${expertId}`
      );
      this.expert = res.data;
    } catch (err) {
      this.expert = null;
    }
  },
};
</script>

<style scoped>
.expert-detail-view {
  max-width: 700px;
  margin: 32px auto;
  background: var(--color-main-white);
  border-radius: 16px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  padding: 32px;
}
.expert-header {
  display: flex;
  gap: 32px;
  align-items: flex-start;
  margin-bottom: 32px;
}
.expert-photo {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid var(--color-bright-green);
}
.expert-info h1 {
  margin: 0 0 8px 0;
  font-size: 1.6em;
  color: var(--color-dark-gray);
  font-weight: 800;
}
.expert-info p {
  margin: 4px 0;
  color: var(--color-neutral-gray);
}
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
}
.chat-message.own {
  background: var(--color-bright-green);
  color: #fff;
  align-items: flex-end;
}
.msg-user {
  font-weight: 700;
  margin-right: 6px;
}
.msg-text {
  margin: 2px 0;
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
  background: var(--color-electric-blue);
  color: #fff;
  border: none;
  border-radius: 6px;
  padding: 8px 18px;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.2s;
}
.chat-input button:hover {
  background: var(--color-bright-green);
}
.expert-actions {
  background: #034803;
  color: black;
  margin-top: 24px;
  display: flex;
  justify-content: center;
}
.chat-expert-btn {
  background: var(--color-electric-blue);
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 10px 28px;
  font-weight: 700;
  font-size: 1.1em;
  cursor: pointer;
  transition: background 0.2s;
}
.chat-expert-btn:hover {
  background: var(--color-bright-green);
}
.loading {
  text-align: center;
  margin-top: 64px;
  color: var(--color-neutral-gray);
}
</style>
