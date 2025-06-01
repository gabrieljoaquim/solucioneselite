<template>
  <div class="login">
    <h1>Iniciar Sesión</h1>
    <div>
      <form @submit.prevent="loginUser">
        <div>
          <label for="email">Correo Electrónico:</label>
          <input type="email" id="email" v-model="credentials.email" required />
        </div>
        <div>
          <label for="password">Contraseña:</label>
          <input
            type="password"
            id="password"
            v-model="credentials.password"
            required
          />
        </div>
        <button type="submit">Iniciar Sesión</button>
      </form>
    </div>
    <div>
      <button class="ReClav" type="button" @click="forgotPassword">
        ¿Olvidaste tu contraseña?
      </button>
    </div>
  </div>
</template>

<script>
import api from "../axios";

export default {
  data() {
    return {
      credentials: {
        email: "",
        password: "",
      },
    };
  },
  methods: {
    async loginUser() {
      try {
        const response = await api.post("/api/users/login", this.credentials);
        // Guardar usuario en el store
        this.$store.commit("setCurrentUser", response.data);
        // Redirigir siempre al home después de iniciar sesión
        this.$router.push({ name: "home" });
      } catch (err) {
        alert(err.response?.data?.error || "Credenciales incorrectas");
      }
    },
    forgotPassword() {
      this.$router.push({ name: "forgot-password" });
    },
  },
};
</script>

<style scoped>
.login {
  max-width: 400px;
  margin: 0 auto;
  padding: 20px;
  border: 1px solid #ccc;
  border-radius: 5px;
  background-color: #f9f9f9;
}
.login h1 {
  text-align: center;
  margin-bottom: 20px;
}
.login form div {
  margin-bottom: 15px;
}
.login form label {
  display: block;
  margin-bottom: 5px;
}
.login form input {
  width: 100%;
  padding: 8px;
  box-sizing: border-box;
}
.login form button {
  width: 100%;
  padding: 10px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}
.login form button:hover {
  background-color: #0056b3;
}
.ReClav {
  margin-top: 10px;
  background-color: transparent;
  border: none;
  color: #007bff;
  cursor: pointer;
  text-decoration: underline;
}
</style>
