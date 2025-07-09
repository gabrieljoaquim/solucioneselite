<template>
  <div class="service-status-buttons">
    <button
      class="btn-tomar"
      @click="markAsTaken"
      :disabled="!!service.takenById"
    >
      Tomar
    </button>
    <button
      class="btn-observacion"
      @click="markWithObservation"
      :disabled="!canEdit"
    >
      Observación
    </button>
    <button class="btn-terminado" @click="markAsFinalized" :disabled="!canEdit">
      Terminado
    </button>
  </div>
</template>

<script>
import api from "@/api";

export default {
  name: "ServiceStatusButtons",
  props: {
    service: {
      type: Object,
      required: true,
    },
    canEdit: {
      type: Boolean,
      default: false,
    },
  },
  methods: {
    async markAsTaken() {
      const currentUser = this.$store.state.currentUser;
      if (!currentUser) {
        alert("Debes iniciar sesión para tomar un servicio.");
        return;
      }

      if (
        this.service.takenById &&
        this.service.takenById !== currentUser._id &&
        currentUser.role !== "administrador"
      ) {
        alert("Este servicio ya fue tomado por otro trabajador.");
        return;
      }

      try {
        const updatedData = {
          backgroundColor: "lightgreen",
          takenBy: currentUser.name || currentUser.email,
          takenById: currentUser._id,
          takenByEmail: currentUser.email,
          status: "tomado",
          takenAt: new Date().toISOString(),
          currentUserId: currentUser._id,
          currentUserRole: currentUser.role,
        };

        const response = await api.put(
          `/services/${this.service._id}`,
          updatedData
        );

        // Actualizar el servicio en el store
        const index = this.$store.state.services.findIndex(
          (s) => s._id === this.service._id
        );
        if (index !== -1) {
          this.$store.commit("updateService", {
            index,
            data: response.data,
          });
        }

        // Emitir evento para notificar al componente padre
        this.$emit("mark-taken", response.data);
      } catch (err) {
        console.error("Error al tomar el servicio:", err);
        alert(
          "Error al tomar el servicio: " +
            (err.response?.data?.error || err.message)
        );
      }
    },

    async markWithObservation() {
      const currentUser = this.$store.state.currentUser;
      if (!currentUser) {
        alert("Debes iniciar sesión.");
        return;
      }

      // Pedir la observación al usuario
      const observacion = prompt("Ingresa la observación:");
      if (!observacion || observacion.trim() === "") {
        alert("Debes ingresar una observación.");
        return;
      }

      try {
        const updatedData = {
          backgroundColor: "#ffcccc",
          status: "con_observacion",
          observations: observacion.trim(),
          observationAt: new Date().toISOString(),
          currentUserId: currentUser._id,
          currentUserRole: currentUser.role,
        };

        const response = await api.put(
          `/services/${this.service._id}`,
          updatedData
        );

        // Actualizar el servicio en el store
        const index = this.$store.state.services.findIndex(
          (s) => s._id === this.service._id
        );
        if (index !== -1) {
          this.$store.commit("updateService", {
            index,
            data: response.data,
          });
        }

        // Emitir evento para notificar al componente padre
        this.$emit("mark-observation", response.data);
      } catch (err) {
        console.error("Error al marcar con observación:", err);
        alert(
          "Error al marcar con observación: " +
            (err.response?.data?.error || err.message)
        );
      }
    },

    async markAsFinalized() {
      const currentUser = this.$store.state.currentUser;
      if (!currentUser) {
        alert("Debes iniciar sesión.");
        return;
      }

      if (!confirm("¿Estás seguro de marcar este servicio como terminado?")) {
        return;
      }

      try {
        const updatedData = {
          backgroundColor: "lightblue",
          status: "terminado",
          finalizedAt: new Date().toISOString(),
          finalizedBy: currentUser.name || currentUser.email,
          finalizedById: currentUser._id,
          currentUserId: currentUser._id,
          currentUserRole: currentUser.role,
        };

        const response = await api.put(
          `/services/${this.service._id}`,
          updatedData
        );

        // Actualizar el servicio en el store
        const index = this.$store.state.services.findIndex(
          (s) => s._id === this.service._id
        );
        if (index !== -1) {
          this.$store.commit("updateService", {
            index,
            data: response.data,
          });
        }

        // Emitir evento para notificar al componente padre
        this.$emit("mark-finalized", response.data);
      } catch (err) {
        console.error("Error al marcar como terminado:", err);
        alert(
          "Error al marcar como terminado: " +
            (err.response?.data?.error || err.message)
        );
      }
    },
  },
};
</script>

<style scoped>
.service-status-buttons {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 8px;
  margin-top: 10px;
  width: 100%;
  max-width: 550px;
  padding: 0 10px;
  box-sizing: border-box;
}

.service-status-buttons button {
  flex: 1 1 calc(33% - 16px); /* 3 botones por fila con espacio entre ellos */
  min-width: 100px;
  font-size: 14px;
  border-radius: 4px;
  padding: 8px;
  transition: background-color 0.3s ease;
}

.btn-tomar {
  background-color: #4caf50;
  color: white;
  border: none;
  padding: 6px 12px;
  cursor: pointer;
}
.btn-observacion {
  background-color: #f44336;
  color: white;
  border: none;
  padding: 6px 12px;
  cursor: pointer;
}
.btn-terminado {
  background-color: #2196f3;
  color: white;
  border: none;
  padding: 6px 12px;
  cursor: pointer;
}
button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
button:hover:not(:disabled) {
  opacity: 0.9;
}
</style>
