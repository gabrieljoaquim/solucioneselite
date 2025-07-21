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
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/firebase/firebaseConfig";

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
      if (!currentUser) return alert("Debes iniciar sesión.");

      if (
        this.service.takenById &&
        this.service.takenById !== currentUser.uid
      ) {
        return alert("Este servicio ya fue tomado por otro trabajador.");
      }

      const updatedData = {
        backgroundColor: "lightgreen",
        takenBy: currentUser.name || currentUser.email || currentUser.uid,
        takenById: currentUser.uid,
        takenByEmail: currentUser.email,
        status: "tomado",
        takenAt: new Date().toISOString(),
      };

      try {
        await updateDoc(doc(db, "services", this.service.id), updatedData);

        const index = this.$store.state.services.findIndex(
          (s) => s.id === this.service.id
        );
        if (index !== -1) {
          this.$store.commit("updateService", {
            index,
            data: updatedData,
          });
        }

        this.$emit("mark-taken", updatedData);
      } catch (err) {
        console.error(err);
        alert("Error al tomar el servicio: " + err.message);
      }
    },

    async markWithObservation() {
      const currentUser = this.$store.state.currentUser;
      if (!currentUser) return alert("Debes iniciar sesión.");

      const observacion = prompt("Ingresa la observación:");
      if (!observacion || !observacion.trim()) {
        return alert("Debes ingresar una observación válida.");
      }

      const updatedData = {
        backgroundColor: "#ffcccc",
        status: "con_observacion",
        observations: observacion.trim(),
        observationAt: new Date().toISOString(),
      };

      try {
        await updateDoc(doc(db, "services", this.service.id), updatedData);

        const index = this.$store.state.services.findIndex(
          (s) => s.id === this.service.id
        );
        if (index !== -1) {
          this.$store.commit("updateService", {
            index,
            data: updatedData,
          });
        }

        this.$emit("mark-observation", updatedData);
      } catch (err) {
        console.error(err);
        alert("Error al marcar con observación: " + err.message);
      }
    },

    async markAsFinalized() {
      const currentUser = this.$store.state.currentUser;
      if (!currentUser) return alert("Debes iniciar sesión.");
      if (!confirm("¿Estás seguro de marcar este servicio como terminado?"))
        return;

      const updatedData = {
        backgroundColor: "lightblue",
        status: "terminado",
        finalizedAt: new Date().toISOString(),
        finalizedBy: currentUser.name || currentUser.email,
        finalizedById: currentUser.uid,
      };

      try {
        await updateDoc(doc(db, "services", this.service.id), updatedData);

        const index = this.$store.state.services.findIndex(
          (s) => s.id === this.service.id
        );
        if (index !== -1) {
          this.$store.commit("updateService", {
            index,
            data: updatedData,
          });
        }

        this.$emit("mark-finalized", updatedData);
      } catch (err) {
        console.error(err);
        alert("Error al marcar como terminado: " + err.message);
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
  flex: 1 1 calc(33% - 16px);
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
}

.btn-observacion {
  background-color: #f44336;
  color: white;
  border: none;
}

.btn-terminado {
  background-color: #2196f3;
  color: white;
  border: none;
}

button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

button:hover:not(:disabled) {
  opacity: 0.9;
}
</style>
