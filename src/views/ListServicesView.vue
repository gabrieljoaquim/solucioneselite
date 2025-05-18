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
        <button
          v-if="canDeleteService(service)"
          class="btn-eliminar"
          @click="deleteService(index)"
        >
          Eliminar
        </button>
        <div v-if="service.showDetails" class="service-details">
          <p><strong>Teléfono:</strong> {{ service.phone }}</p>
          <p><strong>Dirección:</strong> {{ service.address }}</p>
          <p><strong>Horario:</strong> {{ service.workingHours }}</p>
          <p v-if="service.details && !service.editingDetails">
            <strong>Descripción del arreglo:</strong>
            {{ service.details }}
            <button v-if="canEditDetails(service)" @click="editDetails(index)">
              Editar
            </button>
          </p>
          <div v-if="service.editingDetails">
            <strong>Descripción del arreglo:</strong>
            <input
              v-model="service.detailsDraft"
              ref="detailsInput"
              style="width: 80%"
            />
            <button @click="saveDetails(index)">Guardar</button>
            <button @click="cancelEditDetails(index)">Cancelar</button>
          </div>
          <p><strong>Fecha del reporte:</strong> {{ service.reportDate }}</p>
          <p v-if="service.puntoVentaCodigo">
            <strong>Código Punto de Venta:</strong>
            {{ service.puntoVentaCodigo }}
          </p>
          <p v-if="service.proveedorAsignado">
            <strong>Proveedor Asignado:</strong> {{ service.proveedorAsignado }}
          </p>
          <p v-if="service.nombreOficina">
            <strong>Nombre de Oficina:</strong> {{ service.nombreOficina }}
          </p>
          <p v-if="service.status">
            <strong>Status:</strong> {{ service.status }}
          </p>
          <div v-if="getObservations(service).length">
            <strong>Observaciones:</strong>
            <ul>
              <li v-for="(obs, i) in getObservations(service)" :key="i">
                {{ obs }}
              </li>
            </ul>
          </div>
          <button
            class="btn-tomar"
            @click="markAsTaken(index)"
            :disabled="!!service.takenById"
          >
            Marcar como tomado
          </button>
          <button
            class="btn-observacion"
            @click="markWithObservation(index)"
            :disabled="!canEditDetails(service)"
          >
            Con Observación
          </button>
          <button
            class="btn-terminado"
            @click="markAsFinalized(index)"
            :disabled="!canEditDetails(service)"
          >
            Servicio Terminado
          </button>
          <button class="btn-cerrado" @click="sendToClosed(index)">
            Enviar a Cerrados
          </button>
          <CerrarServicioCliente
            v-if="service.showDetails"
            :service="service"
            :currentUser="$store.state.currentUser"
            @cerrado="onClienteCerro(index, $event)"
          />
        </div>
      </li>
    </ul>
  </div>
</template>

<script>
import axios from "axios";
import CerrarServicioCliente from "../views/CerrarServicioCliente.vue";

