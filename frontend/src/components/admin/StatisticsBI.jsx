import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, LineChart, Line, Legend
} from 'recharts';
import {
    Truck, Users, Map, ClipboardList, Activity, AlertTriangle, CheckCircle2, TrendingUp, Download
} from 'lucide-react';
import { motion } from 'framer-motion';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

import API_URL from '../../config/api';
const COLORES = ['#0ea5e9', '#3b82f6', '#6366f1', '#8b5cf6', '#d946ef', '#f43f5e'];

const StatisticsBI = () => {

    const [pestanaActiva, setPestanaActiva] = useState('flota');
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
        const intervalo = setInterval(cargarBI, 15000);
        return () => clearInterval(intervalo);
    }, []);

    if (cargando) return <div className="p-10 text-center text-slate-400">Cargando Tableros BI...</div>;
    if (!datos) return <div className="p-10 text-center text-red-400">Error cargando datos.</div>;





    const handleDescargarReporteBI = async () => {
        if (!datos) return;

        const workbook = new ExcelJS.Workbook();

        // Estilos de cabecera
        const headerStyle = {
            font: { bold: true, color: { argb: '000000' } },
            fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFC000' } },
            alignment: { vertical: 'middle', horizontal: 'center' }
        };

        const estilarCabecera = (ws) => {
            const row = ws.getRow(1);
            for (let i = 1; i <= ws.columns.length; i++) {
                const cell = row.getCell(i);
                cell.font = headerStyle.font;
                cell.fill = headerStyle.fill;
                cell.alignment = headerStyle.alignment;
                cell.border = {
                    top: { style: 'thin' },
                    left: { style: 'thin' },
                    bottom: { style: 'thin' },
                    right: { style: 'thin' }
                };
            }
        };

        // 1. Flota Detallada
        const wsFlota = workbook.addWorksheet('Flota Detallada');
        wsFlota.columns = [
            { header: 'PATENTE', key: 'vehi_patente', width: 15 },
            { header: 'MARCA', key: 'vehi_marca', width: 20 },
            { header: 'MODELO', key: 'vehi_modelo', width: 20 },
            { header: 'ESTADO', key: 'vehi_estado', width: 15 },
            { header: 'VIAJES REALIZADOS', key: 'total_viajes', width: 20 },
            { header: 'KM ESTIMADOS', key: 'km_estimados', width: 20 },
        ];
        estilarCabecera(wsFlota);
        datos.reporte?.flota?.forEach(v => wsFlota.addRow(v));

        // 2. Gestión Unidades
        const wsUnidades = workbook.addWorksheet('Gestión Unidades');
        wsUnidades.columns = [
            { header: 'UNIDAD', key: 'sol_unidad', width: 35 },
            { header: 'SOLICITUDES TOTALES', key: 'total_solicitudes', width: 20 },
            { header: 'APROBADAS', key: 'aprobadas', width: 15 },
            { header: 'FINALIZADAS', key: 'finalizadas', width: 15 },
        ];
        estilarCabecera(wsUnidades);
        datos.reporte?.unidades?.forEach(u => wsUnidades.addRow(u));


        // 3. Establecimientos
        const wsTerritorio = workbook.addWorksheet('Establecimientos');
        wsTerritorio.columns = [
            { header: 'ESTABLECIMIENTO', key: 'nombre', width: 50 },
            { header: 'COMUNA', key: 'comuna', width: 20 },
            { header: 'VISITAS REALIZADAS', key: 'valor', width: 20 },
        ];
        estilarCabecera(wsTerritorio);
        datos.territorio.todos_establecimientos.forEach(d => wsTerritorio.addRow(d));


        // 4. Choferes
        const wsChoferes = workbook.addWorksheet('Choferes');
        wsChoferes.columns = [
            { header: 'CONDUCTOR', key: 'nombre', width: 30 },
            { header: 'VIAJES REALIZADOS', key: 'viajes', width: 20 },
        ];
        estilarCabecera(wsChoferes);
        datos.operaciones.choferes.forEach(c => wsChoferes.addRow(c));


        // 5. Tendencia Mensual
        const wsTendencia = workbook.addWorksheet('Tendencia Mensual');
        wsTendencia.columns = [
            { header: 'MES / AÑO', key: 'mes', width: 20 },
            { header: 'CANTIDAD SOLICITUDES', key: 'cantidad', width: 25 },
        ];
        estilarCabecera(wsTendencia);
        datos.operaciones.tendencia.forEach(t => wsTendencia.addRow(t));


        // 6. Resumen Global
        const wsGlobal = workbook.addWorksheet('Resumen Global');
        wsGlobal.columns = [
            { header: 'ESTADO SOLICITUD', key: 'estado', width: 25 },
            { header: 'CANTIDAD', key: 'cantidad', width: 15 },
        ];
        estilarCabecera(wsGlobal);

        if (datos.reporte?.global) {
            wsGlobal.addRow({ estado: 'TOTAL SOLICITUDES', cantidad: datos.reporte.global.total });
            wsGlobal.addRow({ estado: 'PENDIENTES', cantidad: datos.reporte.global.pendientes });
            wsGlobal.addRow({ estado: 'APROBADAS', cantidad: datos.reporte.global.aprobadas });
            wsGlobal.addRow({ estado: 'RECHAZADAS', cantidad: datos.reporte.global.rechazadas });
            wsGlobal.addRow({ estado: 'FINALIZADAS', cantidad: datos.reporte.global.finalizadas });
            wsGlobal.addRow({ estado: 'CANCELADAS', cantidad: datos.reporte.global.canceladas });
        }


        const buffer = await workbook.xlsx.writeBuffer();
        const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        saveAs(blob, `INFORME_GESTION_SLEPLLANQUIHUE_${new Date().toISOString().slice(0, 10)}.xlsx`);
    };

    const TableroFlota = () => (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <h3 className="text-lg font-bold text-slate-700 mb-1 flex items-center gap-2">
                    <Activity size={20} className="text-amber-500" /> Desgaste de Vehículos
                </h3>
                <p className="text-xs text-slate-400 mb-6">Kilometraje acumulado por unidad (Top 3)</p>
                <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart layout="vertical" data={datos.flota.desgaste}>
                            <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                            <XAxis type="number" hide />
                            <YAxis dataKey="nombre" type="category" width={90} tick={{ fontSize: 10 }} />
                            <Tooltip cursor={{ fill: 'transparent' }} />
                            <Bar dataKey="valor" fill="#f59e0b" radius={[0, 4, 4, 0]} barSize={20} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
                <div className="mt-4 p-3 bg-amber-50 rounded-lg text-xs text-amber-800 flex gap-2">
                    <AlertTriangle size={16} className="flex-shrink-0" />
                    <span>
                        <strong>Insight:</strong> La unidad con más uso ({datos.flota.desgaste[0]?.nombre}) requiere revisión prioritaria.
                    </span>
                </div>
            </div>


            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <h3 className="text-lg font-bold text-slate-700 mb-1 flex items-center gap-2">
                    <Truck size={20} className="text-blue-500" /> Distribución de Uso
                </h3>
                <p className="text-xs text-slate-400 mb-6">Asignaciones totales por patente</p>
                <div className="h-64 flex justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie data={datos.flota.uso} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="valor" nameKey="nombre">
                                {datos.flota.uso.map((entry, index) => (
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


    const TableroDemanda = () => {
        const total = datos.demanda.kpi_rechazo.total || 1;
        const rechazadas = datos.demanda.kpi_rechazo.rechazadas || 0;
        const tasa = Math.round((rechazadas / total) * 100);

        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-4">

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center justify-center text-center">
                    <h3 className="text-lg font-bold text-slate-700 mb-4">Tasa de Rechazo</h3>
                    <div className="relative w-40 h-40 flex items-center justify-center">
                        <div className="w-full h-full rounded-full border-[12px] border-slate-100 absolute"></div>
                        <div className={`w-full h-full rounded-full border-[12px] ${tasa > 15 ? 'border-red-500' : 'border-emerald-500'} opacity-100 absolute`}
                            style={{ clipPath: `polygon(0 0, 100% 0, 100% 100%, 0 100%)`, transform: `rotate(${(tasa / 100) * 180}deg)` }}>
                        </div>

                        <div className="w-full h-full rounded-full border-[12px] border-indigo-500 opacity-20 absolute"></div>
                        <div className="text-4xl font-black text-slate-800">{tasa}%</div>
                    </div>
                </div>


                <div className="md:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                    <h3 className="text-lg font-bold text-slate-700 mb-1">Solicitudes por Unidad</h3>
                    <p className="text-xs text-slate-400 mb-4">¿Quién usa más el servicio?</p>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={datos.demanda.unidades}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="nombre" tick={{ fontSize: 10 }} interval={0} />
                                <YAxis width={30} />
                                <Tooltip />
                                <Bar dataKey="valor" fill="#6366f1" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>


            </div>
        );
    };


    const TableroGeo = () => (
        <div className="grid grid-cols-1 gap-6 pt-4">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <h3 className="text-lg font-bold text-slate-700 mb-4 flex items-center gap-2">
                    <Map size={20} className="text-emerald-500" /> Establecimientos Más Visitados (Top 5)
                </h3>
                <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart layout="vertical" data={datos.territorio.comunas}>
                            <XAxis type="number" hide />
                            <YAxis dataKey="nombre" type="category" width={220} tick={{ fontSize: 10 }} />
                            <Tooltip />
                            <Bar dataKey="valor" fill="#10b981" radius={[0, 4, 4, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );


    const TableroOps = () => (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <h3 className="text-lg font-bold text-slate-700 mb-1 flex items-center gap-2">
                    <TrendingUp size={20} className="text-purple-500" /> Estacionalidad Mensual
                </h3>
                <p className="text-xs text-slate-400 mb-4">Tendencia anual de demanda</p>
                <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={datos.operaciones.tendencia}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="mes" tick={{ fontSize: 10 }} />
                            <YAxis width={30} />
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
                        <BarChart data={datos.operaciones.choferes}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="nombre" tick={{ fontSize: 10, angle: -10 }} interval={0} />
                            <YAxis width={30} />
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
        { id: 'territorio', etiqueta: 'Territorio', icono: Map },
        { id: 'operaciones', etiqueta: 'Operaciones', icono: CheckCircle2 },
    ];

    return (
        <div className="p-4 md:p-8 w-full max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-2 duration-500">

            <div className="mb-6 md:mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-2xl md:text-3xl font-extrabold text-slate-800 tracking-tight">Panel de Control BI</h2>
                    <p className="text-sm md:text-base text-slate-500 mt-1">Toma de decisiones basada en datos reales.</p>
                </div>
                <button
                    onClick={handleDescargarReporteBI}
                    className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-lg shadow-green-600/20 text-sm"
                >
                    <Download size={18} /> Descargar Reporte Completo
                </button>
            </div>


            <div className="flex gap-2 overflow-x-auto pb-2 border-b border-slate-200 mb-6 custom-scrollbar">
                {pestanas.map((p) => (
                    <button
                        key={p.id}
                        onClick={() => setPestanaActiva(p.id)}
                        className={`flex items-center gap-2 px-5 py-2.5 md:px-6 md:py-3 rounded-t-xl font-bold transition-all whitespace-nowrap text-sm md:text-base ${pestanaActiva === p.id
                            ? 'bg-slate-900 text-white shadow-lg translate-y-[1px]'
                            : 'bg-white text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                            }`}
                    >
                        <p.icono size={18} />
                        {p.etiqueta}
                    </button>
                ))}
            </div>


            <motion.div
                key={pestanaActiva}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
            >
                {pestanaActiva === 'flota' && <TableroFlota />}
                {pestanaActiva === 'demanda' && <TableroDemanda />}
                {pestanaActiva === 'territorio' && <TableroGeo />}
                {pestanaActiva === 'operaciones' && <TableroOps />}
            </motion.div>
        </div>
    );
};

export default StatisticsBI;

