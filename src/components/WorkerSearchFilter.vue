<template>
  <div class="worker-search-filter">
    <h3>Buscar trabajadores</h3>
    <form @submit.prevent="$emit('search', { city, specialty, zone })">
      <div>
        <label>Ciudad:</label>
        <input v-model="city" placeholder="Ciudad" />
      </div>
      <div>
        <label>Especialidad:</label>
        <input v-model="specialty" placeholder="Especialidad" />
      </div>
      <div>
        <label>Zona/Barrio:</label>
        <input v-model="zone" placeholder="Zona o barrio" />
      </div>
      <button type="submit">Buscar</button>
    </form>
  </div>
</template>

<script>
export default {
  data() {
    return {
      city: "",
      specialty: "",
      zone: "",
    };
  },
};
</script>

<style scoped>
.worker-search-filter {
  border: 1px solid #ccc;
  border-radius: 8px;
  padding: 18px;
  max-width: 400px;
  margin: 0 auto 18px auto;
  background: #fafbfc;
}
</style>
