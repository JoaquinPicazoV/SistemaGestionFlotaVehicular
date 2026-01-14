import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { RefreshCw, Filter } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import RequestFilters from './common/RequestFilters';
import RequestCard from './common/RequestCard';
import RequestDetailModal from './common/RequestDetailModal';

const ProcessedRequests = () => {
    const [solicitudes, setSolicitudes] = useState([]);
    const [solicitudesFiltradas, setSolicitudesFiltradas] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [solicitudSeleccionada, setSolicitudSeleccionada] = useState(null);
    const [detallesSolicitud, setDetallesSolicitud] = useState({ pasajeros: [], destinos: [] });
    const [cargandoDetalles, setCargandoDetalles] = useState(false);

    // Estado de Filtros
    const [terminoBusqueda, setTerminoBusqueda] = useState('');
    const [mesFiltro, setMesFiltro] = useState(''); // YYYY-MM
    const [estadoFiltro, setEstadoFiltro] = useState('ALL'); // 'ALL', 'APROBADA', 'FINALIZADA', 'RECHAZADA'

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

    useEffect(() => {
        obtenerSolicitudes();
    }, []);

    // Lógica de Filtrado
    useEffect(() => {
        let resultado = solicitudes;

        // 1. Búsqueda por texto
        if (terminoBusqueda) {
            const terminoMinuscula = terminoBusqueda.toLowerCase();
            resultado = resultado.filter(req =>
                req.sol_unidad.toLowerCase().includes(terminoMinuscula) ||
                req.sol_nombresolicitante.toLowerCase().includes(terminoMinuscula) ||
                req.sol_motivo.toLowerCase().includes(terminoMinuscula)
            );
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

    const obtenerSolicitudes = async () => {
        setCargando(true);
        try {
            const respuesta = await axios.get(`${API_URL}/requests/processed`, { withCredentials: true });
            setSolicitudes(respuesta.data);
            setSolicitudesFiltradas(respuesta.data);
        } catch (error) {
            console.error("Error cargando solicitudes procesadas:", error);
        } finally {
            setCargando(false);
        }
    };

    const verDetalles = async (req) => {
        setSolicitudSeleccionada(req);
        setCargandoDetalles(true);
        try {
            const respuesta = await axios.get(`${API_URL}/requests/${req.sol_id}/details`, { withCredentials: true });
            setDetallesSolicitud(respuesta.data);
        } catch (error) {
            console.error("Error cargando detalles:", error);
        } finally {
            setCargandoDetalles(false);
        }
    };

    const limpiarFiltros = () => {
        setTerminoBusqueda('');
        setMesFiltro('');
        setEstadoFiltro('ALL');
    };

    if (cargando) return (
        <div className="p-12 text-center text-slate-500 flex flex-col items-center">
            <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mb-4"></div>
            Cargando historial de solicitudes...
        </div>
    );

    return (
        <div className="p-8 max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500 relative font-sans">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Solicitudes Procesadas</h2>
                    <p className="text-slate-500 text-sm mt-1">Busca y filtra el historial de viajes gestionados.</p>
                </div>

                <div className="flex items-center gap-2">
                    <button onClick={obtenerSolicitudes} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Actualizar">
                        <RefreshCw size={18} />
                    </button>
                    <div className="bg-slate-100 text-slate-600 px-4 py-1.5 rounded-full text-sm font-bold border border-slate-200 shadow-sm">
                        {solicitudesFiltradas.length} Registros
                    </div>
                </div>
            </div>

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

            <div className="grid gap-4">
                {solicitudesFiltradas.length > 0 ? (
                    solicitudesFiltradas.map((req) => (
                        <RequestCard
                            key={req.sol_id}
                            solicitud={req}
                            alAccionar={verDetalles}
                            contenidoExtra={
                                <div className="hidden md:block text-right">
                                    <div className="text-xs font-bold text-slate-400 uppercase">Hora Salida</div>
                                    <div className="font-mono text-sm text-slate-600 bg-slate-50 px-2 py-0.5 rounded inline-block">
                                        {new Date(req.sol_fechasalida).toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })}
                                    </div>
                                </div>
                            }
                        />
                    ))
                ) : (
                    <div className="text-center py-20 bg-white rounded-2xl border border-slate-200 border-dashed animate-in fade-in zoom-in-95">
                        <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
                            <Filter size={40} />
                        </div>
                        <h3 className="text-xl font-bold text-slate-800 mb-1">No se encontraron resultados</h3>
                        <p className="text-slate-500 max-w-sm mx-auto mb-6">
                            Intenta ajustar los filtros o el término de búsqueda para encontrar lo que necesitas.
                        </p>
                        <button onClick={limpiarFiltros} className="px-6 py-2 bg-white border border-slate-200 shadow-sm text-slate-600 rounded-lg hover:bg-slate-50 font-medium text-sm transition-colors">
                            Limpiar Filtros
                        </button>
                    </div>
                )}
            </div>

            {/* MODAL DE DETALLES (ReadOnly) */}
            <RequestDetailModal
                solicitud={solicitudSeleccionada}
                detalles={detallesSolicitud}
                cargandoDetalles={cargandoDetalles}
                alCerrar={() => setSolicitudSeleccionada(null)}
                accionesPie={
                    <div className="w-full flex justify-end">
                        <button onClick={() => setSolicitudSeleccionada(null)} className="px-6 py-2 bg-white border border-slate-300 text-slate-700 font-bold rounded-xl hover:bg-slate-100 transition-colors text-sm shadow-sm">
                            Cerrar
                        </button>
                    </div>
                }
            />
        </div>
    );
};

export default ProcessedRequests;
