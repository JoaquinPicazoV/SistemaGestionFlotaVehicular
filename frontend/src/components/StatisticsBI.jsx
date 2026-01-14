import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, LineChart, Line, Legend
} from 'recharts';
import {
    Truck, Users, Map, ClipboardList, Activity, AlertTriangle, CheckCircle2, TrendingUp
} from 'lucide-react';
import { motion } from 'framer-motion';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';
const COLORES = ['#0ea5e9', '#3b82f6', '#6366f1', '#8b5cf6', '#d946ef', '#f43f5e'];

const StatisticsBI = () => {
    const [pestanaActiva, setPestanaActiva] = useState('flota'); // flota | demanda | geo | ops
    const [datos, setDatos] = useState(null);
    const [cargando, setCargando] = useState(true);

    useEffect(() => {
        const cargarBI = async () => {
            try {
                const res = await axios.get(`${API_URL}/stats/bi`, { withCredentials: true });
                setDatos(res.data);
            } catch (err) {
                console.error(err);
            } finally {
                setCargando(false);
            }
        };
        cargarBI();
    }, []);

    if (cargando) return <div className="p-10 text-center text-slate-400">Cargando Tableros BI...</div>;
    if (!datos) return <div className="p-10 text-center text-red-400">Error cargando datos.</div>;

    // --- RENDERIZADORES DE TABLEROS ---

    // TABLERO 1: FLOTA
    const TableroFlota = () => (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-4">
            {/* KPI Desgaste */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <h3 className="text-lg font-bold text-slate-700 mb-1 flex items-center gap-2">
                    <Activity size={20} className="text-amber-500" /> Desgaste de Vehículos
                </h3>
                <p className="text-xs text-slate-400 mb-6">Kilometraje acumulado por unidad (Top 5)</p>
                <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart layout="vertical" data={datos.fleet.desgaste}>
                            <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                            <XAxis type="number" hide />
                            <YAxis dataKey="name" type="category" width={120} tick={{ fontSize: 10 }} />
                            <Tooltip cursor={{ fill: 'transparent' }} />
                            <Bar dataKey="value" fill="#f59e0b" radius={[0, 4, 4, 0]} barSize={20} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
                <div className="mt-4 p-3 bg-amber-50 rounded-lg text-xs text-amber-800 flex gap-2">
                    <AlertTriangle size={16} />
                    <span>
                        <strong>Insight:</strong> La unidad con más uso ({datos.fleet.desgaste[0]?.name}) requiere revisión prioritaria.
                    </span>
                </div>
            </div>

            {/* KPI Ociosidad */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <h3 className="text-lg font-bold text-slate-700 mb-1 flex items-center gap-2">
                    <Truck size={20} className="text-blue-500" /> Distribución de Uso
                </h3>
                <p className="text-xs text-slate-400 mb-6">Asignaciones totales por patente</p>
                <div className="h-64 flex justify-center">
                    <ResponsiveContainer width={300} height="100%">
                        <PieChart>
                            <Pie data={datos.fleet.uso} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                                {datos.fleet.uso.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORES[index % COLORES.length]} />
                                ))}
                            </Pie>
                            <Tooltip />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );

    // TABLERO 2: DEMANDA
    const TableroDemanda = () => {
        const total = datos.demand.kpi_rechazo.total || 1;
        const rechazadas = datos.demand.kpi_rechazo.rechazadas || 0;
        const tasa = Math.round((rechazadas / total) * 100);

        return (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-4">
                {/* Gauge Tasa Rechazo */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center justify-center text-center">
                    <h3 className="text-lg font-bold text-slate-700 mb-4">Tasa de Rechazo</h3>
                    <div className="relative w-40 h-40 flex items-center justify-center">
                        <div className={`w-full h-full rounded-full border-[12px] ${tasa > 15 ? 'border-red-500' : 'border-emerald-500'} opacity-20 absolute`}></div>
                        <div className="text-4xl font-black text-slate-800">{tasa}%</div>
                    </div>
                    <p className="text-xs text-slate-400 mt-2">KP Crítico: {tasa > 15 ? 'ALERTA (Falta Flota)' : 'Saludable'}</p>
                </div>

                {/* Pareto Unidades */}
                <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                    <h3 className="text-lg font-bold text-slate-700 mb-1">Solicitudes por Unidad</h3>
                    <p className="text-xs text-slate-400 mb-4">¿Quién usa más el servicio?</p>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={datos.demand.unidades}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="name" tick={{ fontSize: 10 }} interval={0} />
                                <YAxis />
                                <Tooltip />
                                <Bar dataKey="value" fill="#6366f1" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Motivos */}
                <div className="lg:col-span-3 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                    <h3 className="text-lg font-bold text-slate-700 mb-4">Motivos de Viaje</h3>
                    <div className="flex flex-wrap gap-2">
                        {datos.demand.motivos.map((m, idx) => (
                            <div key={idx} className="px-4 py-2 rounded-lg bg-slate-50 border border-slate-100 flex items-center gap-2">
                                <span className="text-sm font-medium text-slate-600">{m.name}</span>
                                <span className="text-xs font-bold bg-blue-100 text-blue-700 px-2 py-0.5 rounded">{m.value}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    };

    // TABLERO 3: GEO
    const TableroGeo = () => (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-4">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <h3 className="text-lg font-bold text-slate-700 mb-4 flex items-center gap-2">
                    <Map size={20} className="text-emerald-500" /> Mapa de Calor (Comunas)
                </h3>
                <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart layout="vertical" data={datos.geo.comunas}>
                            <XAxis type="number" hide />
                            <YAxis dataKey="name" type="category" width={100} />
                            <Tooltip />
                            <Bar dataKey="value" fill="#10b981" radius={[0, 4, 4, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <h3 className="text-lg font-bold text-slate-700 mb-4">Top 10 Lugares Visitados</h3>
                <div className="overflow-auto h-80">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-slate-400 uppercase bg-slate-50 sticky top-0">
                            <tr>
                                <th className="px-4 py-3">Lugar</th>
                                <th className="px-4 py-3">Comuna</th>
                                <th className="px-4 py-3 text-right">Visitas</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {datos.geo.lugares.map((l, idx) => (
                                <tr key={idx} className="hover:bg-slate-50">
                                    <td className="px-4 py-3 font-medium text-slate-700">{l.nombre}</td>
                                    <td className="px-4 py-3 text-slate-500">{l.comuna}</td>
                                    <td className="px-4 py-3 text-right font-bold text-blue-600">{l.visitas}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );

    // TABLERO 4: OPS
    const TableroOps = () => (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-4">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <h3 className="text-lg font-bold text-slate-700 mb-1 flex items-center gap-2">
                    <TrendingUp size={20} className="text-purple-500" /> Estacionalidad Mensual
                </h3>
                <p className="text-xs text-slate-400 mb-4">Tendencia anual de demanda</p>
                <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={datos.ops.tendencia}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="mes" tick={{ fontSize: 10 }} />
                            <YAxis />
                            <Tooltip />
                            <Line type="monotone" dataKey="cantidad" stroke="#8b5cf6" strokeWidth={3} dot={{ r: 4 }} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <h3 className="text-lg font-bold text-slate-700 mb-4 flex items-center gap-2">
                    <Users size={20} className="text-indigo-500" /> Carga Laboral Choferes
                </h3>
                <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={datos.ops.choferes}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="name" tick={{ fontSize: 10, angle: -10 }} interval={0} />
                            <YAxis />
                            <Tooltip />
                            <Bar dataKey="viajes" fill="#6366f1" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );

    const pestanas = [
        { id: 'flota', etiqueta: 'Gestión Flota', icono: Truck },
        { id: 'demanda', etiqueta: 'Demanda', icono: ClipboardList },
        { id: 'geo', etiqueta: 'Territorio', icono: Map },
        { id: 'ops', etiqueta: 'Operaciones', icono: CheckCircle2 },
    ];

    return (
        <div className="p-8 w-full max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-2 duration-500">
            {/* Header */}
            <div className="mb-8">
                <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight">Panel de Control BI</h2>
                <p className="text-slate-500 mt-1">Toma de decisiones basada en datos reales.</p>
            </div>

            {/* Navegación Pestanas */}
            <div className="flex gap-2 overflow-x-auto pb-2 border-b border-slate-200 mb-6">
                {pestanas.map((p) => (
                    <button
                        key={p.id}
                        onClick={() => setPestanaActiva(p.id)}
                        className={`flex items-center gap-2 px-6 py-3 rounded-t-xl font-bold transition-all whitespace-nowrap ${pestanaActiva === p.id
                            ? 'bg-slate-900 text-white shadow-lg translate-y-[1px]'
                            : 'bg-white text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                            }`}
                    >
                        <p.icono size={18} />
                        {p.etiqueta}
                    </button>
                ))}
            </div>

            {/* Renderizar Tablero Activo */}
            <motion.div
                key={pestanaActiva}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
            >
                {pestanaActiva === 'flota' && <TableroFlota />}
                {pestanaActiva === 'demanda' && <TableroDemanda />}
                {pestanaActiva === 'geo' && <TableroGeo />}
                {pestanaActiva === 'ops' && <TableroOps />}
            </motion.div>
        </div>
    );
};

export default StatisticsBI;
