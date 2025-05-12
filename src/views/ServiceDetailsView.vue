<template>
  <div class="service-details">
    <h1>Detalles del Servicio</h1>
    <p><strong>Solicitante:</strong> {{ service.requester }}</p>
    <p><strong>Teléfono:</strong> {{ service.phone }}</p>
    <p><strong>Dirección:</strong> {{ service.address }}</p>
    <p><strong>Horario de trabajo:</strong> {{ service.workingHours }}</p>
    <p><strong>Tipo de servicio:</strong> {{ service.serviceType }}</p>
    <p><strong>Detalles del arreglo:</strong> {{ service.details }}</p>
    <p><strong>Fecha del reporte:</strong> {{ service.reportDate }}</p>
    <p><strong>Observaciones:</strong> {{ service.observations }}</p>
    <p><strong>Duración estimada:</strong> {{ service.estimatedDuration }}</p>
    <p><strong>Estado:</strong> {{ service.status }}</p>
  </div>
</template>

<script>
export default {
  data() {
    return {
      service: {
        requester: "Juan Pérez",
        phone: "123456789",
        address: "Calle Falsa 123",
        workingHours: "9:00 AM - 5:00 PM",
        serviceType: "Plomería",
        details: "Reparación de tubería",
        reportDate: "2025-05-07",
        observations: "Urgente",
        estimatedDuration: "2 horas",
        status: "En espera",
      },
    };
  },
};
</script>

<style scoped>
.service-details {
  max-width: 600px;
  margin: 0 auto;
}
p {
  margin: 10px 0;
}
</style>
