import axios from 'axios';

// Obtiene servicios cerrados por el cliente para un trabajador
export async function getClosedServicesByClientAndWorker(client, worker) {
  const res = await axios.get('https://solucioneselite-u60d.onrender.com/api/services');
  // Filtra servicios cerrados por el cliente, tomados por el trabajador
  // Client closure logic removed: return all services taken by worker for this client
  return res.data.filter(s =>
    (s.requester === client.name || s.requester === client.email) &&
    (s.takenById === worker._id || s.takenBy === worker.name || s.takenBy === worker.email)
  );
}

// Obtiene ids de servicios ya reseñados por el cliente
export async function getReviewedServiceIds(clientId) {
  const res = await axios.get('https://solucioneselite-u60d.onrender.com/api/reviews/worker/' + clientId);
  // Devuelve los ids de servicios ya reseñados por este cliente
  return res.data.map(r => r.service);
}
