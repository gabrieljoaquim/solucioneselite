<template>
  <div class="specialty-selector">
    <label for="specialty">Especialidad:</label>
    <select id="specialty" v-model="selectedSpecialty">
      <option disabled value="">Selecciona una especialidad</option>
      <option
        v-for="specialty in availableSpecialties"
        :key="specialty"
        :value="specialty"
        @click="addSpecialty(specialty)"
      >
        {{ specialty }}
      </option>
    </select>

    <div class="specialty-list">
      <div
        v-for="(specialty, index) in specialties"
        :key="index"
        class="specialty-item"
      >
        <span>{{ specialty }}</span>
        <button @click="removeSpecialty(index)">Eliminar</button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    specialties: {
      type: Array,
      required: true,
    },
  },
  data() {
    return {
      selectedSpecialty: "",
      availableSpecialties: [
        "pintura",
        "plomeria",
        "electricidad",
        "driwall",
        "enchapes",
        "cocinas",
        "ventanerias",
        "calentadores",
        "puertas",
        "pisosPVC",
        "otros",
      ],
    };
  },
  methods: {
    addSpecialty(specialty) {
      if (!this.specialties.includes(specialty)) {
        this.$emit("update:specialties", [...this.specialties, specialty]);
      }
    },
    removeSpecialty(index) {
      const updatedSpecialties = [...this.specialties];
      updatedSpecialties.splice(index, 1);
      this.$emit("update:specialties", updatedSpecialties);
    },
  },
};
</script>

<style scoped>
.specialty-selector {
  margin-bottom: 15px;
}
.specialty-list {
  margin-top: 10px;
}
.specialty-item {
  display: flex;
  align-items: center;
  margin-bottom: 5px;
}
.specialty-item span {
  margin-right: 10px;
}
.specialty-item button {
  background-color: #ff4d4d;
  color: white;
  border: none;
  border-radius: 3px;
  padding: 5px 10px;
  cursor: pointer;
}
.specialty-item button:hover {
  background-color: #cc0000;
}
</style>
