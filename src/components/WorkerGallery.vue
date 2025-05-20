<template>
  <div class="worker-gallery">
    <h3>Galería de trabajos</h3>
    <div v-if="loading">Cargando galería...</div>
    <div v-else-if="!gallery || !gallery.items || gallery.items.length === 0">
      Sin imágenes aún.
    </div>
    <div v-else class="gallery-grid">
      <div v-for="item in gallery.items" :key="item._id" class="gallery-item">
        <img :src="item.imageUrl" alt="Trabajo realizado" />
        <div class="gallery-desc">{{ item.description }}</div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";
export default {
  props: {
    workerId: { type: String, required: true },
  },
  data() {
    return {
      gallery: null,
      loading: true,
    };
  },
  methods: {
    async fetchGallery() {
      this.loading = true;
      try {
        const res = await axios.get(
          `http://localhost:5000/api/gallery/${this.workerId}`
        );
        this.gallery = res.data;
      } catch {
        this.gallery = null;
      }
      this.loading = false;
    },
  },
  mounted() {
    this.fetchGallery();
  },
};
</script>

<style scoped>
.worker-gallery {
  max-width: 600px;
  margin: 0 auto;
}
.gallery-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
}
.gallery-item {
  width: 160px;
  border: 1px solid #eee;
  border-radius: 6px;
  overflow: hidden;
  background: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}
.gallery-item img {
  width: 100%;
  height: 110px;
  object-fit: cover;
}
.gallery-desc {
  padding: 6px 8px;
  font-size: 0.98em;
}
</style>
