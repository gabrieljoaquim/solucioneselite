<template>
  <div class="photo-uploader">
    <h3>Subir Fotos del Servicio</h3>
    <input
      type="file"
      ref="fileInput"
      multiple
      accept="image/*"
      @change="handleFileUpload"
    />
    <button @click="uploadPhotos" :disabled="!photos.length">
      Subir Fotos
    </button>

    <div v-if="photos.length" class="photo-preview">
      <h4>Miniaturas:</h4>
      <div class="thumbnails">
        <img
          v-for="(photo, index) in photos"
          :key="index"
          :src="downloadUrl"
          alt="Foto del servicio"
        />
      </div>
    </div>
  </div>
</template>

<script>
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

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
      const currentUser = this.$store.state.currentUser;

      if (!currentUser || !currentUser.uid) {
        alert("No se pudo obtener el ID del técnico.");
        return;
      }

      const service = this.$store.state.services.find(
        (s) => s._id === this.serviceId
      );

      if (!service || !service.pdfReferencia) {
        alert("No se encontró la referencia del PDF para este servicio.");
        return;
      }

      const storage = getStorage();
      const uploadedUrls = [];

      // Reemplaza espacios en el nombre del PDF por "_"
      const baseName = service.pdfReferencia.replace(/\s+/g, "_");

      for (let i = 0; i < this.photos.length; i++) {
        const photo = this.photos[i];
        const file = photo.file;

        const fileName = `${baseName}_${currentUser.uid}_${String(
          i + 1
        ).padStart(2, "0")}.jpg`;
        const fileRef = ref(storage, `fotos_servicio/${fileName}`);

        try {
          const snapshot = await uploadBytes(fileRef, file);
          const downloadUrl = await getDownloadURL(snapshot.ref);
          uploadedUrls.push(downloadUrl);
        } catch (error) {
          alert(`Error subiendo la foto ${i + 1}: ${error.message}`);
        }
      }

      alert("Fotos subidas exitosamente.");
      console.log("URLs subidas:", uploadedUrls);

      // Limpieza
      this.photos = [];
      this.$refs.fileInput.value = null;
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
  flex-wrap: wrap;
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
