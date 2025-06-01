<template>
  <div>
    <button
      v-if="canShow"
      class="btn-cerrar-cliente"
      @click="cerrarServicioCliente"
      :disabled="loading"
    >
      {{ loading ? "Cerrando..." : "Cerrar Servicio (Cliente)" }}
    </button>
    <span v-if="error" style="color: red">{{ error }}</span>
  </div>
</template>

<script>
import axios from "axios";
export default {
  props: {
    service: { type: Object, required: true },
    currentUser: { type: Object, required: true },
  },
  data() {
    return {
      loading: false,
      error: "",
    };
  },
  computed: {
    canShow() {
      // Solo el registrante (o admin) puede cerrar, solo si el trabajador ya lo terminó y el cliente no ha cerrado
      return (
        this.currentUser &&
        (this.service.registrante ===
          (this.currentUser.name || this.currentUser.email) ||
          this.currentUser.role === "administrador") &&
        this.service.backgroundColor === "lightblue" &&
        !this.service.clienteCerro
      );
    },
  },
  methods: {
    async cerrarServicioCliente() {
      this.loading = true;
      this.error = "";
      try {
        const res = await axios.post(
          `/api/services/${this.service._id}/close-by-client`,
          {
            currentUserId: this.currentUser._id,
            currentUserRole: this.currentUser.role,
            currentUserName: this.currentUser.name || this.currentUser.email,
          }
        );
        this.$emit("cerrado", res.data);
      } catch (e) {
        this.error = e.response?.data?.error || "Error al cerrar el servicio";
      } finally {
        this.loading = false;
      }
    },
  },
};
</script>

<style scoped>
.btn-cerrar-cliente {
  background: #0288d1;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  margin-top: 10px;
  cursor: pointer;
}
.btn-cerrar-cliente:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
