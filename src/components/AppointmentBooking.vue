<template>
  <div class="appointment-booking">
    <h3>Agendar cita</h3>
    <form @submit.prevent="bookAppointment">
      <div>
        <label>Fecha:</label>
        <input type="date" v-model="date" required />
      </div>
      <div>
        <label>Hora inicio:</label>
        <input type="time" v-model="start" required />
      </div>
      <div>
        <label>Hora fin:</label>
        <input type="time" v-model="end" required />
      </div>
      <button type="submit">Agendar</button>
    </form>
    <div v-if="success" class="success-msg">¡Cita agendada!</div>
    <div v-if="error" class="error-msg">{{ error }}</div>
  </div>
</template>

<script>
import axios from "axios";
export default {
  props: {
    workerId: { type: String, required: true },
    clientId: { type: String, required: true },
  },
  data() {
    return {
      date: "",
      start: "",
      end: "",
      success: false,
      error: "",
    };
  },
  methods: {
    async bookAppointment() {
      this.success = false;
      this.error = "";
      try {
        await axios.post("http://localhost:5000/api/schedule/book", {
          worker: this.workerId,
          client: this.clientId,
          date: this.date,
          start: this.start,
          end: this.end,
        });
        this.success = true;
        this.date = "";
        this.start = "";
        this.end = "";
      } catch (e) {
        this.error = e.response?.data?.error || "Error al agendar cita";
      }
    },
  },
};
</script>

<style scoped>
.appointment-booking {
  border: 1px solid #ccc;
  border-radius: 8px;
  padding: 18px;
  max-width: 400px;
  margin: 0 auto 18px auto;
  background: #fafbfc;
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
