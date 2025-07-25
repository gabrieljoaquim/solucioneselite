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

    <PdfUploader :service="service" />
  </div>
</template>

<script>
import ServicePriceEditor from "../components/ServicePriceEditor.vue";
import PdfNameDisplay from "../components/PdfNameDisplay.vue";
import PdfUploader from "@/components/PdfUploader.vue";

export default {
  components: {
    ServicePriceEditor,
    PdfNameDisplay,
    PdfUploader,
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
        reportDate: new Date().toISOString().split("T")[0],
        observations: "",
        pdfReferencia: "",
      },
      registrante: "",
      loading: false,
      error: null,
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
    rellenarDesdePdf(dataExtraida) {
      this.service = {
        ...this.service,
        ...dataExtraida,
      };
    },
    async submitService() {
      try {
        this.loading = true;
        this.error = null;

        const payload = {
          ...this.service,
          registrante: this.registrante,
        };

        const response = await fetch(
          `${process.env.VUE_APP_API_URL}/services`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Error desconocido");
        }

        const newService = await response.json();
        alert("Servicio agregado con éxito");

        this.resetForm(); // Limpia el formulario
        this.$router.push({ name: "add-services" });
      } catch (error) {
        this.error = "Error al agregar el servicio: " + error.message;
        console.error(error);
      } finally {
        this.loading = false;
      }
    },
    resetForm() {
      this.service.requester = "";
      this.service.phone = "";
      this.service.address = "";
      this.service.workingHours = "";
      this.service.serviceType = "";
      this.service.details = "";
      this.service.puntoVentaCodigo = "";
      this.service.proveedorAsignado = "";
      this.service.nombreOficina = "";
      this.service.reportDate = new Date().toISOString().split("T")[0];
      this.service.observations = "";
      this.service.pdfReferencia = "";
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
