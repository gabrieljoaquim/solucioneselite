<template>
  <div class="service-details">
    <h1>Detalles del Servicio</h1>
    <form @submit.prevent="uploadPdf" style="margin-bottom: 24px">
      <label for="pdf">Subir PDF de servicio:</label>
      <input
        type="file"
        id="pdf"
        ref="pdfInput"
        accept="application/pdf"
        required
      />
      <button type="submit">Cargar PDF</button>
    </form>
    <div v-if="loading">Procesando PDF...</div>
    <div v-if="error" style="color: red">{{ error }}</div>
    <p><strong>Solicitante:</strong> {{ service.requester }}</p>
    <p><strong>Teléfono:</strong> {{ service.phone }}</p>
    <p><strong>Dirección:</strong> {{ service.address }}</p>
    <p><strong>Horario de trabajo:</strong> {{ service.workingHours }}</p>
    <p><strong>Tipo de servicio:</strong> {{ service.serviceType }}</p>
    <p><strong>Detalles del arreglo:</strong> {{ service.details }}</p>
    <p><strong>Fecha del reporte:</strong> {{ service.reportDate }}</p>
    <p><strong>Observaciones:</strong> {{ service.observations }}</p>
    <p><strong>Duración estimada:</strong> {{ service.estimatedDuration }}</p>
    <p><strong>Estado:</strong> {{ service.status }}</p>
  </div>
</template>

<script>
import api from "../axios";
export default {
  data() {
    return {
      service: {
        requester: "Juan Pérez",
        phone: "123456789",
        address: "Calle Falsa 123",
        workingHours: "9:00 AM - 5:00 PM",
        serviceType: "Plomería",
        details: "Reparación de tubería",
        reportDate: "2025-05-07",
        observations: "Urgente",
        estimatedDuration: "2 horas",
        status: "En espera",
      },
      loading: false,
      error: "",
    };
  },
  methods: {
    async uploadPdf() {
      this.error = "";
      this.loading = true;
      const file = this.$refs.pdfInput.files[0];
      if (!file) {
        this.error = "Selecciona un archivo PDF";
        this.loading = false;
        return;
      }
      const formData = new FormData();
      formData.append("pdf", file);
      try {
        const res = await api.post("/api/services/upload-pdf", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        this.service = res.data;
      } catch (err) {
        this.error = err.response?.data?.error || "Error al procesar el PDF";
      } finally {
        this.loading = false;
      }
    },
  },
};
</script>

<style scoped>
.service-details {
  max-width: 600px;
  margin: 0 auto;
}
p {
  margin: 10px 0;
}
</style>
