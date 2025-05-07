import { createStore } from 'vuex'

export default createStore({
  state: {
    users: []
  },
  getters: {
  },
  mutations: {
    addUser(state, user) {
      state.users.push(user);
      console.log('Usuarios en el store:', state.users);
    }
  },
  actions: {
  },
  modules: {
  }
})
