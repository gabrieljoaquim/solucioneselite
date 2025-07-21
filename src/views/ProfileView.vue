<template>
  <div class="profile">
    <h1>Perfil del Trabajador</h1>
    <p v-if="currentUser">Hola {{ currentUser.email }}</p>
    <form @submit.prevent="updateProfile">
      <div>
        <label for="phone">Teléfono:</label>
        <input type="text" id="phone" v-model="profile.phone" required />
      </div>

      <div>
        <label for="address">Dirección:</label>
        <input type="text" id="address" v-model="profile.address" required />
      </div>

      <SpecialtySelector v-model:especialidades="profile.specialty" />

      <div>
        <label for="profilePicture">Foto de Perfil:</label>
        <input type="file" id="profilePicture" @change="onFileChange" />
      </div>

      <div>
        <label for="experience">Años de Experiencia:</label>
        <input
          type="number"
          id="experience"
          v-model="profile.experience"
          min="0"
          required
        />
      </div>

      <div v-if="currentUser && currentUser.role === 'admin'">
        <label for="role">Rol:</label>
        <select id="role" v-model="profile.role" required>
          <option value="cliente">Cliente</option>
          <option value="trabajador">Trabajador</option>
          <option value="admin">Administrador</option>
        </select>
      </div>

      <div>
        <label for="description">Descripción:</label>
        <textarea
          id="description"
          v-model="profile.description"
          rows="4"
          placeholder="Describe tus habilidades y experiencia"
        ></textarea>
      </div>

      <button type="submit">Actualizar Perfil</button>
    </form>

    <div v-if="profile.picture">
      <h2>Vista Previa de la Foto:</h2>
      <img
        :src="profile.picture"
        alt="Foto de Perfil"
        style="max-width: 200px"
      />
    </div>
  </div>
</template>

<script>
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db, storage } from "@/firebase/firebaseConfig";
import {
  ref as storageRef,
  uploadBytes,
  getDownloadURL,
} from "firebase/storage";
import SpecialtySelector from "@/components/SpecialtySelector.vue";

export default {
  components: {
    SpecialtySelector,
  },
  data() {
    return {
      profile: {
        phone: "",
        address: "",
        specialty: [],
        picture: null,
        experience: 0,
        description: "",
        role: "cliente",
      },
    };
  },
  computed: {
    currentUser() {
      return this.$store.state.currentUser;
    },
  },
  methods: {
    async onFileChange(event) {
      const file = event.target.files[0];
      if (!file) return;

      const userId = this.currentUser.uid;
      const pathRef = storageRef(
        storage,
        `profilePictures/${userId}/${file.name}`
      );

      try {
        const snapshot = await uploadBytes(pathRef, file);
        const url = await getDownloadURL(snapshot.ref);
        this.profile.picture = url;
      } catch (error) {
        alert("Error al subir la imagen: " + error.message);
      }
    },

    async updateProfile() {
      if (!this.currentUser) {
        alert("Debes iniciar sesión.");
        return;
      }

      try {
        const userId = this.currentUser.uid;
        await setDoc(doc(db, "users", userId), this.profile, { merge: true });
        alert("Perfil actualizado exitosamente.");
      } catch (error) {
        alert("Error al guardar perfil: " + error.message);
      }
    },

    async cargarDatos() {
      try {
        const userId = this.currentUser.uid;
        const userDoc = await getDoc(doc(db, "users", userId));
        if (userDoc.exists()) {
          this.profile = { ...this.profile, ...userDoc.data() };
        }
      } catch (error) {
        alert("Error al cargar el perfil: " + error.message);
      }
    },
  },
  async mounted() {
    // Esperar hasta que el usuario esté disponible
    const waitForUser = () => {
      return new Promise((resolve) => {
        const check = () => {
          const user = this.currentUser;
          if (user && user.uid) resolve(user);
          else setTimeout(check, 100);
        };
        check();
      });
    };

    await waitForUser();
    await this.cargarDatos();
  },
};
</script>

<style scoped>
.profile {
  max-width: 400px;
  margin: 0 auto;
  padding: 20px;
  border: 1px solid #ccc;
  border-radius: 5px;
  background-color: #f9f9f9;
}
.profile h1 {
  text-align: center;
  margin-bottom: 20px;
}
.profile form div {
  margin-bottom: 15px;
}
.profile form label {
  display: block;
  margin-bottom: 5px;
}
.profile form input,
.profile form select,
.profile form textarea {
  width: 100%;
  padding: 8px;
  box-sizing: border-box;
}
.profile form button {
  width: 100%;
  padding: 10px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}
.profile form button:hover {
  background-color: #0056b3;
}
.profile img {
  display: block;
  margin: 10px auto;
  border: 1px solid #ccc;
  border-radius: 5px;
}
</style>
