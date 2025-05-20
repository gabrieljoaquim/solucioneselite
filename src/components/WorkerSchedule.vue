<template>
  <div class="worker-schedule">
    <h3>Agenda y Disponibilidad</h3>
    <form @submit.prevent="saveAvailability">
      <div v-for="(slot, i) in availableSlots" :key="i" class="slot-row">
        <input type="date" v-model="slot.date" required />
        <input type="time" v-model="slot.start" required />
        <input type="time" v-model="slot.end" required />
        <button type="button" @click="removeSlot(i)">Eliminar</button>
      </div>
      <button type="button" @click="addSlot">Agregar horario</button>
      <button type="submit">Guardar disponibilidad</button>
    </form>
    <div v-if="success" class="success-msg">¡Disponibilidad guardada!</div>
    <div v-if="error" class="error-msg">{{ error }}</div>
  </div>
</template>

<script>
import axios from "axios";
export default {
  props: {
    workerId: { type: String, required: true },
  },
  data() {
    return {
      availableSlots: [],
      success: false,
      error: "",
    };
  },
  methods: {
    addSlot() {
      this.availableSlots.push({ date: "", start: "", end: "" });
    },
    removeSlot(i) {
      this.availableSlots.splice(i, 1);
    },
    async saveAvailability() {
      this.success = false;
      this.error = "";
      try {
        await axios.post("http://localhost:5000/api/schedule/availability", {
          worker: this.workerId,
          availableSlots: this.availableSlots,
        });
        this.success = true;
      } catch (e) {
        this.error =
          e.response?.data?.error || "Error al guardar disponibilidad";
      }
    },
  },
};
</script>

<style scoped>
.worker-schedule {
  border: 1px solid #ccc;
  border-radius: 8px;
  padding: 18px;
  max-width: 500px;
  margin: 0 auto 18px auto;
  background: #fafbfc;
}
.slot-row {
  display: flex;
  gap: 8px;
  margin-bottom: 8px;
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
