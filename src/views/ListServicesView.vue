<template>
  <div class="list-services">
    <h1>Lista de Servicios</h1>
    <ul>
      <li
        v-for="(service, index) in services"
        :key="index"
        :style="{ backgroundColor: service.backgroundColor || 'white' }"
      >
        <span>{{ service.requester }} - {{ service.serviceType }}</span>
        <button @click="toggleDetails(index)">
          {{ service.showDetails ? "Ocultar Detalles" : "Ver Detalles" }}
        </button>
        <div v-if="service.showDetails" class="service-details">
          <p><strong>Teléfono:</strong> {{ service.phone }}</p>
          <p><strong>Dirección:</strong> {{ service.address }}</p>
          <p><strong>Horario:</strong> {{ service.workingHours }}</p>
          <p><strong>Detalles:</strong> {{ service.details }}</p>
          <p><strong>Fecha del reporte:</strong> {{ service.reportDate }}</p>
          <p><strong>Observaciones:</strong> {{ service.observations }}</p>
          <p>
            <strong>Duración estimada:</strong> {{ service.estimatedDuration }}
          </p>
          <button class="btn-tomar" @click="markAsTaken(index)">
            Marcar como tomado
          </button>
          <button class="btn-completado" @click="markAsCompleted(index)">
            Completado
          </button>
          <button class="btn-observacion" @click="markWithObservation(index)">
            Con Observación
          </button>
          <button class="btn-terminado" @click="markAsFinalized(index)">
            Servicio Terminado
          </button>
          <button class="btn-cerrado" @click="sendToClosed(index)">
            Enviar a Cerrados
          </button>
        </div>
      </li>
    </ul>
  </div>
</template>

<script>
import axios from "axios";

export default {
  computed: {
    services() {
      return this.$store.state.services;
    },
  },
  mounted() {
    axios.get("http://localhost:5000/api/services").then((res) => {
      // Reemplaza el contenido del store con los servicios del backend
      this.$store.state.services.splice(
        0,
        this.$store.state.services.length,
        ...res.data
      );
    });
  },
  methods: {
    toggleDetails(index) {
      this.services[index].showDetails = !this.services[index].showDetails;
    },
    markAsTaken(index) {
      const userName = prompt(
        "Ingrese el nombre del usuario que tomó el servicio:"
      );
      if (userName) {
        this.services[index].backgroundColor = "lightgreen";
        this.services[index].takenBy = userName;
      }
    },
    markAsCompleted(index) {
      this.services[index].backgroundColor = "lightyellow";
    },
    markWithObservation(index) {
      this.services[index].backgroundColor = "lightcoral";
    },
    markAsFinalized(index) {
      this.services[index].backgroundColor = "lightblue";
    },
    sendToClosed(index) {
      const closedService = this.services.splice(index, 1)[0];
      this.$store.commit("addClosedService", closedService);
    },
  },
};
</script>

<style scoped>
.list-services {
  max-width: 600px;
  margin: 0 auto;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  margin-bottom: 10px;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 5px;
}
button {
  margin: 5px;
  background-color: #2196f3;
  color: white;
  border: none;
  padding: 5px 10px;
  cursor: pointer;
}
button:hover {
  background-color: #515456;
}
.btn-tomar {
  background-color: #4caf50;
}
.btn-completado {
  background-color: #ff9800;
}
.btn-observacion {
  background-color: #f44336;
}
.btn-terminado {
  background-color: #2196f3;
}
.btn-cerrado {
  background-color: #9c27b0;
}
.service-details {
  margin-top: 10px;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 5px;
  background-color: #f9f9f9;
}
</style>
