<template>
  <div class="add-service">
    <h1>Agregar Servicio</h1>
    <form @submit.prevent="submitService">
      <PdfNameDisplay
        v-if="service.pdfReferencia"
        :pdfName="service.pdfReferencia"
      />

      <label for="requester">Solicitante:</label>
      <input
        id="requester"
        v-model="service.requester"
        ref="requester"
        required
      />
      <label for="registrante">Registrante:</label>
      <input id="registrante" v-model="registrante" disabled required />

      <label for="phone">Teléfono:</label>
      <input id="phone" v-model="service.phone" required />

      <label for="address">Dirección:</label>
      <input id="address" v-model="service.address" required />

      <label for="workingHours">Horario de trabajo:</label>
      <input id="workingHours" v-model="service.workingHours" required />

      <label for="serviceType">Tipo de servicio:</label>
      <input id="serviceType" v-model="service.serviceType" required />

      <label for="details">Detalles del arreglo:</label>
      <textarea id="details" v-model="service.details" required></textarea>

      <label for="puntoVentaCodigo">Punto de venta código:</label>
      <input id="puntoVentaCodigo" v-model="service.puntoVentaCodigo" />

      <label for="proveedorAsignado">Proveedor asignado:</label>
      <input id="proveedorAsignado" v-model="service.proveedorAsignado" />

      <label for="nombreOficina">Nombre de Oficina:</label>
      <input id="nombreOficina" v-model="service.nombreOficina" />

      <label for="reportDate">Fecha del reporte:</label>
      <input
        id="reportDate"
        type="date"
        v-model="service.reportDate"
        required
      />

      <label for="observations">Observaciones:</label>
      <textarea id="observations" v-model="service.observations"></textarea>

      <!-- El campo de precio solo lo edita el trabajador o administrador después de la creación -->
      <!-- Por lo tanto, no se muestra el editor de precio aquí -->

      <button type="submit">Agregar Servicio</button>
    </form>
    <form @submit.prevent="uploadPdf" style="margin-top: 24px">
      <label for="pdf">O subir PDF de servicio:</label>
      <input
        type="file"
        id="pdf"
        ref="pdfInput"
        accept="application/pdf"
        required
      />
      <button type="submit">Cargar PDF y Autocompletar</button>
    </form>
    <div v-if="loading">Procesando PDF...</div>
    <div v-if="error" style="color: red">{{ error }}</div>
  </div>
</template>

<script>
import ServicePriceEditor from "../components/ServicePriceEditor.vue";
import PdfNameDisplay from "../components/PdfNameDisplay.vue";
import api from "../axios";

export default {
  components: {
    ServicePriceEditor,
    PdfNameDisplay,
  },

  data() {
    return {
      service: {
        requester: "",
        phone: "",
        address: "",
        workingHours: "",
        serviceType: "",
        details: "",
        puntoVentaCodigo: "",
        proveedorAsignado: "",
        nombreOficina: "",
        reportDate: "",
        observations: "",
      },
      registrante: "",
      loading: false,
      error: "",
    };
  },
  computed: {
    isClient() {
      const user = this.$store.state.currentUser;
      return user && user.role === "cliente";
    },
  },
  mounted() {
    this.service.reportDate = new Date().toISOString().split("T")[0];
    // Asigna automáticamente el registrante
    const user = this.$store.state.currentUser;
    if (user) {
      this.registrante = user.name || user.email;
    }
  },
  methods: {
    submitService() {
      let observations = this.service.observations;
      if (typeof observations === "string" && observations.trim() !== "") {
        observations = observations
          .split("\n")
          .map((o) => o.trim())
          .filter(Boolean);
      } else {
        observations = [];
      }
      // Agrega el registrante automáticamente y el registranteId
      const currentUser = this.$store.state.currentUser;
      const payload = {
        ...this.service,
        registrante: this.registrante,
        registranteId:
          currentUser && currentUser._id ? currentUser._id : undefined,
        observations,
      };
      api
        .post("/api/services", payload)
        .then(() => {
          alert("Servicio agregado correctamente");
          this.service = {
            requester: "",
            phone: "",
            address: "",
            workingHours: "",
            serviceType: "",
            details: "",
            puntoVentaCodigo: "",
            proveedorAsignado: "",
            nombreOficina: "",
            reportDate: new Date().toISOString().split("T")[0],
            observations: "",
          };
        })
        .catch(() => {
          alert("Error al agregar el servicio");
        });
    },
    async uploadPdf() {
      this.error = "";
      this.loading = true;
      const file = this.$refs.pdfInput.files[0];
      if (!file) {
        this.error = "Selecciona un archivo PDF";
        this.loading = false;
        return;
      }
      const fileName = file.name;
      const formData = new FormData();
      formData.append("pdf", file);

      // Add registranteId to the formData
      const registranteId = this.registrante; // Assuming this.registrante contains the authenticated user's ID
      if (!registranteId) {
        this.error = "El ID del registrante no está disponible";
        this.loading = false;
        return;
      }
      formData.append("registranteId", registranteId);

      try {
        const res = await api.post("/api/services/upload-pdf", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        // Solo autocompleta el formulario, NO guarda en la BD
        this.service = {
          ...this.service,
          ...res.data,
          observations: Array.isArray(res.data.observations)
            ? res.data.observations.join("\n")
            : res.data.observations || "",
          pdfReferencia: fileName,
        };
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
.add-service {
  max-width: 600px;
  margin: 0 auto;
}
form {
  display: flex;
  flex-direction: column;
}
label {
  margin-top: 10px;
}
input,
select,
textarea,
button {
  margin-top: 5px;
}
button {
  margin-top: 15px;
  background-color: #4caf50;
  color: white;
  border: none;
  padding: 10px;
  cursor: pointer;
}
button:hover {
  background-color: #45a049;
}
</style>
