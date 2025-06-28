<template>
  <div>
    <div>
      <navbar />
    </div>
    <router-view @update-unread="unreadCount = $event" />
  </div>
</template>

<script>
import navbar from "./components/navbar.vue";
import store from "./store"; // ajusta si usas otro path
import { getOrCreateDeviceId } from "@/utils/device"; // misma ruta

export default {
  name: "App",

  components: {
    navbar,
  },
  data() {
    return {
      unreadCount: 0,
    };
  },
  mounted() {
    function restoreSession() {
      const saved = JSON.parse(localStorage.getItem("session"));
      const currentDeviceId = getOrCreateDeviceId();

      if (saved && saved.deviceId === currentDeviceId) {
        store.commit("setCurrentUser", {
          uid: saved.userId,
          email: saved.email,
          role: saved.role || "cliente",
        });
        console.log("Sesión restaurada automáticamente con rol:", saved.role);
      } else {
        console.log("No hay sesión válida o el dispositivo es diferente.");
        localStorage.removeItem("session");
      }
    }

    restoreSession();
  },
};
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: var(--color-black);
  background: #ebebec;
}

nav {
  padding: 30px;
}

nav a {
  font-weight: bold;
  color: #2c3e50;
}

nav a.router-link-exact-active {
  color: #42b983;
}
</style>
