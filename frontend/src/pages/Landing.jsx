import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
    Bus,
    Map,
    Zap,
    ChevronRight,
    Lock,
    ClipboardList
} from 'lucide-react';

import API_URL from '../config/api';

import LogoSlep from '../assets/LogoSLEP.png';

function Landing() {
    const navigate = useNavigate();
    const [estadoSistema, setEstadoSistema] = useState("Verificando...");
    const [enLinea, setEnLinea] = useState(false);

    useEffect(() => {
        axios.get(`${API_URL}/comunas`)
            .then(() => {
                setEstadoSistema("Sistema en línea");
                setEnLinea(true);
            })
            .catch(() => {
                setEstadoSistema("Sin conexión");
                setEnLinea(false);
            });
    }, []);

    return (
        <div className="min-h-screen bg-slate-900 font-sans text-slate-100 selection:bg-blue-500 selection:text-white overflow-hidden relative">

            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/20 rounded-full blur-[120px] animate-pulse"></div>
                <div className="absolute bottom-[10%] right-[-5%] w-[30%] h-[30%] bg-indigo-600/20 rounded-full blur-[100px]"></div>
            </div>


            <nav className="fixed w-full z-50 border-b border-white/10 bg-slate-900/60 backdrop-blur-xl transition-all duration-300">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 md:h-20 flex justify-between items-center">
                    <div className="flex items-center gap-2 sm:gap-3">
                        <img src={LogoSlep} alt="Logo SLEP" className="h-12 md:h-16 w-auto object-contain" />
                    </div>

                    <button
                        onClick={() => navigate('/login')}
                        className="group flex items-center gap-2 px-3 py-2 md:px-5 md:py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full transition-all hover:bg-blue-600 hover:border-blue-500 cursor-pointer"
                    >
                        <Lock className="text-blue-400 group-hover:text-white w-3 h-3 md:w-4 md:h-4" />
                        <span className="text-xs md:text-sm font-medium">Ingreso <span className="hidden sm:inline">Funcionarios</span></span>
                        <ChevronRight className="text-slate-500 group-hover:text-white w-3 h-3 md:w-4 md:h-4" />
                    </button>
                </div>
            </nav>


            <main className="relative z-10 flex flex-col items-center justify-start md:justify-center min-h-screen px-4 text-center pt-32 pb-12 md:pt-40 md:pb-20">

                <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border mb-6 md:mb-8 backdrop-blur-md transition-all ${enLinea
                    ? "bg-green-900/30 border-green-800 text-green-400"
                    : "bg-red-900/30 border-red-800 text-red-400"
                    }`}>
                    <div className={`w-2 h-2 rounded-full ${enLinea ? "bg-green-500" : "bg-red-500"}`}></div>
                    <span className="text-xs font-medium">{estadoSistema}</span>
                </div>

                <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold tracking-tight mb-4 md:mb-6 max-w-4xl text-white">
                    Sistema de Solicitud <br className="hidden sm:block" />
                    <span className="text-blue-400">de Vehículos</span>
                </h1>

                <p className="text-base md:text-lg text-slate-400 max-w-2xl mb-8 md:mb-10 leading-relaxed px-2">
                    Plataforma del SLEP Llanquihue para reservar vehículos institucionales.
                    Úsala para coordinar salidas de funcionarios, salidas pedagógicas y traslados administrativos.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 max-w-5xl w-full mt-4 md:mt-8 px-2 md:px-0">
                    <div className="p-5 md:p-6 rounded-2xl bg-slate-800/50 border border-white/10 backdrop-blur-sm text-left hover:bg-slate-800/70 transition-colors">
                        <Map className="text-blue-400 mb-3 md:mb-4 w-6 h-6 md:w-7 md:h-7" />
                        <h3 className="text-base md:text-lg font-semibold text-white mb-2">Cobertura</h3>
                        <p className="text-slate-400 text-sm">
                            Solicitudes disponibles para las 5 comunas del territorio SLEP Llanquihue.
                        </p>
                    </div>

                    <div className="p-5 md:p-6 rounded-2xl bg-slate-800/50 border border-white/10 backdrop-blur-sm text-left hover:bg-slate-800/70 transition-colors">
                        <Zap className="text-indigo-400 mb-3 md:mb-4 w-6 h-6 md:w-7 md:h-7" />
                        <h3 className="text-base md:text-lg font-semibold text-white mb-2">Gestión Ágil</h3>
                        <p className="text-slate-400 text-sm">
                            Simplificamos el proceso de solicitud de vehículos, eliminando trámites innecesarios y agilizando los tiempos de respuesta.
                        </p>
                    </div>

                    <div className="p-5 md:p-6 rounded-2xl bg-slate-800/50 border border-white/10 backdrop-blur-sm text-left hover:bg-slate-800/70 transition-colors md:col-span-2 lg:col-span-1">
                        <ClipboardList className="text-purple-400 mb-3 md:mb-4 w-6 h-6 md:w-7 md:h-7" />
                        <h3 className="text-base md:text-lg font-semibold text-white mb-2">Control de Flota</h3>
                        <p className="text-slate-400 text-sm">
                            Los administradores supervisan el uso de los vehículos y gestiona las solicitudes para garantizar un servicio eficiente y ordenado.
                        </p>
                    </div>
                </div>

                <footer className="mt-12 md:absolute md:bottom-6 text-slate-600 text-xs text-center w-full">
                    SLEP Llanquihue 2026
                </footer>

            </main>
        </div>
    );
}

export default Landing;