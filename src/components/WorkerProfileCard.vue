<template>
  <div class="worker-profile-card">
    <img
      :src="worker.profilePhoto || '/default-user-photo.jpg'"
      class="profile-photo"
    />
    <div class="profile-info">
      <h3>{{ worker.name }}</h3>
      <div class="profile-rating">
        <span v-if="worker.rating">{{ worker.rating.toFixed(1) }} ★</span>
        <span v-else>Sin calificación</span>
      </div>
      <div class="profile-specialty">{{ worker.specialty?.join(", ") }}</div>
      <div class="profile-zone">{{ worker.zone }}</div>
      <div class="profile-experience">
        {{ worker.experience }} años de experiencia
      </div>
      <div class="profile-description">{{ worker.description }}</div>
      <span v-if="worker.verified" class="verified-badge">Verificado</span>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    worker: { type: Object, required: true },
  },
};
</script>

<style scoped>
.worker-profile-card {
  display: flex;
  gap: 18px;
  border: 1px solid #ccc;
  border-radius: 8px;
  padding: 16px;
  background: #fff;
  margin-bottom: 18px;
  align-items: flex-start;
}
.profile-photo {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #2196f3;
}
.profile-info {
  flex: 1;
}
.profile-rating {
  color: #ffb400;
  font-size: 1.1em;
}
.verified-badge {
  background: #4caf50;
  color: #fff;
  border-radius: 4px;
  padding: 2px 8px;
  font-size: 0.95em;
  margin-left: 8px;
}
</style>
