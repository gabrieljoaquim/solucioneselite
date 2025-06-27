// src/api/firebaseServiceHelpers.js
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/firebase/firebaseConfig'; // asegúrate de que esta ruta esté bien

// Obtiene servicios que fueron tomados por un trabajador para un cliente (nombre o email)
export async function getClosedServicesByClientAndWorker(client, worker) {
  try {
    const servicesRef = collection(db, 'services');
    const snapshot = await getDocs(servicesRef);

    return snapshot.docs
      .map(doc => ({ id: doc.id, ...doc.data() }))
      .filter(service =>
        (service.requester === client.name || service.requester === client.email) &&
        (service.takenById === worker._id || service.takenBy === worker.name || service.takenBy === worker.email)
      );
  } catch (error) {
    console.error('Error al obtener servicios:', error);
    return [];
  }
}

// Obtiene los IDs de los servicios ya reseñados por un cliente (reviews)
export async function getReviewedServiceIds(clientId) {
  try {
    const reviewsRef = collection(db, 'reviews');
    const q = query(reviewsRef, where('clientId', '==', clientId));
    const snapshot = await getDocs(q);

    return snapshot.docs.map(doc => doc.data().service);
  } catch (error) {
    console.error('Error al obtener reviews:', error);
    return [];
  }
}
