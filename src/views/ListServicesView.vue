<template>
  <div class="list-services">
    <h1>Lista de Servicios</h1>
    <div v-if="errorMsg" class="no-services-msg">
      {{ errorMsg }}
    </div>
    <div v-else-if="services.length === 0" class="no-services-msg">
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
          Tomado por:
          <span
            :class="{
              'yo-activo':
                $store.state.currentUser &&
                service.takenById === $store.state.currentUser._id,
            }"
          >
            {{ service.takenBy }}
          </span>
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
          <p v-if="service.puntoVentaCodigo">
            <strong>Dirección:</strong>
            <GoogleMapsLink :code="service.puntoVentaCodigo" />
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
          <button
            class="btn-chat"
            @click="goToChat(service)"
            style="background-color: #117e2c; color: #fff; margin-left: 0"
          >
            Chat
          </button>

          <ServicePhotoUploader :service-id="service._id" />
          <GenerateServicePDF :service="service" />
        </div>
      </li>
    </ul>
  </div>
</template>

<script>
import ServicePriceEditor from "../components/ServicePriceEditor.vue";
import GenerateServicePDF from "../components/GenerateServicePDF.vue";
import api from "../axios";
import GoogleMapsLink from "../components/GoogleMapsLink.vue";
import ServicePhotoUploader from "../components/ServicePhotoUploader.vue";
import PdfNameDisplay from "../components/PdfNameDisplay.vue";

export default {
  components: {
    ServicePriceEditor,
    GoogleMapsLink,
    ServicePhotoUploader,
    PdfNameDisplay,
    GenerateServicePDF,
  },
  data() {
    return {
      errorMsg: "",
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
  mounted() {
    api
      .get("/api/services")
      .then((res) => {
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
      })
      .catch((err) => {
        // Manejo de error de red o CORS
        this.$store.state.services.splice(0, this.$store.state.services.length);
        this.errorMsg =
          (err.response &&
            (err.response.data?.error || err.response.data?.message)) ||
          (err.message
            ? `Error de red: ${err.message}`
            : "No se pudieron cargar los servicios. Verifica la conexión con el backend.");
      });
  },
  methods: {
    async goToChat(service) {
      const currentUser = this.$store.state.currentUser;
      if (!currentUser) {
        alert("Debes iniciar sesión para usar el chat.");
        return;
      }
      let otherUserId = null;
      if (currentUser.role === "cliente") {
        // Chat with worker (takenById)
        otherUserId = service.takenById;
        if (!otherUserId) {
          alert("El servicio aún no ha sido tomado por un trabajador.");
          return;
        }
      } else if (currentUser.role === "trabajador") {
        // Chat with client (usar solo registranteId)
        otherUserId = service.registranteId;
        if (!otherUserId) {
          alert(
            "No se pudo determinar el cliente para este servicio. (Falta registranteId)"
          );
          return;
        }
      } else if (currentUser.role === "administrador") {
        alert("El chat solo está disponible para clientes y trabajadores.");
        return;
      }
      this.$router.push({ name: "chat-user", params: { userId: otherUserId } });
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
    toggleDetails(index) {
      // Cierra todos los detalles excepto el seleccionado
      this.services.forEach((s, i) => {
        if (i !== index) s.showDetails = false;
      });
      // Alterna el seleccionado
      this.services[index].showDetails = !this.services[index].showDetails;
      this.$nextTick(() => {
        if (this.services[index].showDetails) {
          // Centra la vista en el servicio abierto
          const el = this.$refs["serviceItem" + index];
          if (el && el.scrollIntoView) {
            el.scrollIntoView({ behavior: "smooth", block: "center" });
          }
        }
      });
    },
    async markAsTaken(index) {
      const currentUser = this.$store.state.currentUser;
      if (!currentUser) {
        alert("Debes iniciar sesión para tomar un servicio.");
        return;
      }
      // NO actualices la UI localmente antes de la respuesta
      try {
        await api.put(
          `http://localhost:5000/api/services/${this.services[index]._id}`,
          {
            backgroundColor: "lightgreen",
            takenBy: currentUser.name || currentUser.email || currentUser._id,
            takenById: currentUser._id,
            takenByEmail: currentUser.email,
            currentUserId: currentUser._id,
            currentUserRole: currentUser.role,
          }
        );
        // Refresca toda la lista de servicios para forzar reactividad
        const refreshed = await api.get("/api/services");
        this.$store.state.services.splice(
          0,
          this.$store.state.services.length,
          ...refreshed.data
        );
      } catch (err) {
        const msg =
          err.response?.data?.error ||
          err.response?.data?.message ||
          "Error al tomar el servicio";
        alert(msg);
      }
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
      // Log para depuración
      console.log("markAsFinalized PUT:", {
        backgroundColor: "lightblue",
        currentUserId: currentUser._id,
        currentUserRole: currentUser.role,
      });
      api
        .put(`/api/services/${this.services[index]._id}`, {
          backgroundColor: "lightblue",
          currentUserId: currentUser._id,
          currentUserRole: currentUser.role,
        })
        .then(async () => {
          // Refresca la lista tras marcar como terminado
          const refreshed = await api.get("/api/services");
          this.$store.state.services.splice(
            0,
            this.$store.state.services.length,
            ...refreshed.data
          );
        })
        .catch((err) => {
          alert(
            err.response?.data?.error ||
              err.response?.data?.message ||
              "Error al marcar como terminado"
          );
        });
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
    saveDetails(index) {
      const currentUser = this.$store.state.currentUser;
      if (!currentUser) {
        alert("Debes iniciar sesión.");
        return;
      }
      const newDetails = this.services[index].detailsDraft.trim();
      if (newDetails) {
        this.services[index].details = newDetails;
        this.services[index].editingDetails = false;
        // LOG para depuración
        console.log("saveDetails PUT:", {
          details: newDetails,
          backgroundColor: "#ffcccc",
          currentUserId: currentUser._id,
          currentUserRole: currentUser.role,
        });
        api
          .put(`/api/services/${this.services[index]._id}`, {
            details: newDetails,
            backgroundColor: "#ffcccc",
            currentUserId: currentUser._id,
            currentUserRole: currentUser.role,
          })
          .then((res) => {
            Object.assign(this.services[index], res.data);
          })
          .catch((err) => {
            alert(
              err.response?.data?.error ||
                err.response?.data?.message ||
                "Error al guardar detalles"
            );
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
    onAprobarPrecio(index) {
      const currentUser = this.$store.state.currentUser;
      if (!currentUser || currentUser.role !== "cliente") return;
      const aprobado = !!this.services[index].precioAprobado;
      api
        .put(`/api/services/${this.services[index]._id}`, {
          precioAprobado: aprobado,
          currentUserId: currentUser._id,
          currentUserRole: currentUser.role,
        })
        .then((res) => {
          // Actualiza también la fecha de aprobación en la UI
          this.services[index].precioAprobadoFecha =
            res.data.precioAprobadoFecha;
        })
        .catch((err) => {
          alert(
            err.response?.data?.error ||
              err.response?.data?.message ||
              "Error al actualizar aprobación de precio"
          );
          // Revertir en UI si falla
          this.services[index].precioAprobado = !aprobado;
        });
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
        api
          .delete(`/api/services/${serviceId}`)
          .then(() => {
            this.services.splice(index, 1);
          })
          .catch(() => {
            alert("Error al eliminar el servicio");
          });
      }
    },
    // onClienteCerro removed: client closure logic deleted
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
