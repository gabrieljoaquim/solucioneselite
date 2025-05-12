import { createStore } from 'vuex'

export default createStore({
  state: {
    users: [],
    services: [] // Add services state
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
  },
  actions: {
  },
  modules: {
  }
})
