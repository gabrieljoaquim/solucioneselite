<template>
  <div class="photo-uploader">
    <h3>Subir Fotos del Servicio</h3>
    <input type="file" multiple accept="image/*" @change="handleFileUpload" />
    <button @click="uploadPhotos" :disabled="!photos.length">
      Subir Fotos
    </button>

    <div v-if="photos.length" class="photo-preview">
      <h4>Miniaturas:</h4>
      <div class="thumbnails">
        <img
          v-for="(photo, index) in photos"
          :key="index"
          :src="photo.preview"
          alt="Foto del servicio"
        />
      </div>
    </div>
  </div>
</template>

<script>
import api from "../axios";

export default {
  props: {
    serviceId: {
      type: String,
      required: true,
    },
  },
  data() {
    return {
      photos: [],
    };
  },
  methods: {
    handleFileUpload(event) {
      const files = event.target.files;
      this.photos = Array.from(files).map((file) => ({
        file,
        preview: URL.createObjectURL(file),
      }));
    },
    async uploadPhotos() {
      const formData = new FormData();
      this.photos.forEach((photo) => {
        formData.append("photos", photo.file);
      });

      try {
        await api.post(`/api/services/${this.serviceId}/photos`, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
        alert("Fotos subidas exitosamente.");
        this.photos = [];
      } catch (error) {
        alert(
          "Error al subir las fotos: " +
            (error.response?.data?.error || error.message)
        );
      }
    },
  },
};
</script>

<style scoped>
.photo-uploader {
  margin-top: 20px;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 5px;
  background-color: #f9f9f9;
}
.photo-uploader h3 {
  margin-bottom: 10px;
}
.photo-uploader input {
  margin-bottom: 10px;
}
.photo-uploader button {
  background-color: #117e2c;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
}
.photo-uploader button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}
.photo-preview {
  margin-top: 20px;
}
.thumbnails {
  display: flex;
  gap: 10px;
}
.thumbnails img {
  width: 100px;
  height: 100px;
  object-fit: cover;
  border: 1px solid #ccc;
  border-radius: 5px;
}
</style>
