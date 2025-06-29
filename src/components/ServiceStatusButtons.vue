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
    currentUser: {
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
        this.service.takenById !== currentUser.uid &&
        currentUser.role !== "admin"
      ) {
        alert("Este servicio ya fue tomado por otro trabajador.");
        return;
      }

      try {
        const updatedData = {
          backgroundColor: "lightgreen",
          takenBy: currentUser.name || currentUser.email || currentUser.uid,
          takenById: currentUser.uid,
          takenByEmail: currentUser.email,
        };

        const docRef = doc(db, "services", this.service.id);
        await updateDoc(docRef, updatedData);

        const index = this.$store.state.services.findIndex(
          (s) => s.id === this.service.id
        );
        if (index !== -1) {
          this.$store.commit("updateService", {
            index,
            data: updatedData,
          });
        }
      } catch (err) {
        console.error("Error al tomar el servicio:", err);
        alert("Error al tomar el servicio");
      }
    },

    async markWithObservation() {
      const currentUser = this.$store.state.currentUser;
      if (!currentUser) return;

      try {
        const updatedData = {
          backgroundColor: "#ffcccc",
        };

        const docRef = doc(db, "services", this.service.id);
        await updateDoc(docRef, updatedData);

        const index = this.$store.state.services.findIndex(
          (s) => s.id === this.service.id
        );
        if (index !== -1) {
          this.$store.commit("updateService", {
            index,
            data: updatedData,
          });
        }
      } catch (err) {
        console.error("Error al marcar con observación:", err);
        alert("Error al marcar con observación");
      }
    },

    async markAsFinalized() {
      const currentUser = this.$store.state.currentUser;
      if (!currentUser) return;

      try {
        const updatedData = {
          backgroundColor: "lightblue",
        };

        const docRef = doc(db, "services", this.service.id);
        await updateDoc(docRef, updatedData);

        const index = this.$store.state.services.findIndex(
          (s) => s.id === this.service.id
        );
        if (index !== -1) {
          this.$store.commit("updateService", {
            index,
            data: updatedData,
          });
        }
      } catch (err) {
        console.error("Error al marcar como terminado:", err);
        alert("Error al marcar como terminado");
      }
    },
  },
};
</script>

<style scoped>
.service-status-buttons {
  width: 550px;
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 10px;
}
.service-status-buttons button {
  flex: 1 1 120px;
  font-size: 14px;
  border-radius: 4px;
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
</style>