export default {
  components: {
    CerrarServicioCliente,
  },
  computed: {
    services() {
      const currentUser = this.$store.state.currentUser;
      if (!currentUser) return [];
      if (
        currentUser.role === "administrador" ||
        currentUser.role === "trabajador"
      ) {
        return this.$store.state.services;
      }
      // Cliente: solo ve los servicios que él cargó (por nombre o email)
      return this.$store.state.services.filter(
        (service) =>
          service.requester === currentUser.name ||
          service.requester === currentUser.email
      );
    },
  },
  mounted() {
    axios.get("http://localhost:5000/api/services").then((res) => {
      // Reemplaza el contenido del store con los servicios del backend
      const currentUser = this.$store.state.currentUser;
      const services = res.data.map((service) => {
        // Si el servicio fue tomado por el usuario actual, asegura que takenById coincida
        if (
          service.takenByEmail &&
          currentUser &&
          service.takenByEmail === currentUser.email
        ) {
          service.takenById = currentUser._id;
        }
        // Si el servicio fue tomado por el usuario actual pero el campo takenById no existe o no coincide
        if (
          service.takenBy &&
          currentUser &&
          service.takenBy === (currentUser.name || currentUser.email) &&
          service.takenById !== currentUser._id
        ) {
          service.takenById = currentUser._id;
        }
        return service;
      });
      this.$store.state.services.splice(
        0,
        this.$store.state.services.length,
        ...services
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
          currentUserId: currentUser._id,
          currentUserRole: currentUser.role,
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
      const currentUser = this.$store.state.currentUser;
      if (!currentUser) return;
      this.services[index].backgroundColor = "#ffcccc"; // rojo claro
      this.services[index].editingDetails = true;
      this.services[index].detailsDraft = this.services[index].details;
      this.$nextTick(() => {
        const inputs = this.$refs.detailsInput;
        if (Array.isArray(inputs)) {
          if (inputs[index]) inputs[index].focus();
        } else if (inputs && typeof inputs.focus === "function") {
          inputs.focus();
        }
      });
    },
    markAsFinalized(index) {
      const currentUser = this.$store.state.currentUser;
      if (!currentUser) return;
      this.services[index].backgroundColor = "lightblue";
      axios
        .put(`http://localhost:5000/api/services/${this.services[index]._id}`, {
          backgroundColor: "lightblue",
          currentUserId: currentUser._id,
          currentUserRole: currentUser.role,
        })
        .then((res) => {
          Object.assign(this.services[index], res.data);
        });
    },
    sendToClosed(index) {
      const closedService = this.services.splice(index, 1)[0];
      this.$store.commit("addClosedService", closedService);
    },
    editDetails(index) {
      this.services[index].editingDetails = true;
      this.services[index].detailsDraft = this.services[index].details;
      this.$nextTick(() => {
        const inputs = this.$refs.detailsInput;
        if (Array.isArray(inputs)) {
          if (inputs[index]) inputs[index].focus();
        } else if (inputs && typeof inputs.focus === "function") {
          inputs.focus();
        }
      });
    },
    saveDetails(index) {
      const currentUser = this.$store.state.currentUser;
      const newDetails = this.services[index].detailsDraft.trim();
      if (newDetails) {
        this.services[index].details = newDetails;
        this.services[index].editingDetails = false;
        // Guardar en backend y persistir el color rojo claro
        axios
          .put(
            `http://localhost:5000/api/services/${this.services[index]._id}`,
            {
              details: newDetails,
              backgroundColor: "#ffcccc",
              currentUserId: currentUser._id,
              currentUserRole: currentUser.role,
            }
          )
          .then((res) => {
            Object.assign(this.services[index], res.data);
          });
      }
    },
    cancelEditDetails(index) {
      this.services[index].editingDetails = false;
      this.services[index].detailsDraft = "";
    },
    canEditDetails(service) {
      const currentUser = this.$store.state.currentUser;
      return (
        currentUser &&
        (service.takenById === currentUser._id ||
          currentUser.role === "administrador")
      );
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
    canDeleteService(service) {
      const currentUser = this.$store.state.currentUser;
      return currentUser && currentUser.role === "administrador";
    },
    deleteService(index) {
      const currentUser = this.$store.state.currentUser;
      // Cambia la validación para usar el rol, no isAdmin
      if (!currentUser || currentUser.role !== "administrador") {
        alert("Solo un administrador puede eliminar servicios.");
        return;
      }
      const serviceId = this.services[index]._id;
      if (confirm("¿Estás seguro de que deseas eliminar este servicio?")) {
        axios
          .delete(`http://localhost:5000/api/services/${serviceId}`)
          .then(() => {
            this.services.splice(index, 1);
          })
          .catch(() => {
            alert("Error al eliminar el servicio");
          });
      }
    },
    onClienteCerro(index, updatedService) {
      // Actualiza el servicio en la lista tras cierre por cliente
      Object.assign(this.services[index], updatedService);
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
.btn-eliminar {
  background-color: #e53935;
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
