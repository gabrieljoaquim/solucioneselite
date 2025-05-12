<template>
  <div class="experts-view">
    <h1>Encuentra un Experto</h1>
    <div class="experts-list">
      <div v-for="expert in experts" :key="expert._id" class="expert-card">
        <img
          :src="expert.profilePhoto || '/default-user-photo.jpg'"
          alt="Foto de perfil"
          class="expert-photo"
        />
        <div class="expert-info">
          <h2>{{ expert.name }}</h2>
          <p class="profession">
            {{ expert.specialty?.join(", ") || "Profesión no especificada" }}
          </p>
          <p class="zone">Zona: {{ expert.zone || "No especificada" }}</p>
          <div class="rating">
            <span
              v-for="n in 5"
              :key="n"
              class="star"
              :class="{ filled: n <= (expert.rating || 0) }"
              >★</span
            >
            <span class="rating-value">{{
              expert.rating ? expert.rating.toFixed(1) : "Sin calificación"
            }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";

export default {
  name: "ListExpertsView",
  data() {
    return {
      experts: [],
    };
  },
  async mounted() {
    try {
      const res = await axios.get("http://localhost:5000/api/users");
      // Filtrar solo usuarios con profesión/zona (puedes ajustar la lógica)
      this.experts = res.data.filter((u) => u.specialty && u.specialty.length);
    } catch (err) {
      this.experts = [];
    }
  },
};
</script>

<style scoped>
.experts-view {
  padding: 32px 0;
  background: var(--color-background);
  min-height: 100vh;
}
.experts-view h1 {
  text-align: center;
  margin-bottom: 32px;
  color: var(--color-electric-blue);
  font-size: 2em;
  font-weight: 800;
}
.experts-list {
  display: flex;
  flex-wrap: wrap;
  gap: 32px;
  justify-content: center;
}
.expert-card {
  background: var(--color-main-white);
  border-radius: 16px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  padding: 24px 32px;
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 280px;
  transition: transform 0.2s, box-shadow 0.2s;
}
.expert-card:hover {
  transform: translateY(-4px) scale(1.03);
  box-shadow: 0 6px 24px rgba(0, 0, 0, 0.12);
}
.expert-photo {
  width: 90px;
  height: 90px;
  border-radius: 50%;
  object-fit: cover;
  margin-bottom: 16px;
  border: 3px solid var(--color-bright-green);
}
.expert-info h2 {
  margin: 0 0 8px 0;
  font-size: 1.2em;
  color: var(--color-dark-gray);
  font-weight: 700;
}
.profession,
.zone {
  color: var(--color-neutral-gray);
  font-size: 1em;
  margin-bottom: 4px;
}
.rating {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-top: 8px;
}
.star {
  color: var(--color-neutral-gray);
  font-size: 1.2em;
}
.star.filled {
  color: var(--color-golden-yellow);
}
.rating-value {
  margin-left: 6px;
  font-size: 0.95em;
  color: var(--color-dark-gray);
}
</style>
