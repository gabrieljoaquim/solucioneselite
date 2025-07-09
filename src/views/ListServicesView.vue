<template>
  <div class="list-services">
    <h1>Lista de Servicios</h1>
    <div v-if="errorMsg" class="no-services-msg">
      {{ errorMsg }}
    </div>
    <div v-else-if="services && services.length === 0" class="no-services-msg">
      No tienes servicios registrados. Si creaste un servicio con otro usuario,
      inicia sesión con ese usuario para verlo.
    </div>

    <ul>
      <li
        v-for="(service, index) in services"
        :key="index"
        :style="{ backgroundColor: service.backgroundColor || 'white' }"
        :ref="'serviceItem' + index"
      >
        <PdfNameDisplay
          v-if="service.pdfReferencia"
          :pdfName="service.pdfReferencia"
        />
        <span>{{ service.requester }} - {{ service.serviceType }}</span>
        <span v-if="service.takenBy" class="taken-by">
          <WorkerRating
            v-if="service.takenBy"
            :workerName="service.takenBy"
            :workerId="service.takenById"
            :currentUser="$store.state.currentUser"
            :serviceId="service._id"
            @rated="
              (data) => {
                /* Aquí puedes manejar la calificación, por ejemplo, enviarla al backend */
              }
            "
          />
        </span>
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
          <div
            v-if="service.observations && service.observations.trim()"
            class="observations-section"
          >
            <div class="observations-header">
              <strong>⚠️ OBSERVACIONES:</strong>
            </div>
            <div class="observations-content">
              {{ service.observations }}
            </div>
            <div v-if="service.observationAt" class="observations-date">
              Registrada el: {{ formatFecha(service.observationAt) }}
            </div>
          </div>
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

          <ServicePriceEditor
            v-if="canShowPriceEditor(service)"
            :precio="service.precio"
            :service-id="service._id"
            :current-user="$store.state.currentUser"
            :taken-by-id="service.takenById"
            @updated="(val) => (service.precio = val)"
          />
          <p v-if="service.puntoVentaCodigo">
            <strong>Código Punto de Venta:</strong>
            {{ service.puntoVentaCodigo }}
          </p>
          <p v-if="service.address">
            <strong>Dirección:</strong>
            <GoogleMapsLink :address="service.address" />
          </p>
          <p v-if="service.proveedorAsignado">
            <strong>Proveedor Asignado:</strong> {{ service.proveedorAsignado }}
          </p>
          <p v-if="service.nombreOficina">
            <strong>Nombre de Oficina:</strong> {{ service.nombreOficina }}
          </p>
          <div
            v-if="service.precio != null"
            style="display: flex; align-items: center; gap: 10px"
          >
            <strong>Precio:</strong> ${{ service.precio }}
            <label
              v-if="
                $store.state.currentUser &&
                $store.state.currentUser.role === 'cliente'
              "
            >
              <input
                type="checkbox"
                v-model="service.precioAprobado"
                @change="onAprobarPrecio(index)"
              />
              Apruebo el precio
            </label>

            <span
              v-else-if="service.precioAprobado"
              style="color: #4caf50; font-weight: bold"
            >
              Aprobado por el cliente
              <span
                v-if="service.precioAprobadoFecha"
                style="
                  font-weight: normal;
                  color: #333;
                  font-size: 0.95em;
                  margin-left: 8px;
                "
              >
                ({{ formatFecha(service.precioAprobadoFecha) }})
              </span>
            </span>

            <p v-if="service.status">
              <strong>Status:</strong> {{ service.status }}
            </p>
          </div>

          <div v-if="getObservations(service).length">
            <strong> Observaciones: </strong>
            <ul>
              <li v-for="(obs, i) in getObservations(service)" :key="i">
                {{ obs }}
              </li>
            </ul>
          </div>

          <ServiceStatusButtons
            :service="service"
            :canEdit="canEditDetails(service)"
            @mark-taken="markAsTaken(index)"
            @mark-observation="markWithObservation(index)"
            @mark-finalized="markAsFinalized(index)"
          />
          <AdminServiceControl :service="service" />
          <GenerateServicePDF
            v-if="
              $store.state.currentUser &&
              $store.state.currentUser.role === 'administrador'
            "
            :service="service"
          />
        </div>
      </li>
    </ul>
  </div>
</template>

<script>
import ServicePriceEditor from "../components/ServicePriceEditor.vue";
import GenerateServicePDF from "../components/GenerateServicePDF.vue";
import GoogleMapsLink from "../components/GoogleMapsLink.vue";
import PdfNameDisplay from "../components/PdfNameDisplay.vue";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/firebase/firebaseConfig";
import { doc, deleteDoc } from "firebase/firestore";
import ServiceStatusButtons from "../components/ServiceStatusButtons.vue";
import AdminServiceControl from "../components/AdminServiceControl.vue";
import WorkerRating from "../components/WorkerRating.vue";
import { getIdToken } from "@/firebase/auth";
import api from "@/api";

