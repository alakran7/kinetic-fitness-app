import { db, collection, doc, getDoc, getDocs, setDoc, updateDoc, deleteDoc, query, where, orderBy, onSnapshot, serverTimestamp, handleFirestoreError, OperationType, Timestamp } from '../firebase';
import { Ejercicio, Rutina, RutinaEjercicio, HistorialSerie } from '../types';

const EJERCICIOS_COL = 'ejercicios';
const RUTINAS_COL = 'rutinas';
const RUTINA_EJERCICIOS_COL = 'rutina_ejercicios';
const HISTORIAL_SERIES_COL = 'historial_series';

export const workoutService = {
  // Ejercicios
  async getEjercicios(): Promise<Ejercicio[]> {
    try {
      const snapshot = await getDocs(collection(db, EJERCICIOS_COL));
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Ejercicio));
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, EJERCICIOS_COL);
      return [];
    }
  },

  async addEjercicio(ejercicio: Omit<Ejercicio, 'id'>): Promise<string> {
    try {
      const newDoc = doc(collection(db, EJERCICIOS_COL));
      await setDoc(newDoc, ejercicio);
      return newDoc.id;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, EJERCICIOS_COL);
      return '';
    }
  },

  // Rutinas
  async getRutinas(): Promise<Rutina[]> {
    try {
      const snapshot = await getDocs(collection(db, RUTINAS_COL));
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Rutina));
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, RUTINAS_COL);
      return [];
    }
  },

  async addRutina(rutina: Omit<Rutina, 'id'>): Promise<string> {
    try {
      const newDoc = doc(collection(db, RUTINAS_COL));
      await setDoc(newDoc, rutina);
      return newDoc.id;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, RUTINAS_COL);
      return '';
    }
  },

  async getRutinaEjercicios(rutinaId: string): Promise<RutinaEjercicio[]> {
    try {
      const q = query(collection(db, RUTINA_EJERCICIOS_COL), where('rutinaId', '==', rutinaId), orderBy('orden'));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as RutinaEjercicio));
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, RUTINA_EJERCICIOS_COL);
      return [];
    }
  },

  async addRutinaEjercicio(rel: Omit<RutinaEjercicio, 'id'>): Promise<string> {
    try {
      const newDoc = doc(collection(db, RUTINA_EJERCICIOS_COL));
      await setDoc(newDoc, rel);
      return newDoc.id;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, RUTINA_EJERCICIOS_COL);
      return '';
    }
  },

  // Historial
  async upsertSerie(serie: Omit<HistorialSerie, 'id' | 'timestamp'>): Promise<string> {
    try {
      const serieId = `${serie.userId}_${serie.ejercicioId}_${serie.fecha}_${serie.serieIndex}`;
      const docRef = doc(db, HISTORIAL_SERIES_COL, serieId);
      await setDoc(docRef, {
        ...serie,
        timestamp: serverTimestamp()
      }, { merge: true });
      return serieId;
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, HISTORIAL_SERIES_COL);
      return '';
    }
  },

  async getHistorialHoy(userId: string, fecha: string): Promise<HistorialSerie[]> {
    try {
      const q = query(collection(db, HISTORIAL_SERIES_COL), where('userId', '==', userId), where('fecha', '==', fecha));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as HistorialSerie));
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, HISTORIAL_SERIES_COL);
      return [];
    }
  },

  async getHistorialEjercicio(userId: string, ejercicioId: string): Promise<HistorialSerie[]> {
    try {
      const q = query(
        collection(db, HISTORIAL_SERIES_COL),
        where('userId', '==', userId),
        where('ejercicioId', '==', ejercicioId),
        orderBy('fecha', 'asc')
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as HistorialSerie));
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, HISTORIAL_SERIES_COL);
      return [];
    }
  },

  async clearHistorial(userId: string): Promise<void> {
    try {
      const q = query(collection(db, HISTORIAL_SERIES_COL), where('userId', '==', userId));
      const snapshot = await getDocs(q);
      const deletePromises = snapshot.docs.map(d => deleteDoc(doc(db, HISTORIAL_SERIES_COL, d.id)));
      await Promise.all(deletePromises);
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, HISTORIAL_SERIES_COL);
    }
  },

  // Initialization
  async initializeDefaultData() {
    const ejercicios = await this.getEjercicios();
    if (ejercicios.length === 0) {
      const defaults = [
        { nombre: 'Press de Banca', musculo: 'Pecho', descripcion: 'Press con barra en banco plano' },
        { nombre: 'Sentadilla', musculo: 'Piernas', descripcion: 'Sentadilla con barra' },
        { nombre: 'Peso Muerto', musculo: 'Espalda/Piernas', descripcion: 'Peso muerto convencional' },
        { nombre: 'Press Militar', musculo: 'Hombros', descripcion: 'Press de hombros con barra' },
        { nombre: 'Remo con Barra', musculo: 'Espalda', descripcion: 'Remo inclinado con barra' },
        { nombre: 'Dominadas', musculo: 'Espalda', descripcion: 'Dominadas con agarre prono' },
        { nombre: 'Curl de Bíceps', musculo: 'Bíceps', descripcion: 'Curl con barra Z' },
        { nombre: 'Press Francés', musculo: 'Tríceps', descripcion: 'Extensión de tríceps con barra Z' }
      ];
      
      const ejIds: string[] = [];
      for (const ej of defaults) {
        const id = await this.addEjercicio(ej);
        ejIds.push(id);
      }

      const routines = [
        { nombre: 'Día de Empuje', descripcion: 'Pecho, Hombros, Tríceps', duracionEstimada: 75, color: '#8eff71' },
        { nombre: 'Día de Tirón', descripcion: 'Espalda, Bíceps', duracionEstimada: 85, color: '#8397ff' },
        { nombre: 'Día de Pierna', descripcion: 'Cuádriceps, Isquios, Gemelos', duracionEstimada: 95, color: '#84dde4' }
      ];
      
      for (let i = 0; i < routines.length; i++) {
        const rId = await this.addRutina(routines[i]);
        if (i === 0) { // Push
          await this.addRutinaEjercicio({ rutinaId: rId, ejercicioId: ejIds[0], orden: 1, seriesObjetivo: 4 });
          await this.addRutinaEjercicio({ rutinaId: rId, ejercicioId: ejIds[3], orden: 2, seriesObjetivo: 3 });
          await this.addRutinaEjercicio({ rutinaId: rId, ejercicioId: ejIds[7], orden: 3, seriesObjetivo: 3 });
        }
      }
    }
  }
};
