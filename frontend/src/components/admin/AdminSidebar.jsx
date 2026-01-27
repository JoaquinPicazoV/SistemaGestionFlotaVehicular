import React from 'react';
import {
    LayoutDashboard,
    PieChart,
    FileText,
    CheckCircle,
    Car,
    Users,
    LogOut,
    Calendar
} from 'lucide-react';

import LogoSlep from '../../assets/LogoSLEP.png';

const UserSidebar = ({ pestanaActiva, setPestanaActiva, usuario, cerrarSesion, isOpen, onClose }) => {

    const itemsMenu = [
        { id: 'resumen', etiqueta: 'Resumen General', icono: LayoutDashboard },
        { id: 'estadisticas', etiqueta: 'Estadísticas BI', icono: PieChart },
        { id: 'calendario', etiqueta: 'Calendario', icono: Calendar },
        { id: 'solicitudes', etiqueta: 'Solicitudes Pendientes', icono: FileText },
        { id: 'procesadas', etiqueta: 'Historial Procesado', icono: CheckCircle },
        { id: 'vehiculos', etiqueta: 'Gestión Vehículos', icono: Car },
        { id: 'choferes', etiqueta: 'Gestión Choferes', icono: Users },
    ];

    return (
        <>

            {isOpen && (
                <div
                    className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 md:hidden animate-in fade-in"
                    onClick={onClose}
                />
            )}

            <aside className={`
                fixed inset-y-0 left-0 z-50 w-72 bg-[#0F172A] text-slate-300 h-screen flex flex-col border-r border-slate-800 shadow-2xl transition-transform duration-300 ease-in-out
                md:sticky md:translate-x-0 md:top-0
                ${isOpen ? 'translate-x-0' : '-translate-x-full'}
            `}>
                <div className="p-8 pb-6 flex justify-between items-center">
                    <div className="flex items-center justify-center w-full">
                        <img src={LogoSlep} alt="Logo" className="h-24 w-auto object-contain" />
                    </div>

                    <button onClick={onClose} className="md:hidden text-slate-400 hover:text-white">
                        <LogOut size={20} className="rotate-180" />
                    </button>
                </div>


                <nav className="flex-1 px-4 py-4 space-y-1.5 overflow-y-auto custom-scrollbar">
                    <p className="px-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Menu Principal</p>
                    {itemsMenu.map((item) => {
                        const esActivo = pestanaActiva === item.id;
                        return (
                            <button
                                key={item.id}
                                onClick={() => {
                                    setPestanaActiva(item.id);
                                    if (onClose) onClose();
                                }}
                                className={`group relative w-full flex items-center gap-3.5 px-4 py-3.5 rounded-xl font-medium transition-all duration-300 ${esActivo
                                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/40'
                                    : 'hover:bg-slate-800 hover:text-white text-slate-400'
                                    }`}
                            >
                                <item.icono size={20} className={`transition-transform duration-300 ${esActivo ? 'scale-110' : 'group-hover:scale-110'}`} />
                                <span className="relative z-10">{item.etiqueta}</span>


                                {!esActivo && (
                                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-0 bg-blue-400 opacity-0 group-hover:h-8 group-hover:opacity-100 transition-all duration-300 rounded-r-full" />
                                )}
                            </button>
                        );
                    })}
                </nav>


                <div className="px-6 py-4 hidden sm:block">
                    <div className="bg-slate-800/50 rounded-2xl p-4 border border-slate-700/50 relative overflow-hidden group">
                        <div className="absolute -right-4 -top-4 w-16 h-16 bg-blue-500/20 rounded-full blur-2xl group-hover:bg-blue-500/30 transition-all"></div>
                        <div className="relative z-10">
                            <h4 className="text-xs font-bold text-white mb-1">Estado del Sistema</h4>
                            <div className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                                <span className="text-xs text-slate-400">Operativo</span>
                            </div>
                        </div>
                    </div>
                </div>


                <div className="p-4 border-t border-slate-800 bg-slate-900/50">
                    <div className="flex items-center gap-3 mb-4 px-2">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center font-bold text-white shadow-lg ring-2 ring-slate-800">
                            {usuario?.nombre?.charAt(0) || 'U'}
                        </div>
                        <div className="flex flex-col min-w-0">
                            <span className="text-sm font-bold text-white truncate">{usuario?.nombre || 'Usuario'}</span>
                            <span className="text-xs text-slate-500 capitalize">{usuario?.rol || 'Admin'}</span>
                        </div>
                    </div>
                    <button
                        onClick={cerrarSesion}
                        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-slate-700 text-slate-400 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/50 transition-all text-xs font-bold uppercase tracking-wide group"
                    >
                        <LogOut size={16} className="group-hover:-translate-x-1 transition-transform" /> Cerrar Sesión
                    </button>
                </div>
            </aside>
        </>
    );
};

export default UserSidebar;
