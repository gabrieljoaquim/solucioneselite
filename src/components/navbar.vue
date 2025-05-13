<template>
  <div class="navbar">
    <div class="navbar-left" @click="$router.push('/')">
      <img src="@/assets/logo.png" alt="Elite Logo" class="logo" />
      <span class="brand-name">ELITE</span>
    </div>
    <div class="navbar-center">
      <ul class="menu">
        <li><router-link to="/about">Nosotros</router-link></li>
        <li class="dropdown">
          <button class="dropdown-button">Servicios</button>
          <ul class="dropdown-menu">
            <li>
              <router-link to="/add-service">Agregar</router-link>
            </li>
            <li>
              <router-link to="/list-services">Lista</router-link>
            </li>
          </ul>
        </li>
        <li>
          <router-link to="/chat" class="chat-link">
            Chat
            <span v-if="unreadCount > 0" class="unread-badge">{{
              unreadCount
            }}</span>
          </router-link>
        </li>
      </ul>
    </div>
    <div class="navbar-right">
      <img
        :src="
          $store.state.currentUser?.profilePhoto || '/default-user-photo.jpg'
        "
        alt="User Photo"
        class="user-photo"
      />
      <div class="user-info">
        <span class="user-email" @click="$router.push('/profile')">{{
          $store.state.currentUser?.email || "usuario@correo.com"
        }}</span>

        <div class="auth-buttons">
          <router-link
            v-if="!$store.state.currentUser"
            to="/register"
            class="small-button"
            >Registro</router-link
          >
          <router-link
            v-if="!$store.state.currentUser"
            to="/login"
            class="small-button"
            >Iniciar Sesión</router-link
          >
          <button
            v-if="$store.state.currentUser"
            class="small-button"
            @click="logout"
          >
            Cerrar Sesión
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from "vuex";
export default {
  name: "navbar",
  data() {
    return {
      unreadCount: 0,
    };
  },
  methods: {
    logout() {
      this.$store.commit("setCurrentUser", null);
      this.$router.push({ name: "home" });
    },
    updateUnread(count) {
      this.unreadCount = count;
    },
  },
  computed: {
    ...mapState({ currentUser: (state) => state.currentUser }),
    userId() {
      return this.currentUser?._id;
    },
    userName() {
      return this.currentUser?.name;
    },
    unreadCount() {
      // Si el componente es usado dentro de App.vue, toma el prop
      return this.$root.unreadCount || 0;
    },
  },
};
</script>

<style scoped>
.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 20px;
  background-color: #117e2c;
  color: white;
  font-family: Arial, sans-serif;
}
.navbar-left {
  display: flex;
  align-items: center;
}
.logo {
  height: 40px;
  margin-right: 10px;
}
.brand-name {
  font-size: 1.5em;
  font-weight: bold;
}
.navbar-center {
  flex-grow: 1;
  display: flex;
  justify-content: center;
}
.menu {
  list-style: none;
  display: flex;
  gap: 20px;
  padding: 0;
  margin: 0;
}
.menu li {
  position: relative;
}
.menu a {
  text-decoration: none;
  color: white;
  font-size: 1em;
  padding: 5px 10px;
  border-radius: 5px;
  transition: background-color 0.3s;
}
.menu a:hover {
  background-color: #079f14;
}
.dropdown-button {
  background: none;
  border: none;
  color: white;
  font-size: 1em;
  cursor: pointer;
  padding: 5px 10px;
  border-radius: 5px;
  transition: background-color 0.3s;
}
.dropdown-button:hover {
  background-color: #079f14;
}
.dropdown-menu {
  display: none;
  position: absolute;
  top: 100%;
  left: 0;
  background-color: #079f14;
  list-style: none;
  padding: 5px;
  border-radius: 5px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}
.dropdown:hover .dropdown-menu {
  display: block;
}
.dropdown-menu li {
  margin: 5px;
}
.navbar-right {
  display: flex;
  align-items: center;
}
.user-photo {
  height: 40px;
  width: 40px;
  border-radius: 50%;
  margin-right: 10px;
}
.user-info {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}
.user-email {
  font-size: 0.9em;
}
.current-date {
  font-size: 0.8em;
  color: #bdc3c7;
}
.auth-buttons {
  display: flex;
  gap: 10px;
  margin-top: 5px;
}
.small-button {
  text-decoration: none;
  color: white;
  font-size: 0.8em;
  padding: 3px 7px;
  border-radius: 3px;
  background-color: #117e2c;
  transition: background-color 0.3s;
}
.small-button:hover {
  background-color: #079f14;
}
.unread-badge {
  background: #e53935;
  color: #fff;
  border-radius: 50%;
  font-size: 0.8em;
  padding: 2px 7px;
  margin-left: 4px;
  vertical-align: top;
  font-weight: bold;
}
.chat-link {
  position: relative;
  display: inline-block;
}
</style>
