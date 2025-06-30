<template>
  <div>
    <span
      v-if="workerName"
      class="taken-by"
      @click="openModal"
      style="cursor: pointer; text-decoration: underline"
    >
      Tomado por:
      <span
        :class="{
          'yo-activo': currentUser && workerId === currentUser._id,
        }"
      >
        {{ workerName }}
      </span>
    </span>
    <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
      <div class="modal-content">
        <h3>Calificar trabajador</h3>
        <div class="stars">
          <span
            v-for="star in 5"
            :key="star"
            class="star"
            :class="{ filled: star <= rating }"
            @click="setRating(star)"
          >
            ★
          </span>
        </div>
        <button @click="submitRating" :disabled="submitting">
          <span v-if="submitting" class="loader"></span>
          Enviar calificación
        </button>
        <button @click="closeModal">Cancelar</button>
      </div>
    </div>
  </div>
</template>

<script>
import { doc, updateDoc, arrayUnion, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/firebase/firebaseConfig";

export default {
  name: "WorkerRating",
  props: {
    workerName: String,
    workerId: String,
    currentUser: Object,
    serviceId: String,
  },
  data() {
    return {
      showModal: false,
      rating: 0,
      submitting: false,
    };
  },
  methods: {
    openModal() {
      this.showModal = true;
    },
    closeModal() {
      this.showModal = false;
    },
    setRating(star) {
      this.rating = star;
    },
    async submitRating() {
      if (!this.rating || !this.workerId) return;
      this.submitting = true;
      try {
        const workerRef = doc(db, "users", this.workerId);
        const workerSnap = await getDoc(workerRef);
        let ratings = [];
        if (workerSnap.exists() && Array.isArray(workerSnap.data().ratings)) {
          ratings = workerSnap
            .data()
            .ratings.filter((r) => r && typeof r.rating === "number");
        }
        // Agregar la nueva calificación
        ratings.push({
          rating: Number(this.rating),
          by: this.currentUser?._id || null,
          serviceId: this.serviceId || null,
          date: new Date().toISOString(),
        });
        // Filtrar posibles valores undefined/null
        ratings = ratings.filter((r) => r && typeof r.rating === "number");
        // Calcular promedio
        const avgRating =
          ratings.length > 0
            ? ratings.reduce((acc, r) => acc + (r.rating || 0), 0) /
              ratings.length
            : Number(this.rating);
        // Usar setDoc con merge para evitar error de campos indefinidos
        await setDoc(
          workerRef,
          {
            ratings: ratings,
            avgRating: avgRating,
          },
          { merge: true }
        );
        this.$emit("rated", {
          workerId: this.workerId,
          rating: this.rating,
          serviceId: this.serviceId,
        });
        this.closeModal();
      } catch (e) {
        alert("Error al guardar la calificación: " + e.message);
      } finally {
        this.submitting = false;
      }
    },
  },
};
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}
.modal-content {
  background: #fff;
  padding: 24px 32px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  min-width: 300px;
  text-align: center;
}
.stars {
  font-size: 2em;
  margin: 16px 0;
}
.star {
  cursor: pointer;
  color: #ccc;
  transition: color 0.2s;
}
.star.filled {
  color: #ffd700;
}
button {
  margin: 8px 6px 0 6px;
  padding: 6px 16px;
  border: none;
  border-radius: 4px;
  background: #2196f3;
  color: #fff;
  cursor: pointer;
}
button:hover {
  background: #1976d2;
}
.loader {
  border: 2px solid #f3f3f3;
  border-top: 2px solid #3498db;
  border-radius: 50%;
  width: 16px;
  height: 16px;
  animation: spin 0.8s linear infinite;
}
@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>