export default {
  components: {
    ServicePriceEditor,
    GoogleMapsLink,
    PdfNameDisplay,
    GenerateServicePDF,
    ServiceStatusButtons,
    AdminServiceControl,
    WorkerRating,
  },
  data() {
    return {
      errorMsg: null,
    };
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
      // Cliente: solo ve los servicios donde él es el registrante
      return this.$store.state.services.filter(
        (service) =>
          service.registrante === (currentUser.name || currentUser.email)
      );
    },
  },
  methods: {
    async fetchServices() {
      try {
        const response = await api.get("/services");
        const services = response.data;
        this.$store.commit("setServices", services);
        console.log("Servicios desde backend:", services);
      } catch (error) {
        this.errorMsg =
          "Error al cargar los servicios: " +
          (error.response?.data?.error || error.message);
      }
    },
    toggleDetails(index) {
      this.services.forEach((service, i) => {
        service.showDetails = i === index ? !service.showDetails : false;
      });
    },
    canShowPriceEditor(service) {
      const user = this.$store.state.currentUser;
      if (!user) return false;
      // Solo mostrar si el usuario es admin o trabajador asignado Y el servicio ya fue tomado
      if (user.role === "administrador") return true;
      if (user.role === "trabajador" && service.takenById === user._id)
        return true;
      return false;
    },
    markAsCompleted(index) {
      this.services[index].backgroundColor = "lightyellow";
    },

    // sendToClosed removed: client closure logic deleted
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
    async saveDetails(index) {
      const currentUser = this.$store.state.currentUser;
      if (!currentUser) {
        alert("Debes iniciar sesión.");
        return;
      }

      const newDetails = this.services[index].detailsDraft.trim();
      if (!newDetails) {
        alert("La descripción no puede estar vacía.");
        return;
      }

      try {
        this.services[index].details = newDetails;
        this.services[index].editingDetails = false;

        const response = await api.put(
          `/services/${this.services[index]._id}`,
          {
            details: newDetails,
            backgroundColor: "#ffcccc",
            currentUserId: currentUser._id,
            currentUserRole: currentUser.role,
          }
        );
        Object.assign(this.services[index], response.data);
      } catch (error) {
        alert(
          "Error al guardar detalles: " +
            (error.response?.data?.error || error.message)
        );
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
    async onAprobarPrecio(index) {
      const currentUser = this.$store.state.currentUser;
      if (!currentUser || currentUser.role !== "cliente") return;

      const aprobado = !!this.services[index].precioAprobado;

      try {
        const response = await api.put(
          `/services/${this.services[index]._id}`,
          {
            precioAprobado: aprobado,
            currentUserId: currentUser._id,
            currentUserRole: currentUser.role,
          }
        );
        this.services[index].precioAprobadoFecha =
          response.data.precioAprobadoFecha;
      } catch (err) {
        alert(
          "Error al actualizar aprobación de precio: " +
            (err.response?.data?.error || err.message)
        );
        this.services[index].precioAprobado = !aprobado;
      }
    },
    formatFecha(fecha) {
      if (!fecha) return "";
      const d = new Date(fecha);
      return (
        d.toLocaleDateString() +
        " " +
        d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      );
    },
    // Actualizar este método en ListServices.vue
    getObservations(service) {
      // Ahora las observaciones se muestran en su propia sección
      // Este método puede ser usado para observaciones adicionales si es necesario

      // Si hay observaciones múltiples (historial), devolver como array
      if (Array.isArray(service.observationsHistory)) {
        return service.observationsHistory;
      }

      // Para compatibilidad con versiones anteriores
      if (
        typeof service.observations === "string" &&
        service.observations.trim() !== ""
      ) {
        return [service.observations];
      }

      return [];
    },
    canDeleteService(service) {
      const currentUser = this.$store.state.currentUser;
      return currentUser && currentUser.role === "administrador";
    },

    async deleteService(index) {
      const service = this.services[index];
      if (
        !confirm(
          `¿Estás seguro de eliminar el servicio de ${service.requester}?`
        )
      ) {
        return;
      }
      try {
        await api.delete(`/services/${service._id}`);
        this.services.splice(index, 1);
        alert("Servicio eliminado exitosamente.");
      } catch (error) {
        alert(
          "Error al eliminar el servicio: " +
            (error.response?.data?.error || error.message)
        );
      }
    },
  },
  async mounted() {
    await this.fetchServices();
  },
};
</script>

<style scoped>
.no-services-msg {
  color: #d32f2f;
  background: #fff3f3;
  border: 1px solid #f8bbbb;
  padding: 12px;
  border-radius: 6px;
  margin-bottom: 18px;
  text-align: center;
}
.info-msg {
  color: #0288d1;
  background: #e1f5fe;
  border: 1px solid #b3e5fc;
  padding: 8px;
  border-radius: 4px;
  margin-top: 10px;
  margin-bottom: 10px;
}
.list-services {
  max-width: 600px;
  margin: 0 auto;
}
/* Agregar estos estilos al <style scoped> de ListServices.vue */

.observations-section {
  background-color: #ffebee;
  border: 2px solid #e57373;
  border-radius: 8px;
  padding: 12px;
  margin: 10px 0;
  box-shadow: 0 2px 4px rgba(229, 115, 115, 0.2);
}

.observations-header {
  color: #c62828;
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.observations-content {
  color: #d32f2f;
  font-size: 14px;
  line-height: 1.4;
  background-color: #ffcdd2;
  padding: 8px;
  border-radius: 4px;
  border-left: 4px solid #f44336;
  margin-bottom: 8px;
}

.observations-date {
  color: #666;
  font-size: 12px;
  font-style: italic;
  text-align: right;
}

/* Efecto de pulso para llamar más la atención */
.observations-section {
  animation: pulse-red 2s infinite;
}

@keyframes pulse-red {
  0% {
    box-shadow: 0 2px 4px rgba(229, 115, 115, 0.2);
  }
  50% {
    box-shadow: 0 4px 8px rgba(229, 115, 115, 0.4);
  }
  100% {
    box-shadow: 0 2px 4px rgba(229, 115, 115, 0.2);
  }
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
.yo-activo {
  color: #fff;
  background: #2196f3;
  font-weight: bold;
  font-size: 1.2em;
  padding: 2px 10px;
  border-radius: 8px;
  margin-left: 6px;
}
.yo-terminado {
  color: #fff;
  background: #4caf50;
  font-weight: bold;
  font-size: 1.1em;
  padding: 2px 10px;
  border-radius: 8px;
  margin-left: 6px;
}
</style>
