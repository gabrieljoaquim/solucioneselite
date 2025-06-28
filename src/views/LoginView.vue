<template>
  <div class="login">
    <h1>Iniciar Sesión</h1>
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
      <button type="button" @click="forgotPassword">
        ¿Olvidaste tu contraseña?
      </button>
    </form>
  </div>
</template>

<script>
import { loginWithEmail } from "@/firebase/auth";
import { getOrCreateDeviceId } from "@/utils/device"; // <- Ajusta si la ruta es diferente
import { getFirestore, doc, getDoc } from "firebase/firestore";

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
        const user = await loginWithEmail(
          this.credentials.email,
          this.credentials.password
        );

        // 1. Obtener el role desde Firestore
        const db = getFirestore();
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);

        if (!userSnap.exists()) {
          throw new Error(
            "El usuario no tiene un perfil registrado en Firestore."
          );
        }

        const userData = userSnap.data();
        const role = userData.role || "cliente"; // por defecto "cliente"

        // 2. Obtener deviceId
        const deviceId = getOrCreateDeviceId();

        // 3. Guardar todo en localStorage
        localStorage.setItem(
          "session",
          JSON.stringify({
            userId: user.uid,
            email: user.email,
            role: role,
            deviceId: deviceId,
          })
        );

        // 4. Guardar en el store de Vuex
        this.$store.commit("setCurrentUser", {
          uid: user.uid,
          email: user.email,
          role: role,
        });

        alert(`Bienvenido, ${user.email}`);
        this.$router.push({ name: "home" });
      } catch (error) {
        alert("Error al iniciar sesión: " + error.message);
      }
    },
    forgotPassword() {
      alert("Se ha enviado un enlace de recuperación a su correo electrónico.");
      // Aquí puedes implementar la lógica para enviar un correo de recuperación
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
</style>
