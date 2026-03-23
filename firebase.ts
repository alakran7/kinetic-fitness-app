export interface Ejercicio {
  id: string;
  nombre: string;
  musculo: string;
  descripcion?: string;
}

export interface Rutina {
  id: string;
  nombre: string;
  descripcion?: string;
  duracionEstimada?: number;
  color?: string;
}

export interface RutinaEjercicio {
  id: string;
  rutinaId: string;
  ejercicioId: string;
  orden: number;
  seriesObjetivo?: number;
}

export interface HistorialSerie {
  id: string;
  userId: string;
  ejercicioId: string;
  rutinaId?: string;
  fecha: string; // YYYY-MM-DD
  peso: number;
  reps: number;
  serieIndex: number;
  timestamp: any;
}

export interface UserProfile {
  id: string;
  email: string;
  role: 'admin' | 'user';
}
