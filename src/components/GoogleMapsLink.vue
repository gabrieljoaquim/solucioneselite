<template>
  <div>
    <a
      :href="googleMapsUrl"
      target="_blank"
      rel="noopener noreferrer"
      class="maps-link"
    >
      {{ extractedAddress }}
    </a>
  </div>
</template>

<script>
export default {
  name: "GoogleMapsLink",
  props: {
    code: {
      type: String,
      required: true,
    },
  },
  computed: {
    extractedAddress() {
      const match = this.code.match(/\b(cr|cl)\s+[^,]+/i);
      return match ? match[0] : "Dirección no encontrada";
    },
    googleMapsUrl() {
      return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
        this.extractedAddress
      )}`;
    },
  },
};
</script>

<style scoped>
.maps-link {
  color: #1a73e8;
  text-decoration: none;
  font-weight: bold;
  cursor: pointer;
}
.maps-link:hover {
  text-decoration: underline;
}
</style>
