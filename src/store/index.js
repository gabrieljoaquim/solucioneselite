import { createStore } from "vuex";
import { getOrCreateDeviceId } from "@/utils/device";

export default createStore({
  state: {
    users: [],
    services: [],
    currentUser: null,
    user: {
      profilePhoto: "",
    },
  },
  mutations: {
    setCurrentUser(state, user) {
      state.currentUser = user;
      if (user) {
        localStorage.setItem("currentUser", JSON.stringify(user));
      } else {
        localStorage.removeItem("currentUser");
      }
    },
    addUser(state, user) {
      state.users.push(user);
    },
    addService(state, service) {
      state.services.push(service);
    },
    setProfilePhoto(state, photoUrl) {
      state.user.profilePhoto = photoUrl;
    },
    updateService(state, { index, data }) {
      state.services[index] = { ...state.services[index], ...data };
    },
    updateCurrentUserProfile(state, profile) {
      if (state.currentUser) {
        state.currentUser = { ...state.currentUser, ...profile };
      }
    },
    setUsers(state, users) {
      state.users = users;
    },
    setServices(state, services) {
      state.services = services;
    },
  },
  actions: {
    // ✅ Mover todo por el backend

    async fetchUsers({ commit }) {
      try {
        const res = await fetch(`${process.env.VUE_APP_API_URL}/users`);
        const users = await res.json();
        commit("setUsers", users);
      } catch (error) {
        console.error("Error al obtener usuarios:", error);
      }
    },

    async fetchServices({ commit }) {
      try {
        const res = await fetch(`${process.env.VUE_APP_API_URL}/services`);
        const services = await res.json();
        commit("setServices", services);
      } catch (error) {
        console.error("Error al obtener servicios:", error);
      }
    },

    async addUser({ commit }, user) {
      try {
        const res = await fetch(`${process.env.VUE_APP_API_URL}/users`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(user),
        });
        const newUser = await res.json();
        commit("addUser", newUser);
      } catch (error) {
        console.error("Error al agregar usuario:", error);
      }
    },

    async addService({ commit }, service) {
      try {
        const res = await fetch(`${process.env.VUE_APP_API_URL}/services`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(service),
        });
        const newService = await res.json();
        commit("addService", newService);
      } catch (error) {
        console.error("Error al agregar servicio:", error);
      }
    },

    // 🔁 Migrar observeAuthState → usa localStorage y backend
    async observeAuthState({ commit }) {
      const session = localStorage.getItem("session");

      if (!session) {
        commit("setCurrentUser", null);
        return;
      }

      try {
        const sessionData = JSON.parse(session);
        const { userId, email, role } = sessionData;

        // Aquí podrías validar el token con el backend si lo deseas
        // También podrías cargar el perfil completo si hiciera falta

        commit("setCurrentUser", {
          uid: userId,
          email,
          role,
        });
      } catch (err) {
        console.error("Error cargando sesión del usuario:", err);
        commit("setCurrentUser", null);
      }
    },
  },
  modules: {},
});
