import { createStore } from 'vuex'

export default createStore({
  state: {
    users: [],
    services: [],
    user: {
      profilePhoto: '' // Placeholder for the user's profile photo
    }
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
  },
  actions: {
  },
  modules: {
  }
})
