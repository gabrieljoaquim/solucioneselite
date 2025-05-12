<template>
  <div class="register">
    <h1>Registro de Usuario</h1>
    <form @submit.prevent="registerUser">
      <div>
        <label for="name">Nombre:</label>
        <input type="text" id="name" v-model="user.name" required />
      </div>
      <div>
        <label for="email">Correo Electrónico:</label>
        <input type="email" id="email" v-model="user.email" required />
      </div>
      <div>
        <label for="password">Contraseña:</label>
        <input type="password" id="password" v-model="user.password" required />
      </div>
      <div>
        <label for="confirmPassword">Confirmar Contraseña:</label>
        <input
          type="password"
          id="confirmPassword"
          v-model="user.confirmPassword"
          required
        />
      </div>
      <div>
        <label for="role">Rol:</label>
        <select id="role" v-model="user.role" required>
          <option value="cliente">Cliente</option>
          <option value="trabajador">Trabajador</option>
          <option value="administrador">Administrador</option>
        </select>
      </div>
      <button type="submit">Registrarse</button>
    </form>
  </div>
</template>

<script>
import axios from "axios";

export default {
  data() {
    return {
      user: {
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
        role: "cliente",
      },
    };
  },
  methods: {
    registerUser() {
      if (this.user.password !== this.user.confirmPassword) {
        alert("Las contraseñas no coinciden");
        return;
      }
      const userToSend = {
        name: this.user.name,
        email: this.user.email,
        password: this.user.password,
      };
      axios
        .post("http://localhost:5000/api/users", userToSend)
        .then(() => {
          alert("Usuario registrado con éxito");
          this.user = {
            name: "",
            email: "",
            password: "",
            confirmPassword: "",
            role: "cliente",
          };
        })
        .catch((err) => {
          if (err.response?.data?.error?.includes("duplicate key")) {
            alert("El correo ya está registrado, intenta con otro.");
          } else {
            alert(
              "Error al registrar usuario: " +
                (err.response?.data?.error || err.message)
            );
          }
        });
    },
  },
};
</script>

<style scoped>
.register {
  max-width: 400px;
  margin: 0 auto;
  padding: 20px;
  border: 1px solid #ccc;
  border-radius: 5px;
  background-color: #f9f9f9;
}
.register h1 {
  text-align: center;
  margin-bottom: 20px;
}
.register form div {
  margin-bottom: 15px;
}
.register form label {
  display: block;
  margin-bottom: 5px;
}
.register form input,
.register form select {
  width: 100%;
  padding: 8px;
  box-sizing: border-box;
}
.register form button {
  width: 100%;
  padding: 10px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}
.register form button:hover {
  background-color: #0056b3;
}
</style>
