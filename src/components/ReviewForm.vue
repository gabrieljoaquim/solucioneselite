<template>
  <div class="review-form">
    <h3>Dejar una reseña</h3>
    <form @submit.prevent="submitReview">
      <div>
        <label>Calificación:</label>
        <select v-model="stars" required>
          <option v-for="n in 5" :key="n" :value="n">
            {{ n }} estrella{{ n > 1 ? "s" : "" }}
          </option>
        </select>
      </div>
      <div>
        <label>Comentario:</label>
        <textarea v-model="comment" required></textarea>
      </div>
      <div>
        <label>
          <input type="checkbox" v-model="publicName" />
          Mostrar mi nombre públicamente
        </label>
      </div>
      <button type="submit">Enviar reseña</button>
    </form>
    <div v-if="success" class="success-msg">¡Reseña enviada!</div>
    <div v-if="error" class="error-msg">{{ error }}</div>
  </div>
</template>

<script>
import api from "../axios";
export default {
  props: {
    workerId: { type: String, required: true },
    serviceId: { type: String, required: true },
    clientId: { type: String, required: true },
    clientName: { type: String, default: "" },
  },
  data() {
    return {
      stars: 5,
      comment: "",
      publicName: false,
      success: false,
      error: "",
    };
  },
  methods: {
    async submitReview() {
      this.success = false;
      this.error = "";
      try {
        await api.post("/api/reviews", {
          worker: this.workerId,
          client: this.clientId,
          service: this.serviceId,
          comment: this.comment,
          stars: this.stars,
          publicClientName: this.publicName ? this.clientName : "",
        });
        this.success = true;
        this.comment = "";
        this.stars = 5;
        this.publicName = false;
      } catch (e) {
        this.error =
          e.response?.data?.message ||
          e.response?.data?.error ||
          "Error al enviar reseña";
      }
    },
  },
};
</script>

<style scoped>
.review-form {
  border: 1px solid #ccc;
  border-radius: 8px;
  padding: 18px;
  max-width: 400px;
  margin: 0 auto 18px auto;
  background: #fafbfc;
}
.review-form h3 {
  margin-top: 0;
}
.success-msg {
  color: #388e3c;
  margin-top: 10px;
}
.error-msg {
  color: #d32f2f;
  margin-top: 10px;
}
</style>
