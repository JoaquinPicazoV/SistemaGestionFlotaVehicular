import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // Importamos useNavigate
import axios from 'axios';
import {
    Bus,
    Map,
    CalendarDays,
    ChevronRight,
    Lock,
    ClipboardList
} from 'lucide-react';

function Landing() {
    const navigate = useNavigate(); // Hook para navegación
    const [systemStatus, setSystemStatus] = useState("Verificando...");
    const [isOnline, setIsOnline] = useState(false);

    // URL del Backend segura desde variables de entorno
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

    useEffect(() => {
        // Usamos la variable de entorno para la petición
        axios.get(`${API_URL}/comunas`)
            .then(() => {
                setSystemStatus("Sistema en línea");
                setIsOnline(true);
            })
            .catch(() => {
                setSystemStatus("Sin conexión");
                setIsOnline(false);
            });
    }, []);

    return (
        <div className="min-h-screen bg-slate-900 font-sans text-slate-100 selection:bg-blue-500 selection:text-white overflow-hidden relative">

            {/* --- FONDO ANIMADO --- */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/20 rounded-full blur-[120px] animate-pulse"></div>
                <div className="absolute bottom-[10%] right-[-5%] w-[30%] h-[30%] bg-indigo-600/20 rounded-full blur-[100px]"></div>
            </div>

            {/* --- NAVBAR --- */}
            <nav className="fixed w-full z-50 border-b border-white/10 bg-slate-900/60 backdrop-blur-xl">
                <div className="max-w-7xl mx-auto px-6 h-20 flex justify-between items-center">

                    {/* Logo Simple y Claro */}
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg">
                            <Bus size={20} className="text-white" />
                        </div>
                        <div className="flex flex-col">
                            <span className="font-bold text-lg tracking-wide text-white leading-tight">
                                Transporte<span className="text-blue-400">SLEP</span>
                            </span>
                            <span className="text-xs text-slate-400 uppercase">Administración</span>
                        </div>
                    </div>

                    {/* Botón de Acceso Protegido */}
                    <button
                        onClick={() => navigate('/login')}
                        className="group flex items-center gap-2 px-5 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full transition-all hover:bg-blue-600 hover:border-blue-500 cursor-pointer"
                    >
                        <Lock size={16} className="text-blue-400 group-hover:text-white" />
                        <span className="text-sm font-medium">Ingreso Funcionarios</span>
                        <ChevronRight size={16} className="text-slate-500 group-hover:text-white" />
                    </button>
                </div>
            </nav>

            {/* --- CONTENIDO PRINCIPAL --- */}
            <main className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 text-center">

                {/* Estado del servicio (Discreto) */}
                <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border mb-8 backdrop-blur-md ${isOnline
                        ? "bg-green-900/30 border-green-800 text-green-400"
                        : "bg-red-900/30 border-red-800 text-red-400"
                    }`}>
                    <div className={`w-2 h-2 rounded-full ${isOnline ? "bg-green-500" : "bg-red-500"}`}></div>
                    <span className="text-xs font-medium">{systemStatus}</span>
                </div>

                {/* Título Funcional */}
                <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6 max-w-4xl text-white">
                    Sistema de Solicitud <br />
                    <span className="text-blue-400">de Vehículos</span>
                </h1>

                <p className="text-lg text-slate-400 max-w-2xl mb-10 leading-relaxed">
                    Plataforma interna del SLEP Llanquihue para reservar móviles institucionales.
                    Úsala para coordinar cometidos funcionarios, salidas pedagógicas y traslados administrativos.
                </p>

                {/* Grid de Información Útil */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl w-full mt-8">

                    {/* Tarjeta 1 */}
                    <div className="p-6 rounded-2xl bg-slate-800/50 border border-white/10 backdrop-blur-sm text-left">
                        <Map className="text-blue-400 mb-4" size={28} />
                        <h3 className="text-lg font-semibold text-white mb-2">Cobertura</h3>
                        <p className="text-slate-400 text-sm">
                            Solicitudes disponibles para las 5 comunas del territorio: Puerto Varas, Llanquihue, Frutillar, Fresia y Los Muermos.
                        </p>
                    </div>

                    {/* Tarjeta 2 */}
                    <div className="p-6 rounded-2xl bg-slate-800/50 border border-white/10 backdrop-blur-sm text-left">
                        <CalendarDays className="text-indigo-400 mb-4" size={28} />
                        <h3 className="text-lg font-semibold text-white mb-2">Disponibilidad</h3>
                        <p className="text-slate-400 text-sm">
                            Revisa el calendario de la flota antes de crear tu solicitud para asegurar que existan choferes y vehículos libres.
                        </p>
                    </div>

                    {/* Tarjeta 3 */}
                    <div className="p-6 rounded-2xl bg-slate-800/50 border border-white/10 backdrop-blur-sm text-left">
                        <ClipboardList className="text-purple-400 mb-4" size={28} />
                        <h3 className="text-lg font-semibold text-white mb-2">Mis Solicitudes</h3>
                        <p className="text-slate-400 text-sm">
                            Podrás ver el estado de tus peticiones (Pendiente, Aprobada o Rechazada) ingresando con tu cuenta institucional.
                        </p>
                    </div>

                </div>

                <footer className="absolute bottom-6 text-slate-600 text-xs">
                    Uso exclusivo interno - SLEP Llanquihue 2026
                </footer>

            </main>
        </div>
    );
}

export default Landing;