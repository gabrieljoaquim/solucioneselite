<template>
  <div class="home">
    <header class="hero">
      <div class="hero-background">
        <img alt="logo" class="LogoPrin" src="../assets/logo.png" />
        <h1>
          Encuentra a los mejores profesionales en reparación y construcción
          🔨🏡
        </h1>
        <p>
          Pintores, plomeros, electricistas y más… ¡solicita un servicio fácil y
          rápido!
        </p>
        <button class="cta" @click="$router.push('/list-experts')">
          Encuentra un experto ahora
        </button>
      </div>
    </header>

    <section class="how-it-works">
      <h2>Cómo Funciona</h2>
      <div class="steps">
        <p>1️⃣ Escoge la categoría de servicio.</p>
        <p>2️⃣ Elige entre los profesionales disponibles en tu zona.</p>
        <p>3️⃣ Coordina el trabajo y haz seguimiento en la plataforma.</p>
      </div>
      <button class="register" @click="$router.push('/register')">
        Regístrate Gratis
      </button>
    </section>

    <section class="benefits">
      <h2>Beneficios de la Plataforma</h2>
      <ul>
        <li>📌 Profesionales verificados y confiables.</li>
        <li>📌 Gestión completa del trabajo en la app.</li>
        <li>📌 Paga de forma segura y transparente.</li>
        <li>📌 Opiniones reales de clientes anteriores.</li>
      </ul>
    </section>

    <section class="testimonials">
      <h2>Lo que dicen nuestros clientes</h2>
      <blockquote>
        💬 ‘Solucioné mi problema en minutos. Excelente servicio.’ - Juan,
        Medellín
      </blockquote>
      <blockquote>
        💬 ‘Rápido, fácil y seguro. Recomiendo esta plataforma.’ - María, Bogotá
      </blockquote>
    </section>

    <footer class="cta-footer">
      <h2>Encuentra un profesional ahora</h2>
      <button class="cta" @click="$router.push('/add-service')">
        Solicita tu servicio
      </button>
    </footer>
  </div>
</template>

<script>
// @ is an alias to /src

export default {
  name: "HomeView",
  components: {},
};
</script>

<style scoped>
.LogoPrin {
  width: 100%;
  height: auto;
  max-width: 20%;
  margin: 0 auto 32px auto;
  filter: drop-shadow(0 2px 8px rgba(0, 0, 0, 0.1));
  border-radius: 16px;
}
.home {
  text-align: center;
  padding: 0 0 0 0;
  background: var(--color-background);
  min-height: 100vh;
}

.hero {
  background-image: url("../assets/fondo2.png");
  color: var(--color-main-black);
  padding: 48px 24px 40px 24px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08);
  margin-bottom: 32px;
  position: relative;
  overflow: hidden;
}
.hero-background {
  background-color: rgba(255, 255, 255, 0.4);
}
.hero h1 {
  font-size: 2.2em;
  font-weight: 800;
  margin-bottom: 18px;
  letter-spacing: 1px;
}
.hero p {
  font-size: 1.2em;
  margin-bottom: 24px;
  color: var(--color-dark-gray);
}
.cta {
  background: rgba(0, 255, 0, 0.4);
  color: var(--color-main-white);
  padding: 12px 32px;
  border: none;
  cursor: pointer;
  font-size: 1.2em;
  border-radius: 10px;
  font-weight: 700;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}
.register {
  background: var(--color-intense-red);
  color: var(--color-main-white);
  padding: 12px 32px;
  border: none;
  cursor: pointer;
  font-size: 1.2em;
  border-radius: 10px;
  font-weight: 700;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: background 0.2s, color 0.2s, transform 0.2s;
}
.cta:hover,
.register:hover {
  background: rgba(0, 255, 0, 0.6);
  color: var(--color-bright-green);
  transform: translateY(-2px) scale(1.04);
}

.how-it-works,
.benefits,
.testimonials {
  margin: 40px 0;
  background: var(--color-main-white);
  border-radius: 18px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08);
  padding: 32px 0 24px 0;
  max-width: 700px;
  margin-left: auto;
  margin-right: auto;
}
.how-it-works h2,
.benefits h2,
.testimonials h2 {
  color: var(--color-intense-red);
  font-size: 1.5em;
  font-weight: 700;
  margin-bottom: 18px;
}
.steps {
  display: flex;
  flex-direction: column;
  gap: 10px;
  font-size: 1.1em;
  color: var(--color-dark-gray);
  margin-bottom: 18px;
}
.benefits ul {
  list-style: none;
  padding: 0;
  color: var(--color-main-black);
  display: flex;
  flex-direction: column;
  gap: 10px;
  align-items: flex-start;
  max-width: 400px;
  margin: 0 auto;
}
.benefits li {
  margin: 0;
  font-size: 1.1em;
  background: #f7f7f7;
  border-radius: 8px;
  padding: 8px 16px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
  display: flex;
  align-items: center;
  gap: 8px;
}
.testimonials blockquote {
  background: #f4f4f4;
  border-left: 5px solid var(--color-electric-blue);
  margin: 18px auto;
  padding: 18px 24px;
  border-radius: 10px;
  font-style: italic;
  color: var(--color-dark-gray);
  max-width: 500px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.cta-footer {
  background: linear-gradient(
    90deg,
    var(--color-electric-blue),
    var(--color-golden-yellow)
  );
  color: var(--color-main-white);
  padding: 32px 0 24px 0;
  border-radius: 0 0 24px 24px;
  margin-top: 48px;
  box-shadow: 0 -2px 12px rgba(0, 0, 0, 0.06);
}
.cta-footer h2 {
  color: var(--color-main-black);
  font-size: 1.4em;
  font-weight: 700;
  margin-bottom: 18px;
}

@media (max-width: 700px) {
  .hero,
  .how-it-works,
  .benefits,
  .testimonials,
  .cta-footer {
    padding-left: 8px;
    padding-right: 8px;
  }
  .LogoPrin {
    max-width: 60%;
  }
}
</style>
