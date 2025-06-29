<template>
  <div>
    <h3>Informe final del técnico</h3>
    <textarea
      v-model="descripcionFinal"
      placeholder="Describe el trabajo realizado..."
      rows="4"
      style="width: 100%; margin-bottom: 12px"
    ></textarea>

    <input
      type="file"
      multiple
      accept="image/*"
      @change="handleImageUpload"
      style="margin-bottom: 12px"
    />

    <button @click="generatePDF">Generar PDF del Servicio</button>

    <!-- Contenido oculto que se exporta a PDF -->
    <div ref="pdfContent" class="pdf-template">
      <h2>Servicio Realizado</h2>
      <p><strong>Proveedor:</strong> {{ service.proveedorAsignado }}</p>
      <p><strong>Referencia:</strong> {{ fileName }}</p>
      <p><strong>Solicitante:</strong> {{ service.requester }}</p>
      <p><strong>Dirección:</strong> {{ service.address }}</p>
      <p><strong>Tipo de Servicio:</strong> {{ service.serviceType }}</p>
      <p><strong>Fecha de Reporte:</strong> {{ service.reportDate }}</p>
      <p v-if="service.precio != null">
        <strong>Precio:</strong> ${{ service.precio }}
      </p>

      <p style="margin-top: 20px">
        <strong>Descripción Final del Técnico:</strong>
      </p>
      <p style="white-space: pre-line">{{ descripcionFinal }}</p>

      <div v-if="imagenesSeleccionadas.length" style="margin-top: 20px">
        <h4>Imágenes seleccionadas desde tu equipo</h4>
        <div class="photo-grid">
          <img
            v-for="(img, i) in imagenesSeleccionadas"
            :key="'local-' + i"
            :src="img"
            class="service-photo"
          />
        </div>
      </div>

      <div
        v-if="service.photos && service.photos.length"
        style="margin-top: 20px"
      >
        <h4>Fotos del Trabajo (cargadas desde servidor)</h4>
        <div class="photo-grid">
          <img
            v-for="(photo, i) in service.photos"
            :key="'server-' + i"
            :src="getFullPhotoUrl(photo)"
            class="service-photo"
            crossorigin="anonymous"
            @error="onImageError(i)"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

export default {
  props: {
    service: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      descripcionFinal: "",
      imagenesSeleccionadas: [],
    };
  },
  computed: {
    fileName() {
      const base = this.service.pdfReferencia
        ? this.service.pdfReferencia.replace(/\.pdf$/i, "")
        : "servicio";
      return `${base}_realizado.pdf`;
    },
  },
  methods: {
    handleImageUpload(event) {
      const files = event.target.files;
      this.imagenesSeleccionadas = [];

      Array.from(files).forEach((file) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          this.imagenesSeleccionadas.push(e.target.result); // base64
        };
        reader.readAsDataURL(file);
      });
    },
    async waitForImagesToLoad(container) {
      const images = container.querySelectorAll("img");
      const promises = Array.from(images).map((img) => {
        if (img.complete && img.naturalHeight !== 0) return Promise.resolve();
        return new Promise((resolve) => {
          img.onload = resolve;
          img.onerror = resolve;
        });
      });
      return Promise.all(promises);
    },
    async generatePDF() {
      const element = this.$refs.pdfContent;

      await this.waitForImagesToLoad(element);

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "pt", "a4");

      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(this.fileName);
    },
    getFullPhotoUrl(photoPath) {
      const baseURL = window.location.hostname.includes("localhost")
        ? "http://localhost:5000"
        : "https://solucioneselite-u60d.onrender.com";
      return `${baseURL}${photoPath}`;
    },
    onImageError(i) {
      console.warn("Imagen no cargada:", i);
    },
  },
};
</script>

<style scoped>
.pdf-template {
  width: 555px;
  padding: 20px;
  font-family: Arial, sans-serif;
  background-color: white;
  color: black;
  font-size: 14px;
  box-sizing: border-box;
}
.photo-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}
.service-photo {
  width: 120px;
  height: auto;
  border: 1px solid #ccc;
}
</style>
