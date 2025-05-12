<template>
  <div>
    <nav>
      <router-link to="/">Home</router-link> |
      <router-link to="/about">About</router-link> |
      <router-link to="/register">Register</router-link> |
      <router-link to="/login">Login</router-link> |
      <router-link to="/profile">Profile</router-link>
      <select name="" id="">
        <option value="">Servicios</option>
      </select>
      <ul>
        <li><router-link to="/add-service">Agregar Servicio</router-link></li>
        <li>
          <router-link to="/list-services">Lista de Servicios</router-link>
        </li>
      </ul>
    </nav>
  </div>
</template>

<script>
export default {
  name: "navbar",
};
</script>
