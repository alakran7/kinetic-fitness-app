import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Timer, 
  Dumbbell, 
  TrendingUp, 
  User as UserIcon, 
  Plus, 
  Check, 
  ChevronRight, 
  Search, 
  History, 
  LogOut, 
  Play, 
  Pause, 
  RotateCcw,
  Clock,
  Award,
  ArrowLeft,
  Trash2,
  Calendar as CalendarIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  auth, 
  googleProvider, 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged, 
  User,
  Timestamp
} from './firebase';
import { workoutService } from './services/workoutService';
import { Ejercicio, Rutina, HistorialSerie } from './types';
import { format, startOfDay, isSameDay } from 'date-fns';
import { es } from 'date-fns/locale';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Utility for tailwind classes
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- Components ---

const BottomNav = ({ activeTab, setActiveTab }: { activeTab: string, setActiveTab: (tab: string) => void }) => {
  const tabs = [
    { id: 'hoy', label: 'Hoy', icon: Timer },
    { id: 'rutinas', label: 'Rutinas', icon: Dumbbell },
    { id: 'historial', label: 'Historial', icon: CalendarIcon },
    { id: 'progreso', label: 'Progreso', icon: TrendingUp },
    { id: 'perfil', label: 'Perfil', icon: UserIcon },
  ];

  return (
    <nav className="fixed bottom-0 left-0 w-full bg-[#0e0e0e]/90 backdrop-blur-xl border-t border-[#8eff71]/10 h-20 flex justify-around items-center px-4 z-50">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "flex flex-col items-center justify-center transition-all duration-200",
              isActive ? "text-[#8eff71] scale-110" : "text-[#adaaaa] opacity-60 hover:opacity-100"
            )}
          >
            <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
            <span className="text-[10px] font-bold uppercase tracking-widest mt-1">{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
};

const RestTimer = ({ duration, onComplete }: { duration: number, onComplete: () => void }) => {
  const [timeLeft, setTimeLeft] = useState(duration);
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    let interval: any;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      onComplete();
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft, onComplete]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <div className="bg-[#1A1A1A] p-4 rounded-xl flex items-center justify-between border border-[#8eff71]/20">
      <div className="flex items-center gap-3">
        <Clock className="text-[#8eff71]" size={20} />
        <span className="font-black text-xl tabular-nums">
          {minutes}:{seconds.toString().padStart(2, '0')}
        </span>
      </div>
      <div className="flex gap-2">
        <button onClick={() => setIsActive(!isActive)} className="p-2 bg-surface-container-low rounded-full">
          {isActive ? <Pause size={16} /> : <Play size={16} />}
        </button>
        <button onClick={() => setTimeLeft(duration)} className="p-2 bg-surface-container-low rounded-full">
          <RotateCcw size={16} />
        </button>
      </div>
    </div>
  );
};

// --- Screens ---

const LoginScreen = ({ onLogin }: { onLogin: () => void }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async () => {
    if (password === 'kinetic2026') {
      try {
        await signInWithPopup(auth, googleProvider);
        onLogin();
      } catch (err) {
        setError('Error al iniciar sesión con Google');
      }
    } else {
      setError('Contraseña incorrecta');
    }
  };

  return (
    <div className="min-h-screen bg-surface flex flex-col items-center justify-center p-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md space-y-8 text-center"
      >
        <div className="flex flex-col items-center gap-2">
          <Timer className="text-[#8eff71]" size={64} />
          <h1 className="text-5xl font-black italic tracking-tighter uppercase text-[#8eff71]">KINETIC</h1>
          <p className="text-on-surface-variant font-bold uppercase tracking-widest text-xs">Progresión Sobrecargada</p>
        </div>

        <div className="space-y-4 bg-[#1A1A1A] p-8 rounded-2xl shadow-2xl border border-white/5">
          <div className="space-y-2 text-left">
            <label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">Acceso de Atleta</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-surface-container-low border-none rounded-xl p-4 text-xl font-black tracking-widest focus:ring-2 focus:ring-[#8eff71] transition-all"
            />
          </div>
          {error && <p className="text-error text-xs font-bold uppercase">{error}</p>}
          <button 
            onClick={handleLogin}
            className="w-full bg-[#8eff71] text-black font-black py-4 rounded-xl uppercase tracking-tighter hover:scale-[1.02] active:scale-95 transition-all shadow-[0px_10px_20px_rgba(142,255,113,0.2)]"
          >
            Entrar al Gimnasio
          </button>
        </div>
        <p className="text-on-surface-variant text-[10px] uppercase tracking-widest opacity-50">Solo personal autorizado</p>
      </motion.div>
    </div>
  );
};

