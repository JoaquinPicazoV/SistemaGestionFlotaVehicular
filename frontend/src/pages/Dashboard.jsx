import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import API_URL from '../config/api';
import { useAuth } from '../context/AuthContext';
import { ResponsiveContainer, PieChart as RechartsPie, Pie, Cell, Tooltip, Legend } from 'recharts';
import { AlertCircle, TrendingUp, Menu, Users } from 'lucide-react';

import StatisticsBI from '../components/admin/StatisticsBI';
import VehicleList from '../components/admin/VehicleList';
import DriverList from '../components/admin/DriverList';
import PendingRequests from '../components/admin/PendingRequests';
import ProcessedRequests from '../components/admin/ProcessedRequests';
import AdminCalendar from '../components/admin/AdminCalendar';
import AdminSidebar from '../components/admin/AdminSidebar';
import LoadingScreen from '../components/common/LoadingScreen';
import UserDashboard from './UserDashboard';

const Dashboard = () => {
    const { usuario, cerrarSesion } = useAuth();
    const navigate = useNavigate();
    const [cargando, setCargando] = useState(true);
    const [pestanaActiva, setPestanaActiva] = useState('resumen');
    const [menuLateralAbierto, setMenuLateralAbierto] = useState(false);
    const [estadisticas, setEstadisticas] = useState({
        solicitudesPendientes: 0,
        vehiculosEnRuta: 0,
        choferesActivos: 0,
        kmMesActual: 0,
        proximosViajes: [],
        estadoFlota: []
    });

    const obtenerEstadisticas = useCallback(async () => {
        try {
            const res = await axios.get(`${API_URL}/stats/summary`, { withCredentials: true });
            setEstadisticas(res.data);
        } catch (error) {
            console.error("Error cargando estadísticas del panel:", error);
        } finally {
            setCargando(false);
        }
    }, [API_URL]);

    useEffect(() => {
        if (usuario) {
            if (usuario.rol === 'admin') {
                obtenerEstadisticas();
            } else {
                setCargando(false);
            }
        }
    }, [usuario, obtenerEstadisticas]);

    useEffect(() => {
        let intervalo;
        if (usuario?.rol === 'admin') {
            intervalo = setInterval(obtenerEstadisticas, 3600000);
        }
        return () => clearInterval(intervalo);
    }, [usuario, obtenerEstadisticas]);



    if (cargando) return <LoadingScreen mensaje="Cargando Panel..." />;

    if (usuario && usuario.rol === 'funcionario') {
        return <UserDashboard usuario={usuario} cerrarSesion={cerrarSesion} />;
    }

    return (
        <div className="min-h-screen bg-[#F8FAFC] flex font-sans">
            <AdminSidebar
                pestanaActiva={pestanaActiva}
                setPestanaActiva={setPestanaActiva}
                usuario={usuario}
                cerrarSesion={cerrarSesion}
                isOpen={menuLateralAbierto}
                onClose={() => setMenuLateralAbierto(false)}
            />

            <main className="flex-1 overflow-y-auto h-screen relative">
                <header className="bg-white/80 backdrop-blur-md sticky top-0 z-30 px-4 md:px-8 py-4 flex items-center justify-between border-b border-slate-200/60">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setMenuLateralAbierto(true)}
                            className="p-2 -ml-2 text-slate-500 hover:bg-slate-100 rounded-xl md:hidden transition-colors"
                        >
                            <Menu size={24} />
                        </button>
                        <div>
                            <h2 className="text-lg md:text-xl font-bold text-slate-800 tracking-tight line-clamp-1">
                                {pestanaActiva === 'resumen' && `Hola, ${usuario?.nombre?.split(' ')[0] || 'Admin'}`}
                                {pestanaActiva === 'estadisticas' && 'Inteligencia de Negocios'}
                                {pestanaActiva === 'calendario' && 'Calendario de Reservas'}
                                {pestanaActiva === 'vehiculos' && 'Gestión de Flota'}
                                {pestanaActiva === 'choferes' && 'Gestión de Choferes'}
                                {pestanaActiva === 'solicitudes' && 'Solicitudes Pendientes'}
                                {pestanaActiva === 'procesadas' && 'Historial de Solicitudes'}
                            </h2>
                            <p className="text-xs text-slate-500 font-medium mt-0.5 hidden sm:block">
                                {pestanaActiva === 'resumen' ? 'Aquí tienes el resumen de hoy.' : 'Administración del sistema de transporte.'}
                            </p>
                        </div>
                    </div>
                </header>

                <div className="p-4 md:p-8">
                    {pestanaActiva === 'resumen' && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

                                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xl shadow-slate-200/50 hover:shadow-2xl hover:shadow-slate-200/60 transition-all group relative overflow-hidden">
                                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform"><AlertCircle size={80} /></div>
                                    <div className="flex flex-col relative z-10">
                                        <span className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Pendientes</span>
                                        <span className="text-4xl font-extrabold text-amber-500 mb-2">{estadisticas.solicitudesPendientes}</span>
                                        <span className="text-xs text-slate-400 font-medium">Solicitudes por revisar</span>
                                    </div>
                                    <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-amber-400 to-amber-600"></div>
                                </div>

                                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xl shadow-slate-200/50 hover:shadow-2xl hover:shadow-slate-200/60 transition-all group relative overflow-hidden">
                                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform"><TrendingUp size={80} /></div>
                                    <div className="flex flex-col relative z-10">
                                        <span className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">En Ruta</span>
                                        <span className="text-4xl font-extrabold text-blue-600 mb-2">{estadisticas.vehiculosEnRuta}</span>
                                        <span className="text-xs text-slate-400 font-medium">Vehículos activos ahora</span>
                                    </div>
                                    <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 to-blue-600"></div>
                                </div>

                                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xl shadow-slate-200/50 hover:shadow-2xl hover:shadow-slate-200/60 transition-all group relative overflow-hidden">
                                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform"><Users size={80} /></div>
                                    <div className="flex flex-col relative z-10">
                                        <span className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Viajeros Mensuales</span>
                                        <span className="text-4xl font-extrabold text-emerald-600 mb-2">{estadisticas.pasajerosMes || 0}</span>
                                        <span className="text-xs text-slate-400 font-medium">Pasajeros transportados</span>
                                    </div>
                                    <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-400 to-emerald-600"></div>
                                </div>

                                <div className="bg-gradient-to-br from-indigo-600 to-purple-700 p-6 rounded-2xl shadow-xl shadow-indigo-500/20 text-white relative overflow-hidden group">
                                    <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-2xl group-hover:bg-white/20 transition-all"></div>
                                    <div className="flex flex-col relative z-10">
                                        <span className="text-indigo-200 text-xs font-bold uppercase tracking-wider mb-1">Km Mes Actual</span>
                                        <span className="text-4xl font-extrabold mb-2">{estadisticas.kmMesActual}</span>
                                        <span className="text-xs text-indigo-200 font-medium">Kilómetros recorridos</span>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                                <div className="lg:col-span-2 bg-white p-8 rounded-3xl border border-slate-100 shadow-lg shadow-slate-200/40">
                                    <h3 className="font-bold text-slate-800 text-lg mb-6">Disponibilidad de Flota</h3>
                                    <div className="w-full h-64 md:h-80">
                                        {estadisticas.estadoFlota.length > 0 ? (
                                            <ResponsiveContainer width="100%" height="100%">
                                                <RechartsPie width="100%" height="100%">
                                                    <Pie
                                                        data={estadisticas.estadoFlota}
                                                        cx="50%"
                                                        cy="50%"
                                                        innerRadius={60}
                                                        outerRadius={80}
                                                        paddingAngle={5}
                                                        dataKey="valor"
                                                        nameKey="nombre"
                                                        stroke="none"
                                                    >
                                                        {estadisticas.estadoFlota.map((entry, index) => {
                                                            const colors = { 'DISPONIBLE': '#10b981', 'EN RUTA': '#3b82f6', 'MANTENCION': '#ef4444' };
                                                            return <Cell key={`cell-${index}`} fill={colors[entry.nombre] || '#94a3b8'} />;
                                                        })}
                                                    </Pie>
                                                    <Tooltip
                                                        contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                                                        itemStyle={{ color: '#1e293b', fontWeight: 'bold' }}
                                                    />
                                                    <Legend verticalAlign="bottom" height={36} iconType="circle" />
                                                </RechartsPie>
                                            </ResponsiveContainer>
                                        ) : (
                                            <div className="h-full flex items-center justify-center text-slate-400 border-2 border-dashed border-slate-100 rounded-2xl">
                                                <div className="text-center">
                                                    <p className="text-sm font-medium">Sin datos de flota</p>
                                                    <p className="text-xs mt-1 opacity-70">La información aparecerá aquí</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>


                                <div className="space-y-6">

                                    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-lg shadow-slate-200/40">
                                        <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wide mb-4 flex items-center gap-2">
                                            <TrendingUp size={16} className="text-blue-500" /> Top 3 Unidades (Mes)
                                        </h3>
                                        <div className="space-y-3">
                                            {estadisticas.unidadesTop && estadisticas.unidadesTop.length > 0 ? (
                                                estadisticas.unidadesTop.map((u, i) => (
                                                    <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                                                        <span className="text-sm font-bold text-slate-700 truncate max-w-[150px]" title={u.sol_unidad}>{u.sol_unidad}</span>
                                                        <span className="text-xs font-bold px-2 py-1 bg-blue-100 text-blue-700 rounded-lg">{u.viajes} viajes</span>
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="text-xs text-slate-400 italic text-center py-4">Sin datos registrados.</div>
                                            )}
                                        </div>
                                    </div>


                                    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-lg shadow-slate-200/40 flex flex-col">
                                        <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wide mb-4">Próximos Viajes (72h)</h3>
                                        <div className="space-y-2 flex-1 overflow-y-auto custom-scrollbar pr-2 max-h-60">
                                            {estadisticas.proximosViajes.length > 0 ? (
                                                estadisticas.proximosViajes.map((trip, i) => (
                                                    <div key={i} className="flex items-start gap-4 p-3 rounded-xl hover:bg-slate-50 transition-all border border-transparent hover:border-slate-100 group cursor-default">
                                                        <div className="flex-shrink-0 w-12 flex flex-col items-center justify-center bg-blue-50/50 rounded-xl p-1 border border-blue-100">
                                                            <div className="text-[10px] font-bold text-blue-600 uppercase tracking-wide">
                                                                {new Date(trip.sol_fechasalida).toLocaleString('es-CL', { weekday: 'short' }).replace('.', '')}
                                                            </div>
                                                            <div className="text-lg font-black text-slate-800 leading-none">
                                                                {new Date(trip.sol_fechasalida).getDate()}
                                                            </div>
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <h4 className="text-xs font-bold text-slate-800 truncate group-hover:text-blue-600 transition-colors">{trip.sol_unidad}</h4>
                                                            <p className="text-[10px] text-slate-500 truncate mt-0.5">{trip.sol_motivo}</p>
                                                            <div className="flex items-center gap-2 mt-1">
                                                                <span className="text-[10px] font-mono text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                                                                    {new Date(trip.sol_fechasalida).toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="h-20 flex flex-col items-center justify-center text-slate-400 text-xs">
                                                    <p>No hay viajes programados</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100">
                        {pestanaActiva === 'estadisticas' && <StatisticsBI />}
                        {pestanaActiva === 'calendario' && <AdminCalendar />}
                        {pestanaActiva === 'vehiculos' && <VehicleList />}
                        {pestanaActiva === 'choferes' && <DriverList />}
                        {pestanaActiva === 'solicitudes' && <PendingRequests />}
                        {pestanaActiva === 'procesadas' && <ProcessedRequests />}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Dashboard;
