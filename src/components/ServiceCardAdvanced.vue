<template>
  <div class="service-card-adv" :class="{ 'admin-edit': isAdmin }">
    <div class="service-header">
      <div>
        <span class="service-type">{{ service.serviceType }}</span>
        <span class="service-status" :class="service.status">{{
          service.status
        }}</span>
      </div>
      <div class="service-actions">
        <button v-if="canEdit" @click="$emit('edit', service)">Editar</button>
        <button v-if="canDelete" @click="$emit('delete', service)">
          Eliminar
        </button>
      </div>
    </div>
    <div class="service-info">
      <div class="info-row">
        <span><b>Solicitante:</b> {{ service.requester }}</span>
        <span><b>Registrante:</b> {{ service.registrante }}</span>
      </div>
      <div class="info-row">
        <span><b>Ejecutante:</b> {{ service.takenBy || "Sin asignar" }}</span>
        <span><b>Fecha:</b> {{ service.reportDate }}</span>
      </div>
      <div class="info-row">
        <span><b>Dirección:</b> {{ service.address }}</span>
        <span><b>Teléfono:</b> {{ service.phone }}</span>
      </div>
      <div class="info-row">
        <span
          ><b>Observaciones:</b>
          <template v-if="canEditObservations">
            <input v-model="obsDraft" class="obs-input" />
            <button @click="saveObs">Guardar</button>
            <button @click="obsDraft = service.observations">Cancelar</button>
          </template>
          <template v-else>
            {{ service.observations || "N/A" }}
          </template>
        </span>
      </div>
      <div class="info-row">
        <span><b>Etapa:</b> {{ service.stage || "Sin etapa" }}</span>
        <span
          ><b>Duración estimada:</b>
          {{ service.estimatedDuration || "N/A" }}</span
        >
      </div>
      <div class="info-row">
        <span><b>Pago:</b> {{ service.paymentStatus || "Pendiente" }}</span>
        <span
          ><b>Aprobación cliente:</b>
          {{ service.clientApproval ? "Sí" : "No" }}</span
        >
      </div>
    </div>
    <div class="service-footer">
      <div class="ratings">
        <span v-if="service.workerRating">
          <b>Calificación al trabajador:</b> {{ service.workerRating }} ⭐
        </span>
        <span v-if="service.clientRating">
          <b>Calificación al cliente:</b> {{ service.clientRating }} ⭐
        </span>
      </div>
      <div class="footer-actions">
        <button v-if="canRateWorker" @click="$emit('rate-worker', service)">
          Calificar trabajador
        </button>
        <button v-if="canRateClient" @click="$emit('rate-client', service)">
          Calificar cliente
        </button>
        <button v-if="canApprove" @click="$emit('approve', service)">
          Aprobar servicio
        </button>
        <button v-if="canPay" @click="$emit('pay', service)">Pagar</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from "vue";
const props = defineProps({
  service: Object,
  currentUser: Object,
  isAdmin: Boolean,
});
const emit = defineEmits([
  "edit",
  "delete",
  "save-obs",
  "rate-worker",
  "rate-client",
  "approve",
  "pay",
]);

const obsDraft = ref(props.service.observations);
watch(
  () => props.service.observations,
  (val) => {
    obsDraft.value = val;
  }
);

const canEdit = computed(() => props.isAdmin);
const canDelete = computed(() => props.isAdmin);
const canEditObservations = computed(() => {
  return (
    props.currentUser &&
    props.currentUser.role === "cliente" &&
    props.service.registrante === props.currentUser.email
  );
});
const canRateWorker = computed(
  () =>
    props.currentUser &&
    props.currentUser.role === "cliente" &&
    props.service.takenBy &&
    !props.service.workerRating
);
const canRateClient = computed(
  () =>
    props.currentUser &&
    props.currentUser.role === "trabajador" &&
    props.service.requester &&
    !props.service.clientRating
);
const canApprove = computed(
  () =>
    props.currentUser &&
    props.currentUser.role === "cliente" &&
    !props.service.clientApproval &&
    props.service.status === "Terminado"
);
const canPay = computed(
  () =>
    props.currentUser &&
    props.currentUser.role === "cliente" &&
    props.service.clientApproval &&
    props.service.paymentStatus !== "Pagado"
);

function saveObs() {
  emit("save-obs", { ...props.service, observations: obsDraft.value });
}
</script>

<style scoped>
.service-card-adv {
  width: 100vw;
  max-width: 100vw;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  margin: 18px 0;
  padding: 18px 24px;
  font-size: 0.98em;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.service-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 1em;
}
.service-type {
  font-weight: bold;
  color: #117e2c;
  margin-right: 12px;
}
.service-status {
  font-size: 0.95em;
  padding: 2px 10px;
  border-radius: 8px;
  background: #e6f0ff;
  color: #117e2c;
  margin-left: 8px;
}
.service-status.Terminado {
  background: #d4edda;
  color: #388e3c;
}
.service-status.Pagado {
  background: #fff3cd;
  color: #856404;
}
.service-actions button {
  margin-left: 8px;
  font-size: 0.95em;
}
.service-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.info-row {
  display: flex;
  gap: 32px;
  font-size: 0.95em;
  margin-bottom: 2px;
}
.obs-input {
  font-size: 0.95em;
  padding: 2px 8px;
  border-radius: 4px;
  border: 1px solid #ccc;
  margin-right: 4px;
}
.service-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 8px;
}
.ratings span {
  margin-right: 18px;
  font-size: 0.95em;
}
.footer-actions button {
  margin-left: 8px;
  font-size: 0.95em;
}
.admin-edit {
  border: 2px solid #117e2c;
}
@media (max-width: 900px) {
  .service-card-adv {
    padding: 10px 2vw;
    font-size: 0.92em;
  }
  .info-row {
    flex-direction: column;
    gap: 2px;
  }
}
</style>
