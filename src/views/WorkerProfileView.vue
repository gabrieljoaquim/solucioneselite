<template>
  <div class="worker-profile-view">
    <WorkerProfileCard :worker="worker" />
    <WorkerGallery :worker-id="workerId" />
    <ReviewList :worker-id="workerId" />
    <ReviewForm
      v-if="canReview"
      :worker-id="workerId"
      :service-id="serviceId"
      :client-id="currentUserId"
      :client-name="currentUserName"
    />
    <VerificationUpload v-if="isOwnProfile && isWorker" :worker-id="workerId" />
    <WorkerSchedule v-if="isOwnProfile && isWorker" :worker-id="workerId" />
    <AppointmentBooking
      v-if="!isOwnProfile && isClient"
      :worker-id="workerId"
      :client-id="currentUserId"
    />
  </div>
</template>

<script>
import WorkerProfileCard from "../components/WorkerProfileCard.vue";
import WorkerGallery from "../components/WorkerGallery.vue";
import ReviewList from "../components/ReviewList.vue";
import ReviewForm from "../components/ReviewForm.vue";
import VerificationUpload from "../components/VerificationUpload.vue";
import WorkerSchedule from "../components/WorkerSchedule.vue";
import AppointmentBooking from "../components/AppointmentBooking.vue";

export default {
  components: {
    WorkerProfileCard,
    WorkerGallery,
    ReviewList,
    ReviewForm,
    VerificationUpload,
    WorkerSchedule,
    AppointmentBooking,
  },
  data() {
    return {
      worker: {},
      workerId: this.$route.params.id,
      serviceId: "", // Debe obtenerse según contexto
    };
  },
  computed: {
    currentUserId() {
      return this.$store.state.currentUser?._id;
    },
    currentUserName() {
      return this.$store.state.currentUser?.name;
    },
    isOwnProfile() {
      return this.currentUserId === this.workerId;
    },
    isWorker() {
      return this.$store.state.currentUser?.role === "trabajador";
    },
    isClient() {
      return this.$store.state.currentUser?.role === "cliente";
    },
    canReview() {
      // Lógica: solo clientes que hayan contratado pueden reseñar
      return this.isClient && !this.isOwnProfile;
    },
  },
  async mounted() {
    // Cargar datos del trabajador
    // Aquí deberías hacer una petición a tu backend para obtener el perfil
    // Simulación:
    this.worker = {
      _id: this.workerId,
      name: "Trabajador Demo",
      profilePhoto: "",
      rating: 4.7,
      specialty: ["Electricista"],
      zone: "Centro",
      experience: 5,
      description: "Especialista en instalaciones eléctricas.",
      verified: true,
    };
  },
};
</script>

<style scoped>
.worker-profile-view {
  max-width: 800px;
  margin: 0 auto;
  padding: 24px 0;
}
</style>
