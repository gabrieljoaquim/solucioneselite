<template>
  <div class="pdf-uploader">
    <label for="pdf">Subir PDF de solicitud de servicio:</label>
    <input type="file" accept=".pdf" @change="extractPdfText" />
    <p v-if="loading">Leyendo PDF...</p>
    <p v-if="error" class="error">{{ error }}</p>
  </div>
</template>

<script>
import * as pdfjsLib from "pdfjs-dist";
import pdfjsWorker from "pdfjs-dist/build/pdf.worker.entry";

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

export default {
  props: ["service"],
  data() {
    return {
      loading: false,
      error: null,
    };
  },
  methods: {
    async extractPdfText(event) {
      const file = event.target.files[0];
      if (!file) return;

      this.loading = true;
      this.error = null;

      try {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

        let fullText = "";
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const textContent = await page.getTextContent();
          const pageText = textContent.items.map((item) => item.str).join(" ");
          fullText += pageText + "\n";
        }

        this.fillFormFromText(fullText, file.name);
      } catch (err) {
        console.error(err);
        this.error = "Error al leer el PDF.";
      } finally {
        this.loading = false;
      }
    },

    fillFormFromText(text, filename) {
      const extract = (regex) => {
        const match = text.match(regex);
        return match ? match[1].trim() : "";
      };

      const apertura = extract(/Horario de apertura:\s*(\d{2}:\d{2})/);
      const cierre = extract(/Horario de cierre:\s*(\d{2}:\d{2})/);

      Object.assign(this.service, {
        requester: extract(/Nombres Apellidos\s+(.*?)Télefono/i),
        phone: extract(/Télefono de contacto:\s*(\d+)/i),
        address: extract(
          /Punto de venta código:\s*([^\n]+)Horario de apertura:/i
        ),
        workingHours: apertura && cierre ? `${apertura} a ${cierre}` : "",
        serviceType: extract(/Tipo de mantenimiento Locativo:\s*(.*)Nombres/i),
        details: extract(/Descripción de la novedad:\s*([^\n]+)https:/i),
        puntoVentaCodigo: extract(/Punto de venta código:\s*(\d+)/i),
        proveedorAsignado: extract(
          /Proveedor asignado:\s*([^\n]+)Descripción/i
        ),
        nombreOficina: extract(
          /Nombre de Oficina:\s*(.*?)\s*Nombre de Oficina - Administrativo/i
        ),

        pdfReferencia: filename.replace(".pdf", ""),
      });
    },
  },
};
</script>

<style scoped>
.pdf-uploader {
  margin-top: 1rem;
}
.error {
  color: red;
}
</style>
