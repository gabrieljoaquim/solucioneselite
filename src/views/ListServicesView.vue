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
        <span v-if="service.takenBy" class="taken-by"
          >Tomado por: {{ service.takenBy }}</span
        >
        <button @click="toggleDetails(index)">
          {{ service.showDetails ? "Ocultar Detalles" : "Ver Detalles" }}
        </button>
        <div v-if="service.showDetails" class="service-details">
          <p><strong>Teléfono:</strong> {{ service.phone }}</p>
          <p><strong>Dirección:</strong> {{ service.address }}</p>
          <p><strong>Horario:</strong> {{ service.workingHours }}</p>
          <p><strong>Detalles:</strong> {{ service.details }}</p>
          <p><strong>Fecha del reporte:</strong> {{ service.reportDate }}</p>
          <div v-if="getObservations(service).length">
            <strong>Observaciones:</strong>
            <ul>
              <li v-for="(obs, i) in getObservations(service)" :key="i">
                {{ obs }}
              </li>
            </ul>
          </div>
          <p>
            <strong>Duración estimada:</strong> {{ service.estimatedDuration }}
          </p>
          <button class="btn-tomar" @click="markAsTaken(index)">
            Marcar como tomado
          </button>
          <button
            class="btn-observacion"
            @click="toggleObservationInput(index)"
          >
            Con Observación
          </button>
          <button class="btn-terminado" @click="markAsFinalized(index)">
            Servicio Terminado
          </button>
          <button class="btn-cerrado" @click="sendToClosed(index)">
            Enviar a Cerrados
          </button>
          <div v-if="service.showObservationInput">
            <input
              v-model="service.observationsDraft"
              ref="observationInput"
              :disabled="false"
              placeholder="Agrega una observación"
              @keyup.enter="saveObservation(index)"
            />
            <button
              @click="saveObservation(index)"
              :disabled="!canEditObservation(service)"
            >
              Agregar
            </button>
          </div>
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
      const currentUser = this.$store.state.currentUser;
      if (!currentUser) {
        alert("Debes iniciar sesión para tomar un servicio.");
        return;
      }
      this.services[index].backgroundColor = "lightgreen";
      this.services[index].takenBy =
        currentUser.name || currentUser.email || currentUser._id;
      this.services[index].takenById = currentUser._id;
      this.services[index].takenByEmail = currentUser.email;
      // Guardar en backend
      axios
        .put(`http://localhost:5000/api/services/${this.services[index]._id}`, {
          backgroundColor: "lightgreen",
          takenBy: this.services[index].takenBy,
          takenById: this.services[index].takenById,
          takenByEmail: this.services[index].takenByEmail,
        })
        .then((res) => {
          // Actualiza el servicio en el store con la respuesta del backend
          Object.assign(this.services[index], res.data);
        });
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
    toggleObservationInput(index) {
      this.services[index].showObservationInput =
        !this.services[index].showObservationInput;
      this.services[index].observationsDraft = "";
      this.$nextTick(() => {
        // Selecciona el input correcto si hay varios
        const inputs = this.$refs.observationInput;
        if (Array.isArray(inputs)) {
          if (this.services[index].showObservationInput && inputs[index]) {
            inputs[index].focus();
          }
        } else if (inputs && this.services[index].showObservationInput) {
          inputs.focus();
        }
      });
    },
    saveObservation(index) {
      const currentUser = this.$store.state.currentUser;
      if (!this.canEditObservation(this.services[index])) return;
      if (this.services[index].observationsDraft.trim()) {
        // Guarda en backend SOLO la nueva observación (append)
        axios
          .put(
            `http://localhost:5000/api/services/${this.services[index]._id}`,
            {
              $push: {
                observations: this.services[index].observationsDraft.trim(),
              },
            }
          )
          .then((res) => {
            Object.assign(this.services[index], res.data);
            this.services[index].showObservationInput = false;
            this.services[index].observationsDraft = "";
          });
      }
    },
    canEditObservation(service) {
      const currentUser = this.$store.state.currentUser;
      // Permitir editar si el usuario tomó el servicio
      return currentUser && service.takenById === currentUser._id;
    },
    getObservations(service) {
      // Always return an array for observations
      if (Array.isArray(service.observations)) {
        return service.observations;
      } else if (
        typeof service.observations === "string" &&
        service.observations.trim() !== ""
      ) {
        return [service.observations];
      } else {
        return [];
      }
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
.taken-by {
  font-size: 0.95em;
  color: #117e2c;
  margin-left: 10px;
}
</style>
