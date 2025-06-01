<template>
  <div class="verification-upload">
    <h3>Subir documentos de verificación</h3>
    <form @submit.prevent="submitDocument">
      <div>
        <label>Tipo de documento:</label>
        <select v-model="type" required>
          <option value="cedula">Cédula</option>
          <option value="rut">RUT</option>
          <option value="certificacion">Certificación técnica</option>
        </select>
      </div>
      <div>
        <label>Archivo:</label>
        <input type="file" @change="onFileChange" required />
      </div>
      <button type="submit">Subir</button>
    </form>
    <div v-if="success" class="success-msg">¡Documento enviado!</div>
    <div v-if="error" class="error-msg">{{ error }}</div>
  </div>
</template>

<script>
import axios from "axios";
export default {
  props: {
    workerId: { type: String, required: true },
  },
  data() {
    return {
      type: "cedula",
      file: null,
      success: false,
      error: "",
    };
  },
  methods: {
    onFileChange(e) {
      this.file = e.target.files[0];
    },
    async submitDocument() {
      this.success = false;
      this.error = "";
      if (!this.file) {
        this.error = "Selecciona un archivo";
        return;
      }
      // Simulación: en producción, subirías el archivo y obtendrías una URL
      const url = URL.createObjectURL(this.file); // Solo demo
      try {
        await api.post("/api/verification/upload", {
          worker: this.workerId,
          type: this.type,
          url,
        });
        this.success = true;
        this.type = "cedula";
        this.file = null;
      } catch (e) {
        this.error = e.response?.data?.error || "Error al subir documento";
      }
    },
  },
};
</script>

<style scoped>
.verification-upload {
  border: 1px solid #ccc;
  border-radius: 8px;
  padding: 18px;
  max-width: 400px;
  margin: 0 auto 18px auto;
  background: #fafbfc;
}
.success-msg {
  color: #388e3c;
  margin-top: 10px;
}
.error-msg {
  color: #d32f2f;
  margin-top: 10px;
}
</style>
