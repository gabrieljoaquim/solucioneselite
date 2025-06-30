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
      <button type="submit">Registrarse</button>
    </form>
  </div>
</template>

<script>
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "@/firebase/firebaseConfig";

export default {
  data() {
    return {
      user: {
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
        phone: "",
        zone: "",
        specialty: [],
        experience: 0,
        description: "",
        role: "cliente", // predeterminado (puedes cambiarlo si lo deseas)
        profilePhoto: "",
      },
    };
  },
  methods: {
    async registerUser() {
      if (!this.user.name || !this.user.email || !this.user.password) {
        alert("Por favor completa todos los campos requeridos.");
        return;
      }
      if (this.user.password !== this.user.confirmPassword) {
        alert("Las contraseñas no coinciden");
        return;
      }
      if (!this.user.email || !this.user.email.includes("@")) {
        alert("Por favor, ingresa un correo electrónico válido.");
        return;
      }
      try {
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          this.user.email,
          this.user.password
        );
        const userId = userCredential.user.uid;

        // Guardar información adicional en Firestore
        await setDoc(doc(db, "users", userId), {
          name: this.user.name,
          email: this.user.email,
          phone: this.user.phone,
          zone: this.user.zone,
          specialty: this.user.specialty,
          experience: this.user.experience,
          description: this.user.description,
          role: this.user.role, // predeterminado (puedes cambiarlo si lo deseas)
          profilePhoto: this.user.profilePhoto,
        });

        alert("Usuario registrado con éxito");
        this.$router.push({ name: "home" });
        // Limpiar campos
        this.user = {
          name: "",
          email: "",
          password: "",
          confirmPassword: "",
          phone: "",
          zone: "",
          specialty: [],
          experience: 0,
          description: "",
          role: "cliente",
          profilePhoto: "",
        };
      } catch (error) {
        alert("Error al registrar usuario: " + error.message);
        // Limpiar campos si hay error
        this.user.password = "";
        this.user.confirmPassword = "";
      }
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
.register form input {
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
