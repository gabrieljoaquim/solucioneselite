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
import axios from "axios";

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
        const response = await axios.post(
          "http://localhost:5000/api/users/login",
          this.credentials
        );
        alert(`Bienvenido, ${response.data.name}`);
        // Guardar usuario en el store
        this.$store.commit("setCurrentUser", response.data);
        // Verificar datos de contacto
        if (!response.data.phone || !response.data.address) {
          alert("Por favor, agrega tus datos de contacto en tu perfil.");
          this.$router.push({ name: "profile" });
        } else {
          this.$router.push({ name: "home" });
        }
      } catch (err) {
        alert(err.response?.data?.error || "Credenciales incorrectas");
      }
    },
    forgotPassword() {
      alert("Se ha enviado un enlace de recuperación a su correo electrónico.");
      // Logic to send a password recovery email can be added here
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
