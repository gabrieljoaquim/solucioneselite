<template>
  <div v-if="isAdmin" class="admin-control">
    <button
      class="btn-liberar"
      @click="liberarServicio"
      :disabled="!service.takenById"
    >
      Liberar servicio
    </button>
  </div>
</template>

<script>
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/firebase/firebaseConfig";

export default {
  name: "AdminServiceControl",
  props: {
    service: {
      type: Object,
      required: true,
    },
  },
  computed: {
    currentUser() {
      return this.$store.state.currentUser;
    },
    isAdmin() {
      return this.currentUser && this.currentUser.role === "admin";
    },
  },
  methods: {
    async liberarServicio() {
      if (!this.service.id) return;

      try {
        const updates = {
          takenBy: null,
          takenById: null,
          takenByEmail: null,
          backgroundColor: "white",
        };

        const docRef = doc(db, "services", this.service.id);
        await updateDoc(docRef, updates);

        // Actualiza localmente el Vuex
        const index = this.$store.state.services.findIndex(
          (s) => s.id === this.service.id
        );
        if (index !== -1) {
          this.$store.commit("updateService", { index, data: updates });
        }

        alert("Servicio liberado correctamente");
      } catch (err) {
        console.error("Error al liberar el servicio:", err);
        alert("Error al liberar el servicio");
      }
    },
  },
};
</script>

<style scoped>
.btn-liberar {
  background-color: orange;
  color: white;
  border: none;
  padding: 6px 12px;
  margin-top: 5px;
  cursor: pointer;
}
</style>
