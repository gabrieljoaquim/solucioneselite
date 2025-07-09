<template>
  <div class="pdf-header-config">
    <h1>Configuración del Membrete PDF</h1>

    <form @submit.prevent="guardarDatos">
      <div>
        <label>Nombre Comercial:</label>
        <input v-model="form.nombreComercial" type="text" required />
      </div>

      <div>
        <label>RUT:</label>
        <input v-model="form.rut" type="text" />
      </div>

      <div>
        <label>Eslogan:</label>
        <input v-model="form.eslogan" type="text" />
      </div>

      <div>
        <label>Teléfono:</label>
        <input v-model="form.telefono" type="text" required />
      </div>

      <div>
        <label>Email:</label>
        <input v-model="form.email" type="email" required />
      </div>

      <div>
        <label>Dirección:</label>
        <input v-model="form.direccion" type="text" required />
      </div>

      <div>
        <label>Logo de la empresa:</label>
        <input type="file" @change="subirLogo" />
      </div>

      <button type="submit">Guardar Membrete</button>
    </form>

    <!-- Previsualización del membrete -->
    <div class="preview">
      <h2>Previsualización</h2>
      <div class="membrete">
        <img v-if="form.logoUrl" :src="form.logoUrl" class="logo" />
        <div class="info">
          <h3>{{ form.nombreComercial }}</h3>
          <p>{{ form.eslogan }}</p>
          <p>Tel: {{ form.telefono }}</p>
          <p>Email: {{ form.email }}</p>
          <p>Dirección: {{ form.direccion }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { db, storage } from "@/firebase/firebaseConfig";
import {
  ref as storageRef,
  uploadBytes,
  getDownloadURL,
} from "firebase/storage";
import { doc, getDoc, setDoc } from "firebase/firestore";

export default {
  name: "PDFHeaderConfig",
  data() {
    return {
      userId: null,
      form: {
        nombreComercial: "",
        rut: "",
        eslogan: "",
        telefono: "",
        email: "",
        direccion: "",
        logoUrl: "",
      },
    };
  },
  async mounted() {
    const user = this.$store.state.currentUser;
    if (!user || user.role !== "administrador") {
      alert("Acceso no autorizado");
      this.$router.push("/"); // Redirige si no es admin
      return;
    }

    this.userId = user.uid;

    try {
      const userDoc = await getDoc(doc(db, "users", this.userId));
      if (userDoc.exists()) {
        const data = userDoc.data();
        this.form.nombreComercial =
          data.empresa?.nombreComercial || data.nombre || "";
        this.form.rut = data.empresa?.rut || "";
        this.form.eslogan = data.empresa?.eslogan || "";
        this.form.telefono = data.telefono || "";
        this.form.email = data.email || "";
        this.form.direccion = data.direccion || "";
        this.form.logoUrl = data.empresa?.logoUrl || "";
      }
    } catch (error) {
      alert("Error al cargar datos: " + error.message);
    }
  },
  methods: {
    async subirLogo(event) {
      const file = event.target.files[0];
      if (!file || !this.userId) return;

      const fileRef = storageRef(storage, `logos/${this.userId}/${file.name}`);
      try {
        const snapshot = await uploadBytes(fileRef, file);
        const url = await getDownloadURL(snapshot.ref);
        this.form.logoUrl = url;
      } catch (err) {
        alert("Error al subir logo: " + err.message);
      }
    },

    async guardarDatos() {
      if (!this.userId) return;

      try {
        await setDoc(
          doc(db, "users", this.userId),
          {
            telefono: this.form.telefono,
            email: this.form.email,
            direccion: this.form.direccion,
            empresa: {
              nombreComercial: this.form.nombreComercial,
              rut: this.form.rut,
              eslogan: this.form.eslogan,
              logoUrl: this.form.logoUrl,
            },
          },
          { merge: true }
        );

        alert("Datos guardados correctamente");
      } catch (error) {
        alert("Error al guardar: " + error.message);
      }
    },
  },
};
</script>

<style scoped>
.pdf-header-config {
  max-width: 600px;
  margin: auto;
  padding: 20px;
}
.pdf-header-config form div {
  margin-bottom: 15px;
}
.pdf-header-config label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
}
.pdf-header-config input {
  width: 100%;
  padding: 8px;
  box-sizing: border-box;
}
.pdf-header-config button {
  padding: 10px 20px;
  background-color: #28a745;
  color: white;
  border: none;
  border-radius: 5px;
}
.preview {
  margin-top: 30px;
  background: #f1f1f1;
  padding: 15px;
  border-radius: 5px;
}
.membrete {
  display: flex;
  align-items: center;
  gap: 20px;
}
.membrete .logo {
  width: 100px;
  height: auto;
}
.membrete .info h3 {
  margin: 0;
}
</style>
