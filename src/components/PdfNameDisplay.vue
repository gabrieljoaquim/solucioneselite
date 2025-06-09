<template>
  <div class="pdf-name-display">
    <h4>Nombre del PDF:</h4>
    <p>{{ pdfName }}</p>
  </div>
</template>

<script>
export default {
  props: {
    pdfName: {
      type: String,
      required: true,
    },
  },
};
</script>

<style scoped>
.pdf-name-display {
  margin-bottom: 10px;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 5px;
  background-color: #f9f9f9;
}
.pdf-name-display h4 {
  margin: 0;
  font-size: 14px;
  color: #333;
}
.pdf-name-display p {
  margin: 0;
  font-size: 12px;
  color: #555;
}
</style>
