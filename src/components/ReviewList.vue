<template>
  <div class="review-list">
    <h3>Reseñas</h3>
    <div v-if="loading">Cargando reseñas...</div>
    <div v-else-if="reviews.length === 0">Aún no hay reseñas.</div>
    <div v-else>
      <div v-for="review in reviews" :key="review._id" class="review-item">
        <div class="review-header">
          <span class="review-stars">{{
            "★".repeat(review.stars) + "☆".repeat(5 - review.stars)
          }}</span>
          <span class="review-date">{{ formatDate(review.date) }}</span>
        </div>
        <div class="review-comment">{{ review.comment }}</div>
        <div class="review-client" v-if="review.publicClientName">
          <span>Por: {{ review.publicClientName }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import api from "../axios";
export default {
  props: {
    workerId: { type: String, required: true },
  },
  data() {
    return {
      reviews: [],
      loading: true,
    };
  },
  methods: {
    async fetchReviews() {
      this.loading = true;
      try {
        const res = await api.get(
          `http://localhost:5000/api/reviews/worker/${this.workerId}`
        );
        this.reviews = res.data;
      } catch {
        this.reviews = [];
      }
      this.loading = false;
    },
    formatDate(date) {
      return new Date(date).toLocaleDateString();
    },
  },
  mounted() {
    this.fetchReviews();
  },
};
</script>

<style scoped>
.review-list {
  max-width: 500px;
  margin: 0 auto;
}
.review-item {
  border-bottom: 1px solid #eee;
  padding: 10px 0;
}
.review-header {
  display: flex;
  justify-content: space-between;
  font-size: 1.1em;
}
.review-stars {
  color: #ffb400;
}
.review-date {
  color: #888;
  font-size: 0.95em;
}
.review-comment {
  margin: 6px 0 2px 0;
}
.review-client {
  color: #2196f3;
  font-size: 0.97em;
}
</style>
