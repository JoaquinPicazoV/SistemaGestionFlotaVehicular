import React from 'react';
import { Search, ChevronDown, Calendar, ArrowUpDown, Filter } from 'lucide-react';

const RequestFilters = ({
    terminoBusqueda,
    setTerminoBusqueda,
    mesFiltro,
    setMesFiltro,
    fechaInicio,
    setFechaInicio,
    fechaFin,
    setFechaFin,
    estadoFiltro,
    setEstadoFiltro,
    ordenarPor,
    setOrdenarPor,
    direccionOrden,
    setDireccionOrden,
    alLimpiar,
    mostrarFiltroEstado = false,
    mostrarOrdenamiento = false,
    customPlaceholder = "Buscar por solicitante, unidad o motivo...",
    estadosExcluidos = []
}) => {
    return (
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm mb-6">
            <div className="flex flex-col xl:flex-row gap-4">

                <div className="flex-1 relative min-w-[250px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                        type="text"
                        placeholder={customPlaceholder}
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
                        value={terminoBusqueda}
                        onChange={(e) => setTerminoBusqueda(e.target.value)}
                    />
                </div>

                <div className="flex flex-wrap gap-2 items-center">
                    {(setFechaInicio && setFechaFin) ? (
                        <div className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-xl border border-slate-200 shadow-sm">
                            <input
                                type="date"
                                className="bg-transparent text-sm font-bold text-slate-700 outline-none px-3 py-2 cursor-pointer hover:bg-slate-100 rounded-lg transition-colors"
                                value={fechaInicio}
                                onChange={e => setFechaInicio(e.target.value)}
                                title="Fecha Inicio"
                            />
                            <span className="text-slate-400 font-bold px-1 text-sm">➜</span>
                            <input
                                type="date"
                                className="bg-transparent text-sm font-bold text-slate-700 outline-none px-3 py-2 cursor-pointer hover:bg-slate-100 rounded-lg transition-colors"
                                value={fechaFin}
                                onChange={e => setFechaFin(e.target.value)}
                                title="Fecha Fin"
                            />
                        </div>
                    ) : (
                        <div className="relative min-w-[160px]">
                            <input
                                type="month"
                                className="w-full pl-3 pr-3 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-600 focus:outline-none focus:border-blue-500 cursor-pointer"
                                value={mesFiltro}
                                onChange={(e) => setMesFiltro(e.target.value)}
                            />
                        </div>
                    )}

                    {mostrarFiltroEstado && (
                        <div className="relative min-w-[160px]">
                            <select
                                className="w-full pl-3 pr-8 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-600 focus:outline-none focus:border-blue-500 appearance-none cursor-pointer"
                                value={estadoFiltro}
                                onChange={(e) => setEstadoFiltro(e.target.value)}
                            >
                                <option value="ALL">Todos los Estados</option>
                                {!estadosExcluidos.includes('PENDIENTE') && <option value="PENDIENTE">🟠 Pendientes</option>}
                                {!estadosExcluidos.includes('APROBADA') && <option value="APROBADA">🟢 Aprobadas</option>}
                                {!estadosExcluidos.includes('FINALIZADA') && <option value="FINALIZADA">🔵 Finalizadas</option>}
                                {!estadosExcluidos.includes('RECHAZADA') && <option value="RECHAZADA">🔴 Rechazadas</option>}
                                {!estadosExcluidos.includes('CANCELADO') && <option value="CANCELADO">⚫ Canceladas</option>}
                            </select>
                            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                        </div>
                    )}



                    {(terminoBusqueda || mesFiltro || fechaInicio || fechaFin || (mostrarFiltroEstado && estadoFiltro !== 'ALL')) && (
                        <button
                            onClick={alLimpiar}
                            className="px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-xl text-sm font-bold border border-red-100 transition-colors whitespace-nowrap"
                        >
                            Limpiar
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default RequestFilters;
