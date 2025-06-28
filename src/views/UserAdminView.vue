<template>
  <div class="user-admin-view">
    <template
      v-if="
        $store.state.currentUser &&
        $store.state.currentUser.role === 'administrador'
      "
    >
      <h1>Gestión de Usuarios</h1>
      <div v-if="error" class="error-msg">{{ error }}</div>
      <table class="user-table">
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Email</th>
            <th>Rol</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          <template v-for="user in users">
            <tr
              :key="user._id"
              v-if="!editingUser || editingUser._id !== user._id"
            >
              <td>{{ user.name }}</td>
              <td>{{ user.email }}</td>
              <td>{{ user.role }}</td>
              <td>
                <button @click="editUser(user)">Editar</button>
                <button @click="deleteUser(user._id)">Eliminar</button>
              </td>
            </tr>
            <tr :key="user._id + '-edit'" v-else class="edit-row">
              <td colspan="4">
                <form @submit.prevent="saveEdit">
                  <div class="edit-fields">
                    <label>Nombre: <input v-model="editingUser.name" /></label>
                    <label>Email: <input v-model="editingUser.email" /></label>
                    <label>
                      Rol:
                      <select v-model="editingUser.role">
                        <option value="cliente">Cliente</option>
                        <option value="trabajador">Trabajador</option>
                        <option value="administrador">Administrador</option>
                      </select>
                    </label>
                    <label
                      >Teléfono: <input v-model="editingUser.phone"
                    /></label>
                    <label
                      >Dirección: <input v-model="editingUser.address"
                    /></label>
                    <label>Zona: <input v-model="editingUser.zone" /></label>
                    <label>
                      Especialidad:
                      <input
                        v-model="editingUser.specialtyString"
                        placeholder="Separadas por coma"
                      />
                    </label>
                    <label>
                      Experiencia (años):
                      <input
                        v-model.number="editingUser.experience"
                        type="number"
                        min="0"
                      />
                    </label>
                    <label
                      >Descripción: <input v-model="editingUser.description"
                    /></label>
                    <label>
                      Foto de Perfil:
                      <input type="file" @change="onImageChange($event)" />
                    </label>
                    <div v-if="editingUser.picture">
                      <img
                        :src="editingUser.picture"
                        alt="Foto de Perfil"
                        style="max-width: 100px; border-radius: 4px"
                      />
                    </div>
                  </div>
                  <button type="submit">Guardar</button>
                  <button type="button" @click="cancelEdit">Cancelar</button>
                </form>
              </td>
            </tr>
          </template>
        </tbody>
      </table>
    </template>
    <template v-else>
      <div class="error-msg">
        Acceso denegado. Solo el administrador puede ver esta página.
      </div>
    </template>
  </div>
</template>

<script>
import { getDocs, collection } from "firebase/firestore";
import { db } from "@/firebase/firebaseConfig";
import { doc, updateDoc, deleteDoc } from "firebase/firestore";
import {
  ref as storageRef,
  uploadBytes,
  getDownloadURL,
} from "firebase/storage";
import { storage } from "@/firebase/firebaseConfig";

export default {
  data() {
    return {
      users: [],
      error: "",
      editingUser: null,
    };
  },
  computed: {
    // Para edición, convierte specialty array a string y viceversa
  },
  mounted() {
    this.fetchUsers();
  },
  methods: {
    editUser(user) {
      // Copia profunda para no modificar la tabla hasta guardar
      this.editingUser = {
        ...user,
        specialtyString: Array.isArray(user.specialty)
          ? user.specialty.join(", ")
          : user.specialty || "",
      };
    },
    cancelEdit() {
      this.editingUser = null;
    },
    async saveEdit() {
      try {
        // Convierte specialtyString a array
        if (this.editingUser.specialtyString) {
          this.editingUser.specialty = this.editingUser.specialtyString
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean);
        } else {
          this.editingUser.specialty = [];
        }
        await this.updateUser(this.editingUser);
        // Actualiza la tabla localmente
        const idx = this.users.findIndex((u) => u._id === this.editingUser._id);
        if (idx !== -1) this.users[idx] = { ...this.editingUser };
        this.editingUser = null;
      } catch (e) {
        this.error = e.response?.data?.error || "Error al guardar cambios";
      }
    },
    async fetchUsers() {
      try {
        const snapshot = await getDocs(collection(db, "users"));
        this.users = snapshot.docs.map((doc) => ({
          _id: doc.id,
          ...doc.data(),
        }));
        this.error = "";
      } catch (e) {
        this.error = e.message || "Error al cargar usuarios";
      }
    },
    async updateUser(user) {
      try {
        const userRef = doc(db, "users", user._id);
        const userToUpdate = { ...user };
        delete userToUpdate._id; // No se puede actualizar el ID

        await updateDoc(userRef, userToUpdate);
        this.error = "";
        alert("Usuario actualizado");
      } catch (e) {
        this.error = e.message || "Error al actualizar usuario";
      }
    },
    async deleteUser(id) {
      if (!confirm("¿Seguro que deseas eliminar este usuario?")) return;
      try {
        await deleteDoc(doc(db, "users", id));
        this.users = this.users.filter((u) => u._id !== id);
        this.error = "";
      } catch (e) {
        this.error = e.message || "Error al eliminar usuario";
      }
    },
    async onImageChange(event) {
      const file = event.target.files[0];
      if (!file || !this.editingUser || !this.editingUser._id) return;

      const userId = this.editingUser._id;
      const imgRef = storageRef(
        storage,
        `profilePictures/${userId}/${file.name}`
      );

      try {
        const snapshot = await uploadBytes(imgRef, file);
        const downloadURL = await getDownloadURL(snapshot.ref);
        this.editingUser.picture = downloadURL; // se guarda directamente en el modelo
      } catch (error) {
        this.error = "Error al subir imagen: " + error.message;
      }
    },
  },
};
</script>

<style scoped>
.user-admin-view {
  max-width: 800px;
  margin: 0 auto;
}
.user-table {
  width: 100%;
  border-collapse: collapse;
}
.user-table th,
.user-table td {
  border: 1px solid #ccc;
  padding: 8px;
}
.user-table th {
  background: #f5f5f5;
}
.error-msg {
  color: #d32f2f;
  margin-bottom: 10px;
}
</style>
