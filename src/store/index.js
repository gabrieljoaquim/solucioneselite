import { createStore } from "vuex";
import { collection, getDocs, doc, getDoc, setDoc } from "firebase/firestore";
import { db, auth } from "@/firebase/firebaseConfig";
import { onAuthStateChanged } from "firebase/auth";

export default createStore({
  state: {
    users: [],
    services: [],
    currentUser: null, // Incluye uid, email, role, etc.
    user: {
      profilePhoto: "", // Puedes usar esto en vistas
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
    async fetchUsers({ commit }) {
      try {
        const snapshot = await getDocs(collection(db, "users"));
        const users = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        commit("setUsers", users);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    },
    async fetchServices({ commit }) {
      try {
        const snapshot = await getDocs(collection(db, "services"));
        const services = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        commit("setServices", services);
      } catch (error) {
        console.error("Error fetching services:", error);
      }
    },
    async addUser({ commit }, user) {
      try {
        const userRef = doc(collection(db, "users"));
        await setDoc(userRef, user);
        commit("addUser", { id: userRef.id, ...user });
      } catch (error) {
        console.error("Error adding user:", error);
      }
    },
    async addService({ commit }, service) {
      try {
        const serviceRef = doc(collection(db, "services"));
        await setDoc(serviceRef, service);
        commit("addService", { id: serviceRef.id, ...service });
      } catch (error) {
        console.error("Error adding service:", error);
      }
    },

    // 👇 Esta es la más importante
    observeAuthState({ commit }) {
      onAuthStateChanged(auth, async (user) => {
        if (user) {
          try {
            const userDoc = await getDoc(doc(db, "users", user.uid));
            const userData = userDoc.exists() ? userDoc.data() : {};

            commit("setCurrentUser", {
              uid: user.uid,
              email: user.email,
              role: userData.role || "cliente", // <- Default si no hay
              ...userData, // Agrega otros campos útiles como name, phone, etc.
            });
          } catch (err) {
            console.error("Error al cargar el perfil del usuario:", err);
            commit("setCurrentUser", null);
          }
        } else {
          commit("setCurrentUser", null);
        }
      });
    },
  },
  modules: {},
});
