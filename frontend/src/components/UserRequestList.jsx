import React, { useState, useEffect } from 'react';
import {
    LayoutGrid,
    Clock,
    RefreshCw,
    Filter,
    User,
    Calendar
} from 'lucide-react';
import StatusBadge from './common/StatusBadge';
import RequestFilters from './common/RequestFilters';

const UserRequestList = ({ solicitudes, obtenerSolicitudes, cargando, nuevaSolicitud }) => {
    // Estado local para filtros
    const [terminoBusqueda, setTerminoBusqueda] = useState('');
    const [mesFiltro, setMesFiltro] = useState('');
    const [estadoFiltro, setEstadoFiltro] = useState('ALL');
    const [solicitudesFiltradas, setSolicitudesFiltradas] = useState([]);

    // Calcular estadísticas localmente
    const estadisticas = {
        total: solicitudes.length,
        pendientes: solicitudes.filter(r => r.sol_estado === 'PENDIENTE').length,
    };

    // Lógica de filtrado
    useEffect(() => {
        let resultado = solicitudes;

        // 1. Búsqueda por texto (Motivo)
        if (terminoBusqueda) {
            const terminoMinuscula = terminoBusqueda.toLowerCase();
            resultado = resultado.filter(req => req.sol_motivo.toLowerCase().includes(terminoMinuscula));
        }

        // 2. Filtro por Mes
        if (mesFiltro) {
            resultado = resultado.filter(req => {
                const fecha = new Date(req.sol_fechasalida);
                const mesStr = `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}`;
                return mesStr === mesFiltro;
            });
        }

        // 3. Filtro por Estado
        if (estadoFiltro !== 'ALL') {
            resultado = resultado.filter(req => req.sol_estado === estadoFiltro);
        }

        setSolicitudesFiltradas(resultado);
    }, [solicitudes, terminoBusqueda, mesFiltro, estadoFiltro]);

    const limpiarFiltros = () => {
        setTerminoBusqueda('');
        setMesFiltro('');
        setEstadoFiltro('ALL');
    };

    return (
        <div className="animate-in fade-in slide-in-from-bottom-6 duration-700 space-y-8">

            {/* Estadísticas Principales */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="bg-gradient-to-br from-blue-600 to-blue-700 p-6 rounded-2xl text-white shadow-xl shadow-blue-900/20 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform"><LayoutGrid size={64} /></div>
                    <div className="text-blue-200 text-sm font-medium mb-1 relative z-10">Total Histórico</div>
                    <div className="text-4xl font-bold relative z-10">{estadisticas.total}</div>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden group hover:border-amber-200 hover:shadow-lg transition-all">
                    <div className="absolute top-0 right-0 w-16 h-16 bg-amber-50 rounded-bl-full -mr-2 -mt-2 transition-transform group-hover:scale-110"></div>
                    <div className="absolute top-3 right-3 text-amber-500"><Clock size={24} /></div>
                    <div className="text-slate-500 text-sm font-medium mb-1">Pendientes</div>
                    <div className="text-4xl font-bold text-slate-800 group-hover:text-amber-600 transition-colors">{estadisticas.pendientes}</div>
                </div>
            </div>

            {/* Sección de Lista */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/50 overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex flex-col gap-6 bg-slate-50/30">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                            <h2 className="text-xl font-bold text-slate-800">Mis Solicitudes</h2>
                            <p className="text-slate-500 text-xs mt-1">Gestiona y revisa el estado de tus reservas</p>
                        </div>
                        <button
                            onClick={obtenerSolicitudes}
                            className="p-2 text-slate-400 hover:text-blue-600 bg-white border border-slate-200 hover:border-blue-200 rounded-lg transition-colors shadow-sm"
                            title="Actualizar Lista"
                        >
                            <RefreshCw size={18} />
                        </button>
                    </div>

                    {/* Barra de Filtros */}
                    <RequestFilters
                        terminoBusqueda={terminoBusqueda}
                        setTerminoBusqueda={setTerminoBusqueda}
                        mesFiltro={mesFiltro}
                        setMesFiltro={setMesFiltro}
                        estadoFiltro={estadoFiltro}
                        setEstadoFiltro={setEstadoFiltro}
                        alLimpiar={limpiarFiltros}
                        mostrarFiltroEstado={true}
                    />
                </div>

                {cargando ? (
                    <div className="p-16 text-center">
                        <div className="animate-spin inline-block w-10 h-10 border-[3px] border-blue-600 border-t-transparent rounded-full mb-4"></div>
                        <p className="text-slate-500 font-medium">Cargando información...</p>
                    </div>
                ) : solicitudesFiltradas.length === 0 ? (
                    <div className="p-16 text-center flex flex-col items-center justify-center bg-slate-50/50">
                        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm text-slate-300 border border-slate-100">
                            <Filter size={32} />
                        </div>
                        <h3 className="text-lg font-bold text-slate-800 mb-1">No hay resultados</h3>
                        <p className="text-slate-500 text-sm mb-4 max-w-xs">
                            No se encontraron solicitudes con los filtros aplicados.
                        </p>
                        {(terminoBusqueda || mesFiltro || estadoFiltro !== 'ALL') ? (
                            <button onClick={limpiarFiltros} className="text-blue-600 font-bold text-sm hover:underline">
                                Limpiar Filtros
                            </button>
                        ) : (
                            <button onClick={nuevaSolicitud} className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-all shadow-lg shadow-blue-500/30 text-sm">
                                Crear Primera Solicitud
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="divide-y divide-slate-100">
                        {solicitudesFiltradas.map(req => (
                            <div key={req.sol_id} className="p-6 hover:bg-slate-50 transition-all duration-200 group relative">
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">

                                    {/* Estado e ID */}
                                    <div className="flex-shrink-0 flex flex-col gap-2 min-w-[120px]">
                                        <StatusBadge estado={req.sol_estado} />
                                        <div className="text-xs text-slate-500 text-center font-bold truncate max-w-[120px] flex items-center justify-center gap-1" title={req.sol_nombresolicitante}>
                                            <User size={12} className="text-slate-400" />
                                            {req.sol_nombresolicitante || 'Usuario'}
                                        </div>
                                    </div>

                                    {/* Información */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                                                {req.sol_tipo || 'GENÉRICO'}
                                            </span>
                                            <h3 className="text-lg font-bold text-slate-800 truncate group-hover:text-blue-600 transition-colors">
                                                {req.sol_motivo}
                                            </h3>
                                        </div>

                                        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-slate-500">
                                            <div className="flex items-center gap-2">
                                                <div className="p-1 bg-slate-100 rounded text-slate-400"><Calendar size={14} /></div>
                                                <span className="font-medium">{new Date(req.sol_fechasalida).toLocaleDateString()}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <div className="p-1 bg-slate-100 rounded text-slate-400"><Clock size={14} /></div>
                                                <span>
                                                    {new Date(req.sol_fechasalida).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    {' - '}
                                                    {req.sol_fechallegada ? new Date(req.sol_fechallegada).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '?'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Observación de Rechazo */}
                                    {req.sol_estado === 'RECHAZADA' && req.sol_observacionrechazo && (
                                        <div className="md:w-64 bg-red-50 p-3 rounded-lg border border-red-100 text-xs">
                                            <strong className="text-red-700 block mb-1">Motivo Rechazo:</strong>
                                            <p className="text-red-600/80 leading-snug">"{req.sol_observacionrechazo}"</p>
                                        </div>
                                    )}

                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default UserRequestList;