const HoyScreen = ({ user, activeRoutine, onFinishRoutine }: { user: User, activeRoutine: Rutina | null, onFinishRoutine: () => void }) => {
  console.log("HoyScreen: Rendering with activeRoutine:", activeRoutine?.nombre);
  const [ejercicios, setEjercicios] = useState<Ejercicio[]>([]);
  const [historial, setHistorial] = useState<HistorialSerie[]>([]);
  const [selectedEjercicio, setSelectedEjercicio] = useState<Ejercicio | null>(null);
  const [routineEjercicios, setRoutineEjercicios] = useState<Ejercicio[]>([]);
  const [peso, setPeso] = useState('');
  const [reps, setReps] = useState('');
  const [showTimer, setShowTimer] = useState(false);
  const [search, setSearch] = useState('');
  const [showAllExercises, setShowAllExercises] = useState(false);

  useEffect(() => {
    if (!activeRoutine) {
      setSelectedEjercicio(null);
    }
  }, [activeRoutine]);

  const fechaHoy = format(new Date(), 'yyyy-MM-dd');

  useEffect(() => {
    const loadData = async () => {
      console.log("HoyScreen: Loading data for routine:", activeRoutine?.nombre);
      const ejs = await workoutService.getEjercicios();
      setEjercicios(ejs);
      const hist = await workoutService.getHistorialHoy(user.uid, fechaHoy);
      setHistorial(hist);

      if (activeRoutine) {
        const rels = await workoutService.getRutinaEjercicios(activeRoutine.id);
        const routineEjs = rels.map(rel => ejs.find(e => e.id === rel.ejercicioId)).filter(Boolean) as Ejercicio[];
        setRoutineEjercicios(routineEjs);
      } else {
        setRoutineEjercicios([]);
      }
    };
    loadData();
  }, [user.uid, fechaHoy, activeRoutine]);

  const handleSaveSerie = async () => {
    if (!selectedEjercicio || !peso || !reps) return;

    const serieIndex = historial.filter(h => h.ejercicioId === selectedEjercicio.id).length;
    const newSerie: Omit<HistorialSerie, 'id' | 'timestamp'> = {
      userId: user.uid,
      ejercicioId: selectedEjercicio.id,
      fecha: fechaHoy,
      peso: parseFloat(peso),
      reps: parseInt(reps),
      serieIndex,
      rutinaId: activeRoutine?.id
    };

    await workoutService.upsertSerie(newSerie);
    const updatedHist = await workoutService.getHistorialHoy(user.uid, fechaHoy);
    setHistorial(updatedHist);
    
    setReps('');
    setShowTimer(true);
  };

  const filteredEjercicios = ejercicios.filter(e => 
    e.nombre.toLowerCase().includes(search.toLowerCase()) || 
    e.musculo.toLowerCase().includes(search.toLowerCase())
  );

  const seriesCompletadas = selectedEjercicio 
    ? historial.filter(h => h.ejercicioId === selectedEjercicio.id)
    : [];

  // Ejercicios realizados hoy que NO están en la rutina activa
  const extraRealizados = historial
    .map(h => ejercicios.find(e => e.id === h.ejercicioId))
    .filter((e, idx, self) => 
      e && 
      !routineEjercicios.some(re => re.id === e.id) && 
      self.findIndex(s => s?.id === e.id) === idx
    ) as Ejercicio[];

  return (
    <div className="space-y-8 pb-20">
      <section className="flex justify-between items-start">
        <div>
          <p className="text-[#8eff71] font-bold uppercase tracking-[0.2em] text-xs mb-2">Entrenamiento</p>
          <h2 className="text-5xl font-black tracking-tighter uppercase leading-none italic">
            {activeRoutine ? activeRoutine.nombre : 'Sesión Libre'}
          </h2>
          <p className="text-on-surface-variant font-bold mt-2">{format(new Date(), 'EEEE, d MMMM')}</p>
        </div>
        {activeRoutine && (
          <button 
            onClick={() => {
              console.log("HoyScreen: Finalizar button clicked");
              onFinishRoutine();
            }}
            className="bg-surface-container-low text-xs font-black uppercase tracking-widest px-4 py-2 rounded-lg border border-white/10 hover:bg-white/5"
          >
            Finalizar
          </button>
        )}
      </section>

      {!selectedEjercicio ? (
        <div className="space-y-6">
          {activeRoutine && (
            <div className="space-y-6">
              <div className="space-y-4">
                <h4 className="text-xs font-black uppercase tracking-widest text-on-surface-variant">Ejercicios de la Rutina</h4>
                <div className="grid grid-cols-1 gap-4">
                  {routineEjercicios.map(ej => {
                    const done = historial.some(h => h.ejercicioId === ej.id);
                    return (
                      <button 
                        key={ej.id}
                        onClick={() => setSelectedEjercicio(ej)}
                        className={cn(
                          "bg-[#1A1A1A] p-6 rounded-xl flex justify-between items-center group transition-all border-l-4",
                          done ? "border-[#8eff71] opacity-60" : "border-transparent"
                        )}
                      >
                        <div className="text-left">
                          <span className="text-[10px] font-black uppercase tracking-widest text-[#8eff71]">{ej.musculo}</span>
                          <h3 className="text-xl font-black uppercase tracking-tight">{ej.nombre}</h3>
                        </div>
                        {done ? <Check className="text-[#8eff71]" /> : <ChevronRight className="text-on-surface-variant" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {extraRealizados.length > 0 && (
                <div className="space-y-4">
                  <h4 className="text-xs font-black uppercase tracking-widest text-on-surface-variant">Ejercicios Extra Realizados</h4>
                  <div className="grid grid-cols-1 gap-4">
                    {extraRealizados.map(ej => (
                      <button 
                        key={ej.id}
                        onClick={() => setSelectedEjercicio(ej)}
                        className="bg-[#1A1A1A] p-6 rounded-xl flex justify-between items-center group transition-all border-l-4 border-[#8397ff] opacity-80"
                      >
                        <div className="text-left">
                          <span className="text-[10px] font-black uppercase tracking-widest text-[#8397ff]">{ej.musculo}</span>
                          <h3 className="text-xl font-black uppercase tracking-tight">{ej.nombre}</h3>
                        </div>
                        <Check className="text-[#8397ff]" />
                      </button>
                    ))}
                  </div>
                </div>
              )}
              
              {!showAllExercises && (
                <button 
                  onClick={() => setShowAllExercises(true)}
                  className="w-full py-4 border border-dashed border-white/10 rounded-xl text-xs font-black uppercase tracking-widest text-on-surface-variant hover:text-white transition-colors"
                >
                  + Agregar ejercicio extra a esta sesión
                </button>
              )}
            </div>
          )}

          {(!activeRoutine || showAllExercises) && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h4 className="text-xs font-black uppercase tracking-widest text-on-surface-variant">
                  {activeRoutine ? 'Todos los Ejercicios' : 'Selecciona un Ejercicio'}
                </h4>
                {activeRoutine && (
                  <button onClick={() => setShowAllExercises(false)} className="text-[10px] font-black uppercase tracking-widest text-[#8eff71]">Ocultar</button>
                )}
              </div>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant" size={20} />
                <input 
                  type="text" 
                  placeholder="Buscar ejercicios..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-[#1A1A1A] border-none rounded-xl py-4 pl-12 pr-4 font-bold focus:ring-2 focus:ring-[#8eff71]"
                />
              </div>
              <div className="grid grid-cols-1 gap-4">
                {filteredEjercicios.map(ej => (
                  <button 
                    key={ej.id}
                    onClick={() => setSelectedEjercicio(ej)}
                    className="bg-[#1A1A1A] p-6 rounded-xl flex justify-between items-center group hover:bg-[#222] transition-all"
                  >
                    <div className="text-left">
                      <span className="text-[10px] font-black uppercase tracking-widest text-[#8eff71]">{ej.musculo}</span>
                      <h3 className="text-xl font-black uppercase tracking-tight">{ej.nombre}</h3>
                    </div>
                    <Plus className="text-on-surface-variant group-hover:text-[#8eff71] transition-colors" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-6"
        >
          <button 
            onClick={() => setSelectedEjercicio(null)}
            className="flex items-center gap-2 text-on-surface-variant hover:text-white transition-colors"
          >
            <ArrowLeft size={20} />
            <span className="font-bold uppercase text-xs tracking-widest">Volver a la lista</span>
          </button>

          <div className="bg-[#1A1A1A] p-8 rounded-2xl border-l-4 border-[#8eff71]">
            <span className="text-xs font-black uppercase tracking-widest text-[#8eff71]">{selectedEjercicio.musculo}</span>
            <h3 className="text-4xl font-black uppercase tracking-tighter">{selectedEjercicio.nombre}</h3>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">Peso (kg)</label>
              <input 
                type="number" 
                value={peso}
                onChange={(e) => setPeso(e.target.value)}
                placeholder="0.0"
                className="w-full bg-[#1A1A1A] border-none rounded-xl p-6 text-3xl font-black text-center focus:ring-2 focus:ring-[#8eff71]"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">Reps</label>
              <input 
                type="number" 
                value={reps}
                onChange={(e) => setReps(e.target.value)}
                placeholder="0"
                className="w-full bg-[#1A1A1A] border-none rounded-xl p-6 text-3xl font-black text-center focus:ring-2 focus:ring-[#8eff71]"
              />
            </div>
          </div>

          <button 
            onClick={handleSaveSerie}
            disabled={!peso || !reps}
            className="w-full bg-[#8eff71] text-black font-black py-6 rounded-xl uppercase tracking-tighter flex items-center justify-center gap-3 shadow-[0px_10px_30px_rgba(142,255,113,0.2)] disabled:opacity-50"
          >
            <Check size={24} strokeWidth={3} />
            Completar Serie
          </button>

          {showTimer && (
            <RestTimer duration={90} onComplete={() => setShowTimer(false)} />
          )}

          <div className="space-y-4">
            <h4 className="text-xs font-black uppercase tracking-widest text-on-surface-variant">Series de Hoy</h4>
            {seriesCompletadas.length === 0 ? (
              <p className="text-on-surface-variant italic text-sm">No hay series registradas aún.</p>
            ) : (
              <div className="space-y-2">
                {seriesCompletadas.map((s, idx) => (
                  <div key={s.id} className="bg-surface-container-low p-4 rounded-xl flex justify-between items-center">
                    <span className="font-black text-[#8eff71]">SET {idx + 1}</span>
                    <div className="flex gap-4 font-bold">
                      <span>{s.peso} KG</span>
                      <span className="text-on-surface-variant">x</span>
                      <span>{s.reps} REPS</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
};

const RutinasScreen = ({ onSelectRoutine, onCreateRoutine, onEditRoutine }: { onSelectRoutine: (r: Rutina) => void, onCreateRoutine: () => void, onEditRoutine: (r: Rutina) => void }) => {
  const [rutinas, setRutinas] = useState<Rutina[]>([]);

  useEffect(() => {
    const loadData = async () => {
      const r = await workoutService.getRutinas();
      setRutinas(r);
    };
    loadData();
  }, []);

  return (
    <div className="space-y-8">
      <section className="flex justify-between items-end">
        <div>
          <p className="text-[#8397ff] font-bold uppercase tracking-[0.2em] text-xs mb-2">Entrenamiento</p>
          <h2 className="text-5xl font-black tracking-tighter uppercase leading-none italic">Tus Rutinas</h2>
        </div>
        <button 
          onClick={onCreateRoutine}
          className="bg-[#8eff71] text-black p-3 rounded-xl shadow-lg active:scale-90 transition-all"
        >
          <Plus size={24} />
        </button>
      </section>

      <div className="space-y-6">
        {rutinas.map(r => (
          <div 
            key={r.id} 
            className="bg-[#1A1A1A] rounded-xl overflow-hidden group shadow-2xl relative"
          >
            <div className="p-8 relative z-10 flex flex-col md:flex-row md:justify-between md:items-end gap-6">
              <div className="flex-1 cursor-pointer" onClick={() => onSelectRoutine(r)}>
                <div className="flex items-center gap-2 mb-4">
                  <span className="bg-secondary text-black text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest">Plan</span>
                  <span className="text-on-surface-variant text-xs font-bold uppercase tracking-widest italic">Sesión</span>
                </div>
                <h3 className="text-4xl font-black tracking-tighter uppercase mb-2">{r.nombre}</h3>
                <p className="text-on-surface-variant font-medium text-sm max-w-md">{r.descripcion}</p>
              </div>
              <div className="flex flex-col items-start md:items-end gap-4">
                <div className="flex items-center gap-2 text-on-surface-variant">
                  <Clock size={16} />
                  <span className="text-xs font-bold uppercase tracking-tighter">{r.duracionEstimada} MIN ESTIMADOS</span>
                </div>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    onEditRoutine(r);
                  }}
                  className="bg-surface-container-low text-xs font-black uppercase tracking-widest px-4 py-2 rounded-lg border border-white/10 hover:bg-white/5 transition-colors"
                >
                  Editar
                </button>
              </div>
            </div>
            <div className="h-1.5 w-full bg-surface-container-low" style={{ backgroundColor: (r.color || '#8eff71') + '20' }}>
              <div className="h-full w-1/3" style={{ backgroundColor: r.color || '#8eff71' }}></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const CreateExerciseModal = ({ onClose, onCreated }: { onClose: () => void, onCreated: () => void }) => {
  const [nombre, setNombre] = useState('');
  const [musculo, setMusculo] = useState('Pecho');
  const [descripcion, setDescripcion] = useState('');

  const handleCreate = async () => {
    if (!nombre || !musculo) return;
    await workoutService.addEjercicio({ nombre, musculo, descripcion });
    onCreated();
    onClose();
  };

  const musculos = ['Pecho', 'Espalda', 'Piernas', 'Hombros', 'Bíceps', 'Tríceps', 'Core', 'Cardio'];

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[110] flex items-center justify-center p-6">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-[#1A1A1A] w-full max-w-md rounded-2xl p-8 space-y-6 border border-white/5"
      >
        <h3 className="text-3xl font-black uppercase tracking-tighter italic">Nuevo Ejercicio</h3>
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">Nombre</label>
            <input 
              type="text" 
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Ej: Press inclinado"
              className="w-full bg-surface-container-low border-none rounded-xl p-4 font-bold focus:ring-2 focus:ring-[#8eff71]"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">Grupo Muscular</label>
            <select 
              value={musculo}
              onChange={(e) => setMusculo(e.target.value)}
              className="w-full bg-surface-container-low border-none rounded-xl p-4 font-bold focus:ring-2 focus:ring-[#8eff71] appearance-none"
            >
              {musculos.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">Descripción (opcional)</label>
            <textarea 
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              className="w-full bg-surface-container-low border-none rounded-xl p-4 font-bold focus:ring-2 focus:ring-[#8eff71] h-20"
            />
          </div>
        </div>
        <div className="flex gap-4">
          <button onClick={onClose} className="flex-1 bg-surface-container-low font-black py-4 rounded-xl uppercase tracking-tighter">Cancelar</button>
          <button onClick={handleCreate} className="flex-1 bg-[#8eff71] text-black font-black py-4 rounded-xl uppercase tracking-tighter">Guardar</button>
        </div>
      </motion.div>
    </div>
  );
};

const EditExerciseModal = ({ ejercicio, onClose, onUpdated }: { ejercicio: Ejercicio, onClose: () => void, onUpdated: () => void }) => {
  const [nombre, setNombre] = useState(ejercicio.nombre);
  const [musculo, setMusculo] = useState(ejercicio.musculo);
  const [descripcion, setDescripcion] = useState(ejercicio.descripcion || '');
  const [isDeleting, setIsDeleting] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleUpdate = async () => {
    if (!nombre || !musculo) return;
    setIsProcessing(true);
    try {
      await workoutService.updateEjercicio(ejercicio.id, { nombre, musculo, descripcion });
      onUpdated();
      onClose();
    } catch (error) {
      console.error("Error in handleUpdate exercise:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDelete = async () => {
    setIsProcessing(true);
    try {
      await workoutService.deleteEjercicio(ejercicio.id);
      onUpdated();
      onClose();
    } catch (error) {
      console.error("Error in handleDelete exercise:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const musculos = ['Pecho', 'Espalda', 'Piernas', 'Hombros', 'Bíceps', 'Tríceps', 'Core', 'Cardio'];

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[110] flex items-center justify-center p-6">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-[#1A1A1A] w-full max-w-md rounded-2xl p-8 space-y-6 border border-white/5"
      >
        <h3 className="text-3xl font-black uppercase tracking-tighter italic">Editar Ejercicio</h3>
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">Nombre</label>
            <input 
              type="text" 
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              className="w-full bg-surface-container-low border-none rounded-xl p-4 font-bold focus:ring-2 focus:ring-[#8eff71]"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">Grupo Muscular</label>
            <select 
              value={musculo}
              onChange={(e) => setMusculo(e.target.value)}
              className="w-full bg-surface-container-low border-none rounded-xl p-4 font-bold focus:ring-2 focus:ring-[#8eff71] appearance-none"
            >
              {musculos.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">Descripción</label>
            <textarea 
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              className="w-full bg-surface-container-low border-none rounded-xl p-4 font-bold focus:ring-2 focus:ring-[#8eff71] h-20"
            />
          </div>
        </div>
        <div className="flex flex-col gap-3">
          <div className="flex gap-4">
            <button 
              onClick={onClose} 
              disabled={isProcessing}
              className="flex-1 bg-surface-container-low font-black py-4 rounded-xl uppercase tracking-tighter disabled:opacity-50"
            >
              Cancelar
            </button>
            <button 
              onClick={handleUpdate} 
              disabled={isProcessing}
              className="flex-1 bg-[#8eff71] text-black font-black py-4 rounded-xl uppercase tracking-tighter disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isProcessing ? (
                <>
                  <Timer className="animate-spin" size={16} />
                  Guardando...
                </>
              ) : (
                'Guardar'
              )}
            </button>
          </div>
          
          {!isDeleting ? (
            <button 
              onClick={() => setIsDeleting(true)}
              className="w-full py-2 text-error/60 text-[10px] font-black uppercase tracking-widest hover:text-error transition-colors"
            >
              Eliminar Ejercicio
            </button>
          ) : (
            <div className="bg-error/10 p-4 rounded-xl space-y-3 border border-error/20">
              <p className="text-xs font-bold text-center">¿Confirmas eliminar este ejercicio?</p>
              <div className="flex gap-2">
                <button 
                  onClick={() => setIsDeleting(false)} 
                  disabled={isProcessing}
                  className="flex-1 bg-surface-container-low text-[10px] font-black py-2 rounded-lg uppercase disabled:opacity-50"
                >
                  No
                </button>
                <button 
                  onClick={handleDelete} 
                  disabled={isProcessing}
                  className="flex-1 bg-error text-white text-[10px] font-black py-2 rounded-lg uppercase disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isProcessing ? (
                    <>
                      <Timer className="animate-spin" size={12} />
                      Eliminando...
                    </>
                  ) : (
                    'Sí, Eliminar'
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

const CreateRoutineModal = ({ onClose, onCreated }: { onClose: () => void, onCreated: () => void }) => {
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [duracion, setDuracion] = useState('60');
  const [ejercicios, setEjercicios] = useState<Ejercicio[]>([]);
  const [selectedEjIds, setSelectedEjIds] = useState<string[]>([]);
  const [step, setStep] = useState(1);

  useEffect(() => {
    const loadData = async () => {
      const ejs = await workoutService.getEjercicios();
      setEjercicios(ejs);
    };
    loadData();
  }, []);

  const handleCreate = async () => {
    if (!nombre) return;
    const rId = await workoutService.addRutina({
      nombre,
      descripcion,
      duracionEstimada: parseInt(duracion),
      color: '#8eff71'
    });

    // Add selected exercises
    for (let i = 0; i < selectedEjIds.length; i++) {
      await workoutService.addRutinaEjercicio({
        rutinaId: rId,
        ejercicioId: selectedEjIds[i],
        orden: i + 1,
        seriesObjetivo: 3
      });
    }

    onCreated();
    onClose();
  };

  const toggleEj = (id: string) => {
    setSelectedEjIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-6">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-[#1A1A1A] w-full max-w-md rounded-2xl p-8 space-y-6 border border-white/5 max-h-[90vh] overflow-y-auto"
      >
        <div className="flex justify-between items-center">
          <h3 className="text-3xl font-black uppercase tracking-tighter italic">
            {step === 1 ? 'Nueva Rutina' : 'Asignar Ejercicios'}
          </h3>
          <span className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest">Paso {step}/2</span>
        </div>

        {step === 1 ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">Nombre</label>
              <input 
                type="text" 
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Ej: Empuje A"
                className="w-full bg-surface-container-low border-none rounded-xl p-4 font-bold focus:ring-2 focus:ring-[#8eff71]"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">Descripción</label>
              <textarea 
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                placeholder="Ej: Pecho y Tríceps..."
                className="w-full bg-surface-container-low border-none rounded-xl p-4 font-bold focus:ring-2 focus:ring-[#8eff71] h-24"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">Duración (min)</label>
              <input 
                type="number" 
                value={duracion}
                onChange={(e) => setDuracion(e.target.value)}
                className="w-full bg-surface-container-low border-none rounded-xl p-4 font-bold focus:ring-2 focus:ring-[#8eff71]"
              />
            </div>
            <div className="flex gap-4">
              <button 
                onClick={onClose}
                className="flex-1 bg-surface-container-low font-black py-4 rounded-xl uppercase tracking-tighter"
              >
                Cancelar
              </button>
              <button 
                onClick={() => setStep(2)}
                disabled={!nombre}
                className="flex-1 bg-[#8eff71] text-black font-black py-4 rounded-xl uppercase tracking-tighter disabled:opacity-50"
              >
                Siguiente
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2 max-h-64 overflow-y-auto pr-2">
              {ejercicios.map(ej => (
                <button 
                  key={ej.id}
                  onClick={() => toggleEj(ej.id)}
                  className={cn(
                    "w-full p-4 rounded-xl flex justify-between items-center transition-all mb-2",
                    selectedEjIds.includes(ej.id) ? "bg-[#8eff71] text-black" : "bg-surface-container-low text-on-surface"
                  )}
                >
                  <div className="text-left">
                    <p className="text-[10px] font-black uppercase tracking-widest opacity-70">{ej.musculo}</p>
                    <p className="font-bold uppercase">{ej.nombre}</p>
                  </div>
                  {selectedEjIds.includes(ej.id) && <Check size={16} strokeWidth={3} />}
                </button>
              ))}
            </div>
            <div className="flex gap-4">
              <button onClick={() => setStep(1)} className="flex-1 bg-surface-container-low font-black py-4 rounded-xl uppercase tracking-tighter">Atrás</button>
              <button onClick={handleCreate} className="flex-1 bg-[#8eff71] text-black font-black py-4 rounded-xl uppercase tracking-tighter">Finalizar</button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};

const EditRoutineModal = ({ routine, onClose, onUpdated }: { routine: Rutina, onClose: () => void, onUpdated: () => void }) => {
  const [nombre, setNombre] = useState(routine.nombre);
  const [descripcion, setDescripcion] = useState(routine.descripcion || '');
  const [duracion, setDuracion] = useState(routine.duracionEstimada?.toString() || '60');
  const [ejercicios, setEjercicios] = useState<Ejercicio[]>([]);
  const [selectedEjIds, setSelectedEjIds] = useState<string[]>([]);
  const [step, setStep] = useState(1);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      const ejs = await workoutService.getEjercicios();
      setEjercicios(ejs);
      const rels = await workoutService.getRutinaEjercicios(routine.id);
      setSelectedEjIds(rels.map(r => r.ejercicioId));
    };
    loadData();
  }, [routine.id]);

  const handleUpdate = async () => {
    if (!nombre) return;
    setIsProcessing(true);
    try {
      await workoutService.updateRutina(routine.id, {
        nombre,
        descripcion,
        duracionEstimada: parseInt(duracion)
      });

      await workoutService.syncRutinaEjercicios(routine.id, selectedEjIds);

      onUpdated();
      onClose();
    } catch (error) {
      console.error("Error in handleUpdate:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDelete = async () => {
    setIsProcessing(true);
    try {
      await workoutService.deleteRutina(routine.id);
      onUpdated();
      onClose();
    } catch (error) {
      console.error("Error in handleDelete:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const toggleEj = (id: string) => {
    setSelectedEjIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-6">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-[#1A1A1A] w-full max-w-md rounded-2xl p-8 space-y-6 border border-white/5 max-h-[90vh] overflow-y-auto"
      >
        <div className="flex justify-between items-center">
          <h3 className="text-3xl font-black uppercase tracking-tighter italic">
            {step === 1 ? 'Editar Rutina' : 'Gestionar Ejercicios'}
          </h3>
          <span className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest">Paso {step}/2</span>
        </div>

        {step === 1 ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">Nombre</label>
              <input 
                type="text" 
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                className="w-full bg-surface-container-low border-none rounded-xl p-4 font-bold focus:ring-2 focus:ring-[#8eff71]"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">Descripción</label>
              <textarea 
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                className="w-full bg-surface-container-low border-none rounded-xl p-4 font-bold focus:ring-2 focus:ring-[#8eff71] h-24"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">Duración (min)</label>
              <input 
                type="number" 
                value={duracion}
                onChange={(e) => setDuracion(e.target.value)}
                className="w-full bg-surface-container-low border-none rounded-xl p-4 font-bold focus:ring-2 focus:ring-[#8eff71]"
              />
            </div>
            
            <div className="flex flex-col gap-3">
              <div className="flex gap-4">
                <button 
                  onClick={onClose}
                  className="flex-1 bg-surface-container-low font-black py-4 rounded-xl uppercase tracking-tighter"
                >
                  Cancelar
                </button>
                <button 
                  onClick={() => setStep(2)}
                  disabled={!nombre}
                  className="flex-1 bg-[#8eff71] text-black font-black py-4 rounded-xl uppercase tracking-tighter disabled:opacity-50"
                >
                  Ejercicios
                </button>
              </div>
              
              {!isDeleting ? (
                <button 
                  onClick={() => setIsDeleting(true)}
                  className="w-full py-3 text-error/60 text-[10px] font-black uppercase tracking-widest hover:text-error transition-colors"
                >
                  Eliminar Rutina
                </button>
              ) : (
                <div className="bg-error/10 p-4 rounded-xl space-y-3 border border-error/20">
                  <p className="text-xs font-bold text-center">¿Confirmas eliminar esta rutina?</p>
                <div className="flex gap-2">
                  <button 
                    onClick={() => setIsDeleting(false)} 
                    disabled={isProcessing}
                    className="flex-1 bg-surface-container-low text-[10px] font-black py-2 rounded-lg uppercase disabled:opacity-50"
                  >
                    No
                  </button>
                  <button 
                    onClick={handleDelete} 
                    disabled={isProcessing}
                    className="flex-1 bg-error text-white text-[10px] font-black py-2 rounded-lg uppercase disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isProcessing ? (
                      <>
                        <Timer className="animate-spin" size={12} />
                        Eliminando...
                      </>
                    ) : (
                      'Sí, Eliminar'
                    )}
                  </button>
                </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2 max-h-64 overflow-y-auto pr-2">
              {ejercicios.map(ej => (
                <button 
                  key={ej.id}
                  onClick={() => toggleEj(ej.id)}
                  className={cn(
                    "w-full p-4 rounded-xl flex justify-between items-center transition-all mb-2",
                    selectedEjIds.includes(ej.id) ? "bg-[#8eff71] text-black" : "bg-surface-container-low text-on-surface"
                  )}
                >
                  <div className="text-left">
                    <p className="text-[10px] font-black uppercase tracking-widest opacity-70">{ej.musculo}</p>
                    <p className="font-bold uppercase">{ej.nombre}</p>
                  </div>
                  {selectedEjIds.includes(ej.id) && <Check size={16} strokeWidth={3} />}
                </button>
              ))}
            </div>
            <div className="flex gap-4">
              <button 
                onClick={() => setStep(1)} 
                disabled={isProcessing}
                className="flex-1 bg-surface-container-low font-black py-4 rounded-xl uppercase tracking-tighter disabled:opacity-50"
              >
                Atrás
              </button>
              <button 
                onClick={handleUpdate} 
                disabled={isProcessing}
                className="flex-1 bg-[#8eff71] text-black font-black py-4 rounded-xl uppercase tracking-tighter disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isProcessing ? (
                  <>
                    <Timer className="animate-spin" size={16} />
                    Guardando...
                  </>
                ) : (
                  'Guardar'
                )}
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};

const ProgresoScreen = ({ user }: { user: User }) => {
  const [ejercicios, setEjercicios] = useState<Ejercicio[]>([]);
  const [selectedEj, setSelectedEj] = useState<Ejercicio | null>(null);
  const [data, setData] = useState<any[]>([]);
  const [prs, setPrs] = useState<{peso: number, reps: number, fecha: string}[]>([]);

  useEffect(() => {
    const loadData = async () => {
      const ejs = await workoutService.getEjercicios();
      setEjercicios(ejs);
    };
    loadData();
  }, []);

  useEffect(() => {
    if (selectedEj) {
      const loadHistData = async () => {
        const hist = await workoutService.getHistorialEjercicio(user.uid, selectedEj.id);
        
        const chartData = hist.reduce((acc: any[], curr) => {
          const date = format(new Date(curr.fecha + 'T00:00:00'), 'dd/MM');
          const oneRM = curr.peso * (1 + curr.reps / 30);
          
          const existing = acc.find(a => a.date === date);
          if (existing) {
            existing.oneRM = Math.max(existing.oneRM, oneRM);
            existing.weight = Math.max(existing.weight, curr.peso);
          } else {
            acc.push({ date, oneRM: Math.round(oneRM), weight: curr.peso });
          }
          return acc;
        }, []);

        setData(chartData);

        const sorted = [...hist].sort((a, b) => b.peso - a.peso);
        setPrs(sorted.slice(0, 3).map(s => ({ peso: s.peso, reps: s.reps, fecha: s.fecha })));
      };
      loadHistData();
    }
  }, [selectedEj, user.uid]);

  return (
    <div className="space-y-8">
      <section>
        <p className="text-[#84dde4] font-bold uppercase tracking-[0.2em] text-xs mb-2">Analytics</p>
        <h2 className="text-5xl font-black tracking-tighter uppercase leading-none italic">Progreso</h2>
      </section>

      <div className="space-y-6">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant" size={20} />
          <select 
            onChange={(e) => setSelectedEj(ejercicios.find(ej => ej.id === e.target.value) || null)}
            className="w-full bg-[#1A1A1A] border-none rounded-xl py-4 pl-12 pr-4 font-bold focus:ring-2 focus:ring-[#84dde4] appearance-none"
          >
            <option value="">Seleccionar ejercicio...</option>
            {ejercicios.map(ej => (
              <option key={ej.id} value={ej.id}>{ej.nombre}</option>
            ))}
          </select>
        </div>

        {selectedEj && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            <div className="bg-[#1A1A1A] p-6 rounded-2xl h-80">
              <h4 className="text-xs font-black uppercase tracking-widest text-on-surface-variant mb-6">Estimado 1RM (kg)</h4>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                  <XAxis dataKey="date" stroke="#666" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis stroke="#666" fontSize={10} tickLine={false} axisLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1A1A1A', border: 'none', borderRadius: '8px' }}
                    itemStyle={{ color: '#84dde4', fontWeight: 'bold' }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="oneRM" 
                    stroke="#84dde4" 
                    strokeWidth={4} 
                    dot={{ fill: '#84dde4', strokeWidth: 2 }} 
                    activeDot={{ r: 8 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="space-y-4">
              <h4 className="text-xs font-black uppercase tracking-widest text-on-surface-variant">Récords Personales (PRs)</h4>
              <div className="grid grid-cols-1 gap-3">
                {prs.map((pr, i) => (
                  <div key={i} className="bg-surface-container-low p-6 rounded-xl flex justify-between items-center border-l-4 border-[#84dde4]">
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">{pr.fecha}</span>
                      <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-black">{pr.peso}</span>
                        <span className="text-sm font-bold text-on-surface-variant">KG</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-xl font-black text-[#84dde4]">{pr.reps} REPS</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

const HistorialScreen = ({ user }: { user: User }) => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [historial, setHistorial] = useState<HistorialSerie[]>([]);
  const [ejercicios, setEjercicios] = useState<Ejercicio[]>([]);
  const [allHistory, setAllHistory] = useState<HistorialSerie[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      const [ejs, fullHist] = await Promise.all([
        workoutService.getEjercicios(),
        workoutService.getHistorialCompleto(user.uid)
      ]);
      setEjercicios(ejs);
      setAllHistory(fullHist);
      setLoading(false);
    };
    loadData();
  }, [user.uid]);

  useEffect(() => {
    const fecha = format(selectedDate, 'yyyy-MM-dd');
    const dayHist = allHistory.filter(h => h.fecha === fecha);
    setHistorial(dayHist);
  }, [selectedDate, allHistory]);

  const historyDates = useMemo(() => {
    return new Set(allHistory.map(h => h.fecha));
  }, [allHistory]);

  const tileClassName = ({ date, view }: { date: Date, view: string }) => {
    if (view === 'month') {
      const d = format(date, 'yyyy-MM-dd');
      if (historyDates.has(d)) {
        return 'has-history';
      }
    }
    return null;
  };

  const groupedByExercise = historial.reduce((acc, s) => {
    if (!acc[s.ejercicioId]) acc[s.ejercicioId] = [];
    acc[s.ejercicioId].push(s);
    return acc;
  }, {} as Record<string, HistorialSerie[]>);

  return (
    <div className="space-y-8 pb-20">
      <section>
        <p className="text-[#84dde4] font-bold uppercase tracking-[0.2em] text-xs mb-2">Historial</p>
        <h2 className="text-5xl font-black tracking-tighter uppercase leading-none italic">Calendario</h2>
      </section>

      <div className="bg-[#1A1A1A] p-4 rounded-2xl border border-white/5 shadow-2xl calendar-container">
        <Calendar 
          onChange={(val) => setSelectedDate(val as Date)} 
          value={selectedDate}
          tileClassName={tileClassName}
          className="w-full bg-transparent border-none text-white font-bold"
          locale="es-ES"
        />
      </div>

      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h3 className="text-2xl font-black uppercase tracking-tighter italic">
            {format(selectedDate, "d 'de' MMMM", { locale: es })}
          </h3>
          <span className="text-[10px] font-black uppercase tracking-widest text-[#84dde4]">
            {Object.keys(groupedByExercise).length} Ejercicios
          </span>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Timer className="text-[#84dde4] animate-spin" size={32} />
          </div>
        ) : historial.length === 0 ? (
          <div className="bg-[#1A1A1A] p-12 rounded-2xl text-center border border-dashed border-white/10">
            <p className="text-on-surface-variant font-bold uppercase tracking-widest text-xs">No hay registros para este día</p>
          </div>
        ) : (
          <div className="space-y-4">
            {Object.entries(groupedByExercise).map(([ejId, series]: [string, HistorialSerie[]]) => {
              const ej = ejercicios.find(e => e.id === ejId);
              return (
                <div key={ejId} className="bg-[#1A1A1A] p-6 rounded-2xl border border-white/5">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-[#84dde4]">{ej?.musculo}</span>
                      <h4 className="text-xl font-black uppercase tracking-tight">{ej?.nombre}</h4>
                    </div>
                    <span className="bg-[#84dde4]/10 text-[#84dde4] text-[10px] font-black px-2 py-1 rounded uppercase">
                      {series.length} Sets
                    </span>
                  </div>
                  <div className="space-y-2">
                    {series.sort((a, b) => a.serieIndex - b.serieIndex).map((s, idx) => (
                      <div key={s.id} className="flex justify-between items-center text-sm font-bold bg-white/5 p-3 rounded-lg">
                        <span className="text-on-surface-variant">SET {idx + 1}</span>
                        <div className="flex gap-3">
                          <span>{s.peso} KG</span>
                          <span className="text-on-surface-variant">x</span>
                          <span>{s.reps} REPS</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <style>{`
        .calendar-container .react-calendar {
          background: transparent;
          color: white;
          border: none;
          font-family: inherit;
        }
        .calendar-container .react-calendar__navigation button {
          color: white;
          font-weight: 900;
          text-transform: uppercase;
        }
        .calendar-container .react-calendar__navigation button:enabled:hover,
        .calendar-container .react-calendar__navigation button:enabled:focus {
          background-color: rgba(255,255,255,0.05);
        }
        .calendar-container .react-calendar__month-view__weekdays {
          text-transform: uppercase;
          font-size: 0.7rem;
          font-weight: 900;
          color: #84dde4;
        }
        .calendar-container .react-calendar__tile {
          padding: 1em 0.5em;
          font-weight: 700;
          color: rgba(255,255,255,0.8);
        }
        .calendar-container .react-calendar__tile:enabled:hover,
        .calendar-container .react-calendar__tile:enabled:focus {
          background-color: rgba(132, 221, 228, 0.1);
          color: #84dde4;
        }
        .calendar-container .react-calendar__tile--now {
          background: rgba(255,255,255,0.05);
          color: white;
        }
        .calendar-container .react-calendar__tile--active {
          background: #84dde4 !important;
          color: black !important;
          border-radius: 12px;
        }
        .calendar-container .has-history {
          position: relative;
        }
        .calendar-container .has-history::after {
          content: '';
          position: absolute;
          bottom: 4px;
          left: 50%;
          transform: translateX(-50%);
          width: 4px;
          height: 4px;
          background: #8eff71;
          border-radius: 50%;
        }
      `}</style>
    </div>
  );
};

const PerfilScreen = ({ user, onCreateExercise, onClearHistory, onManageExercises }: { user: User, onCreateExercise: () => void, onClearHistory: () => void, onManageExercises: () => void }) => {
  const [showConfirm, setShowConfirm] = useState(false);

  const handleClear = async () => {
    await workoutService.clearHistorial(user.uid);
    setShowConfirm(false);
    onClearHistory();
  };

  return (
    <div className="space-y-8">
      <section>
        <p className="text-on-surface-variant font-bold uppercase tracking-[0.2em] text-xs mb-2">Atleta</p>
        <h2 className="text-5xl font-black tracking-tighter uppercase leading-none italic">Mi Perfil</h2>
      </section>

      <div className="bg-[#1A1A1A] p-8 rounded-2xl flex flex-col items-center text-center space-y-4">
        <div className="w-24 h-24 rounded-full bg-surface-container-low flex items-center justify-center border-4 border-[#8eff71]">
          {user.photoURL ? (
            <img src={user.photoURL} alt="Profile" className="w-full h-full rounded-full" referrerPolicy="no-referrer" />
          ) : (
            <UserIcon size={48} className="text-on-surface-variant" />
          )}
        </div>
        <div>
          <h3 className="text-2xl font-black uppercase tracking-tight">{user.displayName || 'Atleta Kinetic'}</h3>
          <p className="text-on-surface-variant font-bold">{user.email}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        <button 
          onClick={onCreateExercise}
          className="bg-surface-container-low p-6 rounded-xl flex items-center justify-between group"
        >
          <div className="flex items-center gap-4">
            <Plus className="text-[#8eff71]" />
            <span className="font-black uppercase tracking-tight">Crear Nuevo Ejercicio</span>
          </div>
          <ChevronRight className="text-on-surface-variant group-hover:translate-x-1 transition-transform" />
        </button>
        <button 
          onClick={onManageExercises}
          className="bg-surface-container-low p-6 rounded-xl flex items-center justify-between group"
        >
          <div className="flex items-center gap-4">
            <Dumbbell className="text-[#8eff71]" />
            <span className="font-black uppercase tracking-tight">Gestionar Mis Ejercicios</span>
          </div>
          <ChevronRight className="text-on-surface-variant group-hover:translate-x-1 transition-transform" />
        </button>
        <button 
          onClick={() => setShowConfirm(true)}
          className="bg-surface-container-low p-6 rounded-xl flex items-center justify-between group text-error/80"
        >
          <div className="flex items-center gap-4">
            <Trash2 size={20} />
            <span className="font-black uppercase tracking-tight">Limpiar Historial</span>
          </div>
          <ChevronRight className="text-on-surface-variant group-hover:translate-x-1 transition-transform" />
        </button>
        <button className="bg-surface-container-low p-6 rounded-xl flex items-center justify-between group">
          <div className="flex items-center gap-4">
            <Award className="text-[#8eff71]" />
            <span className="font-black uppercase tracking-tight">Logros</span>
          </div>
          <ChevronRight className="text-on-surface-variant group-hover:translate-x-1 transition-transform" />
        </button>
        <button 
          onClick={() => signOut(auth)}
          className="bg-error/10 p-6 rounded-xl flex items-center justify-between group text-error"
        >
          <div className="flex items-center gap-4">
            <LogOut />
            <span className="font-black uppercase tracking-tight">Cerrar Sesión</span>
          </div>
        </button>
      </div>

      <AnimatePresence>
        {showConfirm && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[120] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-[#1A1A1A] w-full max-w-md rounded-2xl p-8 space-y-6 border border-white/5"
            >
              <h3 className="text-3xl font-black uppercase tracking-tighter italic text-error">¿Estás seguro?</h3>
              <p className="text-on-surface-variant font-medium">Esta acción eliminará permanentemente todo tu historial de entrenamiento. No se puede deshacer.</p>
              <div className="flex gap-4">
                <button onClick={() => setShowConfirm(false)} className="flex-1 bg-surface-container-low font-black py-4 rounded-xl uppercase tracking-tighter">Cancelar</button>
                <button onClick={handleClear} className="flex-1 bg-error text-white font-black py-4 rounded-xl uppercase tracking-tighter">Eliminar Todo</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const ManageExercisesScreen = ({ onBack, onEditExercise }: { onBack: () => void, onEditExercise: (e: Ejercicio) => void }) => {
  const [ejercicios, setEjercicios] = useState<Ejercicio[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const loadData = async () => {
      const ejs = await workoutService.getEjercicios();
      setEjercicios(ejs);
    };
    loadData();
  }, []);

  const filtered = ejercicios.filter(e => 
    e.nombre.toLowerCase().includes(search.toLowerCase()) || 
    e.musculo.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <button onClick={onBack} className="flex items-center gap-2 text-on-surface-variant">
        <ArrowLeft size={20} />
        <span className="font-bold uppercase text-xs tracking-widest">Volver al Perfil</span>
      </button>
      <h2 className="text-4xl font-black uppercase tracking-tighter italic">Gestionar Ejercicios</h2>
      
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant" size={20} />
        <input 
          type="text" 
          placeholder="Buscar ejercicios..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-[#1A1A1A] border-none rounded-xl py-4 pl-12 pr-4 font-bold focus:ring-2 focus:ring-[#8eff71]"
        />
      </div>

      <div className="grid grid-cols-1 gap-3">
        {filtered.map(ej => (
          <button 
            key={ej.id}
            onClick={() => onEditExercise(ej)}
            className="bg-[#1A1A1A] p-4 rounded-xl flex justify-between items-center group"
          >
            <div className="text-left">
              <span className="text-[10px] font-black uppercase tracking-widest text-[#8eff71]">{ej.musculo}</span>
              <h3 className="font-bold uppercase">{ej.nombre}</h3>
            </div>
            <ChevronRight className="text-on-surface-variant group-hover:translate-x-1 transition-transform" />
          </button>
        ))}
      </div>
    </div>
  );
};

// --- Main App ---

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('hoy');
  const [activeRoutine, setActiveRoutine] = useState<Rutina | null>(null);
  console.log("App: Current activeRoutine:", activeRoutine?.nombre);
  const [isCreatingRoutine, setIsCreatingRoutine] = useState(false);
  const [editingRoutine, setEditingRoutine] = useState<Rutina | null>(null);
  const [isCreatingExercise, setIsCreatingExercise] = useState(false);
  const [editingExercise, setEditingExercise] = useState<Ejercicio | null>(null);
  const [isManagingExercises, setIsManagingExercises] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
      if (u) {
        workoutService.initializeDefaultData();
      }
    });
    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <Timer className="text-[#8eff71] animate-spin" size={48} />
      </div>
    );
  }

  if (!user) {
    return <LoginScreen onLogin={() => {}} />;
  }

  return (
    <div className="min-h-screen bg-surface text-on-surface pb-32">
      <header className="bg-[#131313] sticky top-0 z-50 flex justify-between items-center h-16 px-6 w-full border-b border-white/5">
        <div className="flex items-center gap-3">
          <Timer className="text-[#8eff71]" size={24} />
          <h1 className="font-black tracking-tighter uppercase text-2xl italic text-[#8eff71]">KINETIC</h1>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={() => setIsCreatingExercise(true)}
            className="text-[#adaaaa] hover:text-[#8eff71] transition-colors"
            title="Nuevo Ejercicio"
          >
            <Dumbbell size={24} />
          </button>
          <button 
            onClick={() => setIsCreatingRoutine(true)}
            className="text-[#adaaaa] hover:text-[#8eff71] transition-colors"
            title="Nueva Rutina"
          >
            <Plus size={24} />
          </button>
        </div>
      </header>

      <main className="px-6 py-8 max-w-lg mx-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={`${activeTab}-${refreshKey}-${isManagingExercises}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === 'hoy' && (
              <HoyScreen 
                user={user} 
                activeRoutine={activeRoutine} 
                onFinishRoutine={() => {
                  console.log("App: Finishing routine", activeRoutine?.nombre);
                  setActiveRoutine(null);
                }} 
              />
            )}
            {activeTab === 'rutinas' && (
              <RutinasScreen 
                onSelectRoutine={(r) => {
                  setActiveRoutine(r);
                  setActiveTab('hoy');
                }} 
                onCreateRoutine={() => setIsCreatingRoutine(true)}
                onEditRoutine={(r) => setEditingRoutine(r)}
              />
            )}
            {activeTab === 'historial' && <HistorialScreen user={user} />}
            {activeTab === 'progreso' && <ProgresoScreen user={user} />}
            {activeTab === 'perfil' && (
              !isManagingExercises ? (
                <PerfilScreen 
                  user={user} 
                  onCreateExercise={() => setIsCreatingExercise(true)} 
                  onClearHistory={() => setActiveTab('hoy')}
                  onManageExercises={() => setIsManagingExercises(true)}
                />
              ) : (
                <ManageExercisesScreen 
                  onBack={() => setIsManagingExercises(false)}
                  onEditExercise={(e) => setEditingExercise(e)}
                />
              )
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {isCreatingRoutine && (
        <CreateRoutineModal 
          onClose={() => setIsCreatingRoutine(false)} 
          onCreated={() => setRefreshKey(prev => prev + 1)} 
        />
      )}

      {editingRoutine && (
        <EditRoutineModal 
          routine={editingRoutine}
          onClose={() => setEditingRoutine(null)} 
          onUpdated={() => setRefreshKey(prev => prev + 1)} 
        />
      )}

      {isCreatingExercise && (
        <CreateExerciseModal 
          onClose={() => setIsCreatingExercise(false)} 
          onCreated={() => setRefreshKey(prev => prev + 1)} 
        />
      )}

      {editingExercise && (
        <EditExerciseModal 
          ejercicio={editingExercise}
          onClose={() => setEditingExercise(null)}
          onUpdated={() => setRefreshKey(prev => prev + 1)}
        />
      )}

      <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  );
}

