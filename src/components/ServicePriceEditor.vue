<template>
  <span>
    <b>Precio:</b>
    <template v-if="canEdit">
      <input
        v-model.number="precioDraft"
        type="number"
        min="0"
        step="0.01"
        style="width: 100px; margin-left: 8px"
      />
      <button @click="savePrecio">Guardar</button>
      <button @click="resetPrecio">Cancelar</button>
    </template>
    <template v-else>
      {{ precio != null ? "$" + precio : "Sin asignar" }}
    </template>
  </span>
</template>

<script setup>
import { ref, computed, watch } from "vue";
import axios from "axios";

const props = defineProps({
  precio: Number,
  serviceId: String,
  currentUser: Object,
  takenById: String,
});
const emit = defineEmits(["updated"]);

const precioDraft = ref(props.precio);
watch(
  () => props.precio,
  (val) => {
    precioDraft.value = val;
  }
);

const canEdit = computed(() => {
  return (
    props.currentUser &&
    (props.currentUser.role === "administrador" ||
      (props.currentUser.role === "trabajador" &&
        props.takenById === props.currentUser._id))
  );
});

async function savePrecio() {
  // console.log("[DEBUG] Intentando guardar precio", {
  //   serviceId: props.serviceId,
  //   precio: precioDraft.value,
  //   currentUser: props.currentUser,
  //   takenById: props.takenById,
  // });
  try {
    await api.put(`/api/services/${props.serviceId}`, {
      precio: precioDraft.value,
      currentUserId: props.currentUser._id,
      currentUserRole: props.currentUser.role,
    });
    emit("updated", precioDraft.value);
  } catch (err) {
    alert(
      "Error al guardar el precio: " +
        (err.response?.data?.error || err.message)
    );
    // console.error("[ERROR] Guardando precio", err);
  }
}
function resetPrecio() {
  precioDraft.value = props.precio;
}
</script>
