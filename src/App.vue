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
};
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: var(--color-black);
  background: #8e8f91;
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
