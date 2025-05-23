<template>
  <div class="services-board-view">
    <h1>Gestión Avanzada de Servicios</h1>
    <div class="services-list">
      <ServiceCardAdvanced
        v-for="service in services"
        :key="service._id"
        :service="service"
        :currentUser="currentUser"
        :isAdmin="isAdmin"
        @edit="editService"
        @delete="deleteService"
        @save-obs="saveObservations"
        @rate-worker="rateWorker"
        @rate-client="rateClient"
        @approve="approveService"
        @pay="payService"
      />
    </div>
    <div v-if="showEditModal">
      <!-- Aquí puedes poner un modal o formulario para edición avanzada -->
      <div class="modal-bg" @click="showEditModal = false"></div>
      <div class="modal-content">
        <h2>Editar Servicio</h2>
        <form @submit.prevent="saveEdit">
          <label
            >Tipo de servicio: <input v-model="editDraft.serviceType"
          /></label>
          <label>Estado: <input v-model="editDraft.status" /></label>
          <label>Etapa: <input v-model="editDraft.stage" /></label>
          <label>Ejecutante: <input v-model="editDraft.takenBy" /></label>
          <label
            >Observaciones: <input v-model="editDraft.observations"
          /></label>
          <label>Pago: <input v-model="editDraft.paymentStatus" /></label>
          <button type="submit">Guardar</button>
          <button type="button" @click="showEditModal = false">Cancelar</button>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import ServiceCardAdvanced from "../components/ServiceCardAdvanced.vue";
import axios from "axios";

const services = ref([]);
const currentUser = ref(JSON.parse(localStorage.getItem("currentUser")) || {});
const isAdmin = computed(() => currentUser.value.role === "administrador");

const showEditModal = ref(false);
const editDraft = ref({});

async function fetchServices() {
  // Ajusta la URL según tu backend
  const res = await axios.get("http://localhost:5000/api/services");
  services.value = res.data;
}
onMounted(fetchServices);

function editService(service) {
  if (!isAdmin.value) return;
  editDraft.value = { ...service };
  showEditModal.value = true;
}
function saveEdit() {
  // Lógica para guardar cambios (PUT al backend)
  axios
    .put(
      `http://localhost:5000/api/services/${editDraft.value._id}`,
      editDraft.value
    )
    .then(() => {
      showEditModal.value = false;
      fetchServices();
    });
}
function deleteService(service) {
  if (!isAdmin.value) return;
  axios
    .delete(`http://localhost:5000/api/services/${service._id}`)
    .then(fetchServices);
}
function saveObservations(service) {
  // Solo el cliente puede editar observaciones
  axios
    .put(`http://localhost:5000/api/services/${service._id}/observations`, {
      observations: service.observations,
    })
    .then(fetchServices);
}
function rateWorker(service) {
  // Lógica para calificar trabajador
  // Puedes abrir un modal para ingresar la calificación
}
function rateClient(service) {
  // Lógica para calificar cliente
}
function approveService(service) {
  // Lógica para aprobar servicio
  axios
    .put(`http://localhost:5000/api/services/${service._id}/approve`, {
      clientApproval: true,
    })
    .then(fetchServices);
}
function payService(service) {
  // Lógica para marcar como pagado
  axios
    .put(`http://localhost:5000/api/services/${service._id}/pay`, {
      paymentStatus: "Pagado",
    })
    .then(fetchServices);
}
</script>

<style scoped>
.services-board-view {
  width: 100vw;
  max-width: 100vw;
  padding: 0;
  margin: 0;
  background: #f7f7f7;
}
.services-list {
  width: 100vw;
  max-width: 100vw;
  display: flex;
  flex-direction: column;
  gap: 18px;
  align-items: center;
}
.modal-bg {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.3);
  z-index: 10;
}
.modal-content {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: #fff;
  padding: 32px;
  border-radius: 12px;
  z-index: 20;
  min-width: 320px;
}
</style>
