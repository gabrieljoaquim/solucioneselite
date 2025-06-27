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
import api from "../api/reviewHelpers.js";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/firebase/firebaseConfig"; // ruta correcta a tu config// asegúrate de tener configurado axios como `api`
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
        this.service.takenById !== currentUser._id &&
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

        const docRef = doc(db, "services", this.service.id); // usa `.id`, no `._id`

        await updateDoc(docRef, updatedData);

        // Actualiza Vuex localmente
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
  },

  markWithObservation(index) {
    const currentUser = this.$store.state.currentUser;
    if (!currentUser) return;
    this.services[index].backgroundColor = "#ffcccc"; // rojo claro
    this.services[index].editingDetails = true;
    this.services[index].detailsDraft = this.services[index].details;
    this.$nextTick(() => {
      const inputs = this.$refs.detailsInput;
      if (Array.isArray(inputs)) {
        if (inputs[index]) inputs[index].focus();
      } else if (inputs && typeof inputs.focus === "function") {
        inputs.focus();
      }
    });
  },

  markAsFinalized(index) {
    const currentUser = this.$store.state.currentUser;
    if (!currentUser) return;
    // Log para depuración
    console.log("markAsFinalized PUT:", {
      backgroundColor: "lightblue",
      currentUserId: currentUser._id,
      currentUserRole: currentUser.role,
    });
    api
      .put(`/api/services/${this.services[index]._id}`, {
        backgroundColor: "lightblue",
        currentUserId: currentUser._id,
        currentUserRole: currentUser.role,
      })
      .then(async () => {
        // Refresca la lista tras marcar como terminado
        const refreshed = await api.get("/api/services");
        this.$store.state.services.splice(
          0,
          this.$store.state.services.length,
          ...refreshed.data
        );
      })
      .catch((err) => {
        alert(
          err.response?.data?.error ||
            err.response?.data?.message ||
            "Error al marcar como terminado"
        );
      });
  },
};
</script>

<style scoped>
.service-status-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 10px;
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
