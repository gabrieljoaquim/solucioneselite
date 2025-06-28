<template>
  <div class="navbar">
    <div class="navbar-top">
      <div class="navbar-left" @click="$router.push('/')">
        <img src="@/assets/logo.png" alt="Elite Logo" class="logo" />
        <span class="brand-name">ELITE</span>
      </div>
      <div class="navbar-right">
        <img
          :src="
            $store.state.currentUser?.profilePhoto || '/default-user-photo.jpg'
          "
          alt="User Photo"
          class="user-photo"
        />
        <div class="user-info" v-if="userName">
          <div class="user-name">{{ userName }}</div>
        </div>

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
    <div class="menu-padre">
      <div class="navbar-bottom">
        <button class="menu-button" @click="toggleMenu">Menu</button>
        <ul class="menu" :class="{ 'menu-open': isMenuOpen }">
          <li v-if="userRole === 'administrador'">
            <router-link to="/admin/users">Usuarios</router-link>
          </li>
          <li><router-link to="/about">Nosotros</router-link></li>
          <li>
            <router-link to="/add-service">Crear Serv.</router-link>
          </li>
          <li>
            <router-link to="/list-services">Servicios</router-link>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from "vuex";
import api from "../axios";

export default {
  name: "navbar",
  data() {
    return {
      unreadCount: 0,
      intervalId: null,
      isMenuOpen: false,
    };
  },
  mounted() {
    this.fetchUnreadCount();
    this.intervalId = setInterval(this.fetchUnreadCount, 5000);
  },
  beforeUnmount() {
    if (this.intervalId) clearInterval(this.intervalId);
  },
  methods: {
    logout() {
      this.$store.commit("setCurrentUser", null);
      this.$router.push({ name: "home" });
    },
    async fetchUnreadCount() {
      if (!this.userId) {
        this.unreadCount = 0;
        return;
      }
      try {
        const res = await api.get(`/api/messages/inbox/${this.userId}`);
        // Suma todos los mensajes no leídos de todas las conversaciones
        this.unreadCount = res.data.reduce(
          (acc, conv) => acc + (conv.unreadCount || 0),
          0
        );
      } catch (err) {
        this.unreadCount = 0;
      }
    },
    toggleMenu() {
      this.isMenuOpen = !this.isMenuOpen;
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
    userRole() {
      return this.$store.state.currentUser?.role;
    },
  },
};
</script>

<style scoped>
.navbar {
  display: flex;
  flex-direction: column;
  background-color: #117e2c;
  color: white;
  font-family: Arial, sans-serif;
}
.navbar-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 20px;
}
.navbar-left {
  display: flex;
  align-items: center;
  justify-content: center; /* Centrar el contenido en modo PC */
}
.logo {
  height: 40px;
  margin-right: 10px;
}
.brand-name {
  font-size: 1.5em;
  font-weight: bold;
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
.auth-buttons {
  display: flex;
  gap: 10px;
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
.menu-padre {
  width: 100%; /* Ocupa todo el ancho de la pantalla */
  display: flex;
  justify-content: center; /* Centra el contenido dentro del div */
}
.menu-button {
  width: calc(100% - 20px); /* Ocupa el ancho del div menos el padding */
  padding: 10px;
  background-color: #117e2c;
  color: white;
  border: none;
  font-size: 1.2em;
  cursor: pointer;
  border-radius: 5px;
  transition: background-color 0.3s;
  display: none; /* Ocultar el botón en pantallas grandes */
}
.menu-button:hover {
  background-color: #079f14;
}
.navbar-bottom {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 10px 20px;
}
.menu {
  list-style: none;
  display: flex; /* Mostrar el menú normal en pantallas grandes */
  flex-direction: row;
  gap: 10px;
  padding: 0;
  margin: 0;
}
.menu-open {
  display: flex;
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

/* Media query para pantallas pequeñas */
@media (max-width: 768px) {
  .menu-button {
    display: block; /* Mostrar el botón en pantallas pequeñas */
  }
  .menu {
    display: none; /* Ocultar el menú normal en pantallas pequeñas */
    flex-direction: column;
  }
  .menu-open {
    display: flex; /* Mostrar el menú desplegable cuando esté abierto */
  }
  .navbar-left {
    justify-content: flex-start; /* Alinear a la izquierda en modo móvil */
  }
  .navbar-top {
    flex-direction: column;
    align-items: center;
    gap: 8px;
  }

  .navbar-right {
    flex-direction: column;
    align-items: center;
    gap: 4px;
  }

  .user-photo {
    margin-right: 0;
    margin-bottom: 4px;
  }

  .user-info {
    text-align: center;
    font-size: 0.9em;
    color: white;
    margin-bottom: 4px;
  }

  .auth-buttons {
    flex-direction: column;
    align-items: center;
    gap: 4px;
  }

  .small-button {
    font-size: 0.9em;
    padding: 6px 12px;
    width: 120px;
    text-align: center;
  }

  .menu-padre {
    padding: 0 10px;
  }
}
</style>
