<template>
  <v-container fluid class="pa-0">
    <!-- Header -->
    <v-parallax
      src="https://cdn.vuetifyjs.com/images/parallax/material2.jpg"
      height="400"
    >
      <v-row align="center" justify="center" class="text-center white--text">
        <v-col cols="12">
          <h1 class="display-2 font-weight-bold">[Nombre de tu empresa]</h1>
          <h4 class="subtitle-1">
            Conectamos clientes con profesionales de confianza
          </h4>
          <v-btn color="green lighten-1" class="mt-6" large>Conoce más</v-btn>
        </v-col>
      </v-row>
    </v-parallax>

    <!-- About Section -->
    <v-container class="my-10">
      <v-row>
        <v-col cols="12" md="6">
          <h2 class="text-h5 font-weight-bold mb-4">🏗️ ¿Quiénes Somos?</h2>
          <p>
            En <strong>[Nombre de tu empresa]</strong>, desarrollamos soluciones
            para el sector de la construcción. Nuestra plataforma conecta a
            clientes con profesionales confiables, y también permite generar
            presupuestos detallados para proyectos de obra.
          </p>
        </v-col>
        <v-col cols="12" md="6">
          <v-img
            src="https://cdn.vuetifyjs.com/images/cards/construction.jpg"
            height="250"
            contain
          ></v-img>
        </v-col>
      </v-row>
    </v-container>

    <!-- Servicios -->
    <v-container class="py-10 grey lighten-4">
      <h2 class="text-center font-weight-bold mb-6">Nuestros Servicios</h2>
      <v-row>
        <v-col cols="12" md="6">
          <v-card class="pa-4">
            <v-icon size="40" color="blue">mdi-account-search</v-icon>
            <h3 class="text-h6 font-weight-bold mt-3">
              Plataforma de Servicios
            </h3>
            <p>
              Conecta con pintores, plomeros, electricistas y más, según
              ubicación y calificación.
            </p>
          </v-card>
        </v-col>
        <v-col cols="12" md="6">
          <v-card class="pa-4">
            <v-icon size="40" color="green">mdi-file-pdf-box</v-icon>
            <h3 class="text-h6 font-weight-bold mt-3">
              Generador de Presupuestos
            </h3>
            <p>
              Calcula costos, aplica IVA y genera PDFs con el membrete
              personalizado de tu empresa.
            </p>
          </v-card>
        </v-col>
      </v-row>
    </v-container>

    <!-- Datos Empresa -->
    <v-container class="my-10">
      <v-row>
        <v-col cols="12" md="6">
          <h3 class="text-h6 font-weight-bold">📍 Datos de la Empresa</h3>
          <ul>
            <li><strong>Dirección:</strong> [Tu dirección]</li>
            <li><strong>RUT:</strong> [Tu RUT]</li>
            <li><strong>Email:</strong> [Tu email]</li>
            <li><strong>Teléfono:</strong> [Tu número]</li>
            <li>
              <strong>Eslogan:</strong> “Gracias por elegir [Nombre de tu
              empresa]”
            </li>
          </ul>
        </v-col>
      </v-row>
    </v-container>

    <!-- Footer -->
    <v-footer padless color="green darken-3" class="white--text">
      <v-container>
        <v-row justify="center">
          <v-col cols="12" class="text-center">
            © {{ new Date().getFullYear() }} [Nombre de tu empresa] — Todos los
            derechos reservados.
          </v-col>
        </v-row>
      </v-container>
    </v-footer>
  </v-container>
</template>

<script>
export default {
  name: "AboutView",
};
</script>

<style scoped>
h1,
h2,
h3,
h4 {
  font-family: "Roboto", sans-serif;
  color: #333;
}

.v-parallax {
  filter: brightness(0.7);
}

.v-btn {
  font-weight: bold;
  letter-spacing: 1px;
  text-transform: uppercase;
}

ul {
  list-style-type: none;
  padding-left: 0;
}

ul li::before {
  content: "✔️ ";
  margin-right: 6px;
  color: #4caf50;
}

.v-card {
  transition: box-shadow 0.3s ease;
}

.v-card:hover {
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
}

.v-footer {
  font-size: 0.9rem;
  padding: 20px 0;
}
</style>
