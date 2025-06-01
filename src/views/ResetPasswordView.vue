<template>
  <div class="reset-password-container">
    <div class="card">
      <h2 class="title">Restablecer contraseña</h2>
      <form @submit.prevent="handleResetPassword">
        <div class="form-group">
          <label for="password">Nueva contraseña</label>
          <input
            v-model="password"
            type="password"
            id="password"
            required
            placeholder="Nueva contraseña"
          />
        </div>
        <div class="form-group">
          <label for="confirm">Confirmar contraseña</label>
          <input
            v-model="confirm"
            type="password"
            id="confirm"
            required
            placeholder="Confirmar contraseña"
          />
        </div>
        <button type="submit" class="btn-primary" :disabled="loading">
          <span v-if="!loading">Actualizar contraseña</span>
          <span v-else>Actualizando...</span>
        </button>
        <div v-if="message" :class="['message', message.type]">
          {{ message.text }}
        </div>
      </form>
      <div class="footer-links">
        <router-link to="/login" class="link"
          >Volver a Iniciar Sesión</router-link
        >
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import api from "../axios";

const route = useRoute();
const router = useRouter();
const password = ref("");
const confirm = ref("");
const loading = ref(false);
const message = ref(null);

const handleResetPassword = async () => {
  if (password.value !== confirm.value) {
    message.value = { type: "error", text: "Las contraseñas no coinciden." };
    return;
  }
  loading.value = true;
  message.value = null;
  try {
    const res = await axios.post("/api/users/reset-password", {
      token: route.params.token,
      password: password.value,
    });
    message.value = {
      type: "success",
      text: "Contraseña actualizada correctamente.",
    };
    setTimeout(() => router.push("/login"), 2000);
  } catch (err) {
    message.value = {
      type: "error",
      text: err.response?.data?.error || "Error al actualizar la contraseña.",
    };
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.reset-password-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: #f5f5f5;
}
.card {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 400px;
}
.title {
  text-align: center;
  margin-bottom: 1.5rem;
}
.form-group {
  margin-bottom: 1rem;
}
.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
}
.form-group input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
}
.btn-primary {
  width: 100%;
  padding: 0.75rem;
  background-color: #42b983;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
  margin-top: 1rem;
}
.btn-primary:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}
.message {
  margin-top: 1rem;
  text-align: center;
}
.message.success {
  color: #388e3c;
}
.message.error {
  color: #d32f2f;
}
.footer-links {
  margin-top: 1.5rem;
  text-align: center;
}
.link {
  color: #42b983;
  text-decoration: underline;
}
</style>
