import React from 'react';
import { Bus, LogOut } from 'lucide-react';

const UserNavBar = ({ usuario, cerrarSesion, pestanaActiva, setPestanaActiva }) => {
    return (
        <nav className="bg-slate-900 border-b border-slate-800 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-18 py-3">
                    {/* Marca / Logo */}
                    <div className="flex items-center gap-3 group cursor-default">
                        <div className="relative">
                            <div className="absolute inset-0 bg-blue-500 rounded-xl blur opacity-20 group-hover:opacity-40 transition-opacity"></div>
                            <div className="relative bg-gradient-to-br from-blue-600 to-indigo-600 text-white p-2.5 rounded-xl border border-white/10 shadow-lg">
                                <Bus size={24} />
                            </div>
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-white tracking-tight leading-none">Portal<span className="text-blue-400">SLEP</span></h1>
                            <p className="text-xs font-medium text-slate-400 mt-1 flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse box-content border border-slate-900"></span>
                                {usuario.name}
                            </p>
                        </div>
                    </div>

                    {/* Acciones de Navegación */}
                    <div className="flex items-center gap-4">
                        <div className="flex md:flex bg-slate-800/50 p-1 rounded-xl border border-slate-700/50">
                            <button
                                onClick={() => setPestanaActiva('lista')}
                                className={`px-3 sm:px-5 py-2 text-xs sm:text-sm font-bold rounded-lg transition-all duration-300 ${pestanaActiva === 'lista'
                                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50'
                                    : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
                            >
                                <span className="hidden sm:inline">Mis</span> Solicitudes
                            </button>
                            <button
                                onClick={() => setPestanaActiva('crear')}
                                className={`px-3 sm:px-5 py-2 text-xs sm:text-sm font-bold rounded-lg transition-all duration-300 ${pestanaActiva === 'crear'
                                    ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/50'
                                    : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
                            >
                                Nueva <span className="hidden sm:inline">Solicitud</span>
                            </button>
                        </div>

                        <div className="h-8 w-px bg-slate-700 hidden md:block" />

                        <button
                            onClick={cerrarSesion}
                            className="group flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-slate-400 hover:text-red-400 hover:bg-red-950/30 rounded-xl transition-all border border-transparent hover:border-red-900/30"
                        >
                            <LogOut size={18} className="group-hover:-translate-x-0.5 transition-transform" />
                            <span className="hidden sm:inline">Cerrar Sesión</span>
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default UserNavBar;
