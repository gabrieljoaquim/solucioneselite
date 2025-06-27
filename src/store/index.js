import { createStore } from 'vuex'
import { collection, getDocs, doc, setDoc } from "firebase/firestore";
import { db, auth } from "@/firebase/firebaseConfig";
import { onAuthStateChanged } from "firebase/auth";

export default createStore({
  state: {
    users: [],
    services: [],
    user: {
      profilePhoto: '' // Placeholder for the user's profile photo
    },
    currentUser: null,
  },
  getters: {
  },
  mutations: {
    addUser(state, user) {
      state.users.push(user);
      console.log('Usuarios en el store:', state.users);
    },
    addService(state, service) {
      state.services.push(service); // Update services state
      console.log('Servicio agregado:', service);
    },
    setProfilePhoto(state, photoUrl) {
      state.user.profilePhoto = photoUrl;
    },
    setCurrentUser(state, user) {
    state.currentUser = user;
    if (user) {
      localStorage.setItem('currentUser', JSON.stringify(user));
    } else {
      localStorage.removeItem('currentUser');
    }

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
        const querySnapshot = await getDocs(collection(db, "users"));
        const users = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        commit("setUsers", users);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    },
    async fetchServices({ commit }) {
      try {
        const querySnapshot = await getDocs(collection(db, "services"));
        const services = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
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
    observeAuthState({ commit }) {
      onAuthStateChanged(auth, (user) => {
        if (user) {
          commit("setCurrentUser", user);
        } else {
          commit("setCurrentUser", null);
        }
      });
    },
  },
  modules: {
  }
})
