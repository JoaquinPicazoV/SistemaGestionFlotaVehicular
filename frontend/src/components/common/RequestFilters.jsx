import React from 'react';
import { Search, ChevronDown } from 'lucide-react';

const RequestFilters = ({
    terminoBusqueda,
    setTerminoBusqueda,
    mesFiltro,
    setMesFiltro,
    estadoFiltro,
    setEstadoFiltro,
    alLimpiar,
    mostrarFiltroEstado = false,
    customPlaceholder = "Buscar por solicitante, unidad o motivo..."
}) => {
    return (
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm mb-6">
            <div className="flex flex-col lg:flex-row gap-4">

                {/* Buscador */}
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                        type="text"
                        placeholder={customPlaceholder}
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
                        value={terminoBusqueda}
                        onChange={(e) => setTerminoBusqueda(e.target.value)}
                    />
                </div>

                {/* Filtros Rapidos */}
                <div className="flex gap-2 min-w-48 overflow-x-auto pb-2 lg:pb-0">
                    {/* Mes */}
                    <div className="relative flex-1 min-w-[160px]">
                        <input
                            type="month"
                            className="w-full pl-3 pr-3 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-600 focus:outline-none focus:border-blue-500 cursor-pointer"
                            value={mesFiltro}
                            onChange={(e) => setMesFiltro(e.target.value)}
                        />
                    </div>

                    {/* Estado (Opcional) */}
                    {mostrarFiltroEstado && (
                        <div className="relative min-w-[160px]">
                            <select
                                className="w-full pl-3 pr-8 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-600 focus:outline-none focus:border-blue-500 appearance-none cursor-pointer"
                                value={estadoFiltro}
                                onChange={(e) => setEstadoFiltro(e.target.value)}
                            >
                                <option value="ALL">Todos los Estados</option>
                                <option value="PENDIENTE">🟠 Pendientes</option>
                                <option value="APROBADA">🟢 Aprobadas</option>
                                <option value="FINALIZADA">🔵 Finalizadas</option>
                                <option value="RECHAZADA">🔴 Rechazadas</option>
                            </select>
                            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                        </div>
                    )}

                    {/* Limpiar */}
                    {(terminoBusqueda || mesFiltro || (mostrarFiltroEstado && estadoFiltro !== 'ALL')) && (
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
