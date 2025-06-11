<template>
  <div>
    <h3>Informe final del técnico</h3>
    <textarea
      v-model="descripcionFinal"
      placeholder="Describe el trabajo realizado..."
      rows="4"
      style="width: 100%; margin-bottom: 12px"
    ></textarea>

    <button @click="generatePDF">Generar PDF del Servicio</button>

    <!-- Contenido oculto que se exporta a PDF -->
    <div ref="pdfContent" class="pdf-template">
      <h2>Servicio Realizado</h2>
      <p><strong>Proveedor:</strong> {{ service.proveedorAsignado }}</p>
      <p><strong>Referencia:</strong> {{ fileName }}</p>
      <p><strong>Solicitante:</strong> {{ service.requester }}</p>
      <!-- <p><strong>Registrante:</strong> {{ service.registrante }}</p> -->
      <!-- <p><strong>Teléfono:</strong> {{ service.phone }}</p> -->
      <p><strong>Dirección:</strong> {{ service.address }}</p>
      <!-- <p><strong>Horario:</strong> {{ service.workingHours }}</p> -->
      <p><strong>Tipo de Servicio:</strong> {{ service.serviceType }}</p>
      <!-- <p><strong>Descripción inicial:</strong> {{ service.details }}</p> -->
      <p><strong>Fecha de Reporte:</strong> {{ service.reportDate }}</p>
      <p v-if="service.precio != null">
        <strong>Precio:</strong> ${{ service.precio }}
      </p>

      <p style="margin-top: 20px">
        <strong>Descripción Final del Técnico:</strong>
      </p>
      <p style="white-space: pre-line">{{ descripcionFinal }}</p>

      <div
        v-if="service.photos && service.photos.length"
        style="margin-top: 20px"
      >
        <h4>Fotos del Trabajo</h4>
        <div class="photo-grid">
          <img
            v-for="(photo, i) in service.photos"
            :key="i"
            :src="getFullPhotoUrl(photo)"
            class="service-photo"
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
      expectedPhotos: [],
    };
  },
  mounted() {
    const base = this.service.pdfReferencia?.replace(/\.pdf$/i, "");
    const tecnicoId = this.service.takenById;
    if (!base || !tecnicoId) return;

    const tecnicoIdSuffix = tecnicoId.slice(-6);
    this.expectedPhotos = this.computedExpectedPhotos.map((_, i) => {
      const n = (i + 1).toString().padStart(2, "0"); // 01, 02, ...
      return `http://localhost:5000/uploads/services/${base}_${tecnicoIdSuffix}_${n}.jpg`;
    });
  },

  computed: {
    fileName() {
      const base = this.service.pdfReferencia
        ? this.service.pdfReferencia.replace(/\.pdf$/i, "")
        : "servicio";
      return `${base}_realizado.pdf`;
    },
    computedExpectedPhotos() {
      const base = this.service.pdfReferencia?.replace(/\.pdf$/i, "");
      const tecnicoId = this.service.takenById;
      if (!base || !tecnicoId) return [];

      const tecnicoIdSuffix = tecnicoId.slice(-6);
      // Suponemos máximo 30 fotos
      return Array.from({ length: 30 }, (_, i) => {
        const n = (i + 1).toString().padStart(2, "0"); // 01, 02, ...
        return `http://localhost:5000/uploads/services/${base}_${tecnicoIdSuffix}_${n}.jpg`;
      });
    },
  },
  methods: {
    photoUrl(photoPath) {
      const relativePath = photoPath.split("uploads").pop(); // lo que viene después de 'uploads'
      const baseURL = window.location.hostname.includes("localhost")
        ? "http://localhost:5000"
        : "https://solucioneselite-u60d.onrender.com";

      return `${baseURL}/uploads${relativePath}`;
    },
    async generatePDF() {
      const element = this.$refs.pdfContent;
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
    onImageError(index) {
      this.expectedPhotos.splice(index, 1); // Oculta imágenes que no existen
    },
    methods: {
      getFullPhotoUrl(photoPath) {
        const baseURL = window.location.hostname.includes("localhost")
          ? "http://localhost:5000"
          : "https://solucioneselite-u60d.onrender.com";
        return `${baseURL}${photoPath}`;
      },
      onImageError(i) {
        console.warn("Imagen no cargada:", i);
      },
      async generatePDF() {
        const element = this.$refs.pdfContent;
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
    },
  },
};
</script>

<style scoped>
.pdf-template {
  width: 800px;
  padding: 20px;
  font-family: Arial, sans-serif;
  background-color: white;
  color: black;
  font-size: 14px;
}
.photo-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}
.service-photo {
  width: 150px;
  height: auto;
  border: 1px solid #ccc;
}
</style>
