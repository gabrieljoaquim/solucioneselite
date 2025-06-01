<template>
  <div class="worker-search-view">
    <WorkerSearchFilter @search="onSearch" />
    <div v-if="loading">Buscando trabajadores...</div>
    <div v-else>
      <WorkerProfileCard v-for="w in workers" :key="w._id" :worker="w" />
    </div>
  </div>
</template>

<script>
import WorkerSearchFilter from "../components/WorkerSearchFilter.vue";
import WorkerProfileCard from "../components/WorkerProfileCard.vue";
import api from "../axios";
export default {
  components: { WorkerSearchFilter, WorkerProfileCard },
  data() {
    return {
      workers: [],
      loading: false,
    };
  },
  methods: {
    async onSearch({ city, specialty, zone }) {
      this.loading = true;
      try {
        const res = await api.get("/api/worker-search/search", {
          params: { city, specialty, zone },
        });
        this.workers = res.data;
      } catch {
        this.workers = [];
      }
      this.loading = false;
    },
  },
};
</script>

<style scoped>
.worker-search-view {
  max-width: 900px;
  margin: 0 auto;
  padding: 24px 0;
}
</style>
