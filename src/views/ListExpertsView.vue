<template>
  <div class="experts-view">
    <h1>Encuentra un Experto</h1>
    <div v-if="experts.length === 0" class="no-experts">
      <p>
        No hay expertos disponibles en este momento. Actualiza tu perfil o
        espera a que otros trabajadores completen sus datos.
      </p>
    </div>
    <div class="experts-list">
      <div
        v-for="expert in experts"
        :key="expert._id"
        class="expert-card"
        @click="goToExpert(expert._id)"
        style="cursor: pointer"
      >
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
              :class="{ filled: n <= Math.round(expert.avgRating || 0) }"
              >★</span
            >
            <span class="rating-value">
              {{
                typeof expert.avgRating === "number"
                  ? expert.avgRating.toFixed(1)
                  : "Sin calificación"
              }}
            </span>
          </div>
        </div>
        <div class="expert-actions">
          <!-- <button class="chat-expert-btn" @click.stop="goToChat(expert._id)">
            Chatear
          </button> -->
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { getDocs, collection } from "firebase/firestore";
import { db } from "@/firebase/firebaseConfig";

export default {
  name: "ListExpertsView",
  data() {
    return {
      experts: [],
    };
  },
  async mounted() {
    try {
      const snapshot = await getDocs(collection(db, "users"));
      const users = snapshot.docs.map((doc) => ({
        _id: doc.id,
        ...doc.data(),
      }));

      this.experts = users.filter(
        (u) => u.role !== "cliente" && u.specialty?.length && u.zone && u.name
      );
    } catch (err) {
      console.error("Error cargando expertos:", err);
      this.experts = [];
    }
  },
  methods: {
    goToExpert(id) {
      this.$router.push({ name: "ExpertDetail", params: { id } });
    },
    // goToChat(expertId) {
    //   this.$router.push({ name: "chat-user", params: { userId: expertId } });
    // },
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
.expert-actions {
  margin-top: 16px;
  width: 100%;
  display: flex;
  justify-content: center;
}
.chat-expert-btn {
  background: var(--color-electric-blue);
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 8px 24px;
  font-weight: 700;
  font-size: 1em;
  cursor: pointer;
  transition: background 0.2s;
}
.chat-expert-btn:hover {
  background: var(--color-bright-green);
}
</style>
