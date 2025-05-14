<template>
  <div class="add-service">
    <h1>Agregar Servicio</h1>
    <form @submit.prevent="submitService">
      <label for="requester">Solicitante:</label>
      <input
        id="requester"
        v-model="service.requester"
        ref="requester"
        required
      />

      <label for="phone">Teléfono:</label>
      <input id="phone" v-model="service.phone" required />

      <label for="address">Dirección:</label>
      <input id="address" v-model="service.address" required />

      <label for="workingHours">Horario de trabajo:</label>
      <input id="workingHours" v-model="service.workingHours" required />

      <label for="serviceType">Tipo de servicio:</label>
      <select id="serviceType" v-model="service.serviceType" required>
        <option v-for="type in serviceTypes" :key="type" :value="type">
          {{ type }}
        </option>
      </select>

      <label for="details">Detalles del arreglo:</label>
      <textarea id="details" v-model="service.details" required></textarea>

      <label for="reportDate">Fecha del reporte:</label>
      <input
        id="reportDate"
        type="date"
        v-model="service.reportDate"
        required
      />

      <label for="observations">Observaciones:</label>
      <textarea id="observations" v-model="service.observations"></textarea>

      <label for="estimatedDuration">Duración estimada:</label>
      <input
        id="estimatedDuration"
        v-model="service.estimatedDuration"
        required
      />

      <button type="submit">Agregar Servicio</button>
    </form>
  </div>
</template>

<script>
import axios from "axios";

export default {
  data() {
    return {
      service: {
        requester: "",
        phone: "",
        address: "",
        workingHours: "",
        serviceType: "",
        details: "",
        reportDate: "",
        observations: "",
        estimatedDuration: "",
      },
      serviceTypes: [
        "Pintura",
        "Plomería",
        "Electricidad",
        "Driwall",
        "Enchapes",
        "Cocinas",
        "Ventanerías",
        "Calentadores",
        "Puertas",
        "Pisos PVC",
        "Otros",
      ],
    };
  },
  mounted() {
    this.service.reportDate = new Date().toISOString().split("T")[0];
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
      const payload = {
        ...this.service,
        observations,
      };
      axios
        .post("http://localhost:5000/api/services", payload)
        .then(() => {
          alert("Servicio agregado correctamente");
          this.service = {
            requester: "",
            phone: "",
            address: "",
            workingHours: "",
            serviceType: "",
            details: "",
            reportDate: new Date().toISOString().split("T")[0],
            observations: "",
            estimatedDuration: "",
          };
          this.$nextTick(() => {
            this.$refs.requester.focus();
          });
        })
        .catch(() => {
          alert("Error al agregar el servicio");
        });
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
