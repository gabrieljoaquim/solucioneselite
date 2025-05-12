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
        <li v-if="isLoggedIn">
          <router-link to="/profile">Perfil</router-link>
        </li>
      </ul>
    </div>
    <div class="navbar-right">
      <img
        :src="$store.state.user.profilePhoto || '/default-user-photo.jpg'"
        @click="$router.push('/profile')"
        alt="User Photo"
        class="user-photo"
      />
      <div class="user-info">
        <span class="user-email">usuario@correo.com</span>
        <span class="current-date">11 de mayo de 2025</span>
        <div class="auth-buttons">
          <router-link to="/register" class="small-button"
            >Registro</router-link
          >
          <router-link to="/login" class="small-button"
            >Iniciar Sesión</router-link
          >
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "navbar",
  computed: {
    isLoggedIn() {
      // Replace this with actual logic to check if the user is logged in
      return this.$store.state.user && this.$store.state.user.isLoggedIn;
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
</style>
