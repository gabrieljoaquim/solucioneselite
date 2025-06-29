<template>
  <div v-if="visible" class="modal-overlay">
    <div class="modal-content">
      <h3>Editar Perfil</h3>
      <form @submit.prevent="saveProfile">
        <label>
          Nombre:
          <input v-model="editableUser.name" />
        </label>

        <label>
          Foto de perfil:
          <input type="file" @change="onImageChange" />
        </label>

        <div v-if="editableUser.profilePhoto">
          <img :src="editableUser.profilePhoto" class="preview" />
        </div>

        <button type="submit">Guardar</button>
        <button type="button" @click="close">Cancelar</button>
      </form>
    </div>
  </div>
</template>

<script>
import {
  ref as storageRef,
  uploadBytes,
  getDownloadURL,
} from "firebase/storage";
import { doc, updateDoc } from "firebase/firestore";
import { db, storage } from "@/firebase/firebaseConfig";

export default {
  name: "ProfileEditor",
  props: {
    visible: Boolean,
    user: Object,
  },
  emits: ["close", "updated"],
  data() {
    return {
      editableUser: {
        name: "",
        profilePhoto: "",
        uid: "",
      },
    };
  },
  watch: {
    visible(val) {
      if (val && this.user) {
        this.editableUser = { ...this.user };
      }
    },
  },
  methods: {
    async onImageChange(event) {
      const file = event.target.files[0];
      if (!file || !this.editableUser.uid) return;

      const path = `profilePictures/${this.editableUser.uid}/${file.name}`;
      console.log("Subiendo imagen a:", path);

      const imgRef = storageRef(storage, path);
      const snapshot = await uploadBytes(imgRef, file);
      console.log("Imagen subida:", snapshot);

      const url = await getDownloadURL(snapshot.ref);
      console.log("URL obtenida:", url);

      this.editableUser.profilePhoto = url;
    },
    async saveProfile() {
      try {
        const userRef = doc(db, "users", this.editableUser.uid);
        await updateDoc(userRef, {
          name: this.editableUser.name,
          profilePhoto: this.editableUser.profilePhoto,
        });
        this.$store.commit("updateCurrentUserProfile", this.editableUser);
        this.$emit("updated", this.editableUser);
        this.close();
        alert("Perfil actualizado correctamente.");
      } catch (e) {
        alert("Error al guardar perfil: " + e.message);
      }
    },
    close() {
      this.$emit("close");
    },
  },
};
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
}
.modal-content {
  background: white;
  padding: 20px;
  border-radius: 8px;
  max-width: 90%;
  width: 400px;
}
.modal-content h3 {
  margin-top: 0;
}
.modal-content input {
  width: 100%;
  margin-bottom: 10px;
}
.preview {
  max-width: 100px;
  border-radius: 50%;
  margin-top: 10px;
}
</style>
