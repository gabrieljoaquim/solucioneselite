<template>
  <div class="profile">
    <h1>Perfil del Trabajador</h1>
    <form @submit.prevent="updateProfile">
      <div>
        <label for="phone">Teléfono:</label>
        <input type="text" id="phone" v-model="profile.phone" required />
      </div>
      <div>
        <label for="address">Dirección:</label>
        <input type="text" id="address" v-model="profile.address" required />
      </div>
      <SpecialtySelector :specialties.sync="profile.specialty" />
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
import { db } from "@/firebase/firebaseConfig";
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
      },
    };
  },
  methods: {
    onFileChange(event) {
      const file = event.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          this.profile.picture = e.target.result;
        };
        reader.readAsDataURL(file);
      }
    },
    async updateProfile() {
      try {
        const userId = this.$store.state.currentUser.uid;
        await setDoc(doc(db, "users", userId), this.profile, { merge: true });
        alert("Perfil actualizado con éxito");
      } catch (error) {
        alert("Error al actualizar el perfil: " + error.message);
      }
    },
  },
  async mounted() {
    try {
      const userId = this.$store.state.currentUser.uid;
      const docRef = doc(db, "users", userId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        this.profile = { ...this.profile, ...docSnap.data() };
      }
    } catch (error) {
      alert("Error al cargar el perfil: " + error.message);
    }
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
