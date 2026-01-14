import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { User, Pencil, Trash2, X, Save, AlertCircle, Search, RefreshCw, ChevronDown, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const DriverList = () => {
    const [choferes, setChoferes] = useState([]);
    const [choferesFiltrados, setChoferesFiltrados] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [choferEditando, setChoferEditando] = useState(null);
    const [mensajeError, setMensajeError] = useState(null);

    const [terminoBusqueda, setTerminoBusqueda] = useState('');
    const [estadoFiltro, setEstadoFiltro] = useState('ALL'); // 'ALL', 'ACTIVO', 'INACTIVO'

    const [creando, setCreando] = useState(false);
    const [nuevoChofer, setNuevoChofer] = useState({
        cho_correoinstitucional: '',
        cho_nombre: '',
        cho_activo: true
    });

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

    const obtenerChoferes = async () => {
        setCargando(true);
        try {
            const respuesta = await axios.get(`${API_URL}/drivers`, { withCredentials: true });
            setChoferes(respuesta.data);
            setChoferesFiltrados(respuesta.data);
        } catch (error) {
            console.error("Error cargando choferes:", error);
        } finally {
            setCargando(false);
        }
    };

    useEffect(() => {
        obtenerChoferes();
    }, []);

    useEffect(() => {
        let resultado = choferes;

        // 1. Buscador (Nombre o Correo)
        if (terminoBusqueda) {
            const terminoMinuscula = terminoBusqueda.toLowerCase();
            resultado = resultado.filter(d =>
                d.cho_nombre.toLowerCase().includes(terminoMinuscula) ||
                d.cho_correoinstitucional.toLowerCase().includes(terminoMinuscula)
            );
        }

        if (estadoFiltro !== 'ALL') {
            const esActivo = estadoFiltro === 'ACTIVO';
            resultado = resultado.filter(d => Boolean(d.cho_activo) === esActivo);
        }

        setChoferesFiltrados(resultado);
    }, [choferes, terminoBusqueda, estadoFiltro]);

    const eliminarChofer = async (email) => {
        if (!window.confirm(`¿Estás seguro de eliminar el chofer ${email}?`)) return;

        try {
            await axios.delete(`${API_URL}/drivers/${email}`, { withCredentials: true });
            setChoferes(prev => prev.filter(d => d.cho_correoinstitucional !== email));
            setMensajeError(null);
        } catch (error) {
            console.error(error);
            setMensajeError(error.response?.data?.error || 'Error al eliminar');
            setTimeout(() => setMensajeError(null), 3000);
        }
    };

    const crearChofer = async (e) => {
        e.preventDefault();
        try {
            await axios.post(`${API_URL}/drivers`, nuevoChofer, { withCredentials: true });

            setCreando(false);
            setNuevoChofer({
                cho_correoinstitucional: '',
                cho_nombre: '',
                cho_activo: true
            });
            obtenerChoferes();
        } catch (error) {
            console.error(error);
            setMensajeError(error.response?.data?.error || 'Error al crear conductor');
            setTimeout(() => setMensajeError(null), 3000);
        }
    };

    const actualizarChofer = async (e) => {
        e.preventDefault();
        try {
            await axios.put(`${API_URL}/drivers/${choferEditando.cho_correoinstitucional}`, choferEditando, { withCredentials: true });
            setChoferEditando(null);
            obtenerChoferes();
        } catch (error) {
            console.error(error);
            alert('Error al actualizar');
        }
    };

    const limpiarFiltros = () => {
        setTerminoBusqueda('');
        setEstadoFiltro('ALL');
    };

    if (cargando) return (
        <div className="p-12 text-center text-slate-500 flex flex-col items-center">
            <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mb-4"></div>
            Cargando equipo de conductores...
        </div>
    );

    return (
        <div className="p-8 max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500 relative font-sans">

            {mensajeError && (
                <div className="absolute top-4 right-8 bg-red-100 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2 shadow-lg z-50 animate-bounce">
                    <AlertCircle size={18} /> {mensajeError}
                </div>
            )}

            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Cuerpo de Conductores</h2>
                    <p className="text-slate-500 text-sm mt-1">Gestión del personal y disponibilidad operativa.</p>
                </div>

                <div className="flex items-center gap-3">
                    <button onClick={obtenerChoferes} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Actualizar">
                        <RefreshCw size={18} />
                    </button>
                    <button onClick={() => setCreando(true)} className="bg-slate-900 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-black transition-all shadow-lg shadow-slate-900/10 flex items-center gap-2">
                        + Nuevo Chofer
                    </button>
                </div>
            </div>

            {/* BARRA DE FILTROS */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm mb-6">
                <div className="flex flex-col lg:flex-row gap-4">

                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            type="text"
                            placeholder="Buscar por nombre o correo institucional..."
                            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
                            value={terminoBusqueda}
                            onChange={(e) => setTerminoBusqueda(e.target.value)}
                        />
                    </div>

                    {/* Filtros Rapidos */}
                    <div className="flex gap-2">
                        <div className="relative min-w-[180px]">
                            <select
                                className="w-full pl-3 pr-8 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-600 focus:outline-none focus:border-blue-500 appearance-none cursor-pointer"
                                value={estadoFiltro}
                                onChange={(e) => setEstadoFiltro(e.target.value)}
                            >
                                <option value="ALL">Todos los Estados</option>
                                <option value="ACTIVO">🟢 Activos</option>
                                <option value="INACTIVO">🔴 Inactivos</option>
                            </select>
                            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                        </div>

                        {/* Limpiar */}
                        {(terminoBusqueda || estadoFiltro !== 'ALL') && (
                            <button
                                onClick={limpiarFiltros}
                                className="px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-xl text-sm font-bold border border-red-100 transition-colors whitespace-nowrap"
                            >
                                Limpiar
                            </button>
                        )}
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[600px]">
                        <thead>
                            <tr className="bg-slate-50/50 text-slate-500 text-xs uppercase tracking-wider border-b border-slate-200">
                                <th className="p-5 font-bold">Conductor</th>
                                <th className="p-5 font-bold">Correo Institucional</th>
                                <th className="p-5 font-bold">Estado</th>
                                <th className="p-5 font-bold text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-sm">
                            {choferesFiltrados.length > 0 ? (
                                choferesFiltrados.map((d) => (
                                    <tr key={d.cho_correoinstitucional} className="hover:bg-slate-50/80 transition-colors group">
                                        <td className="p-5">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-white group-hover:text-blue-500 group-hover:shadow-sm transition-all border border-transparent group-hover:border-slate-100">
                                                    <User size={18} />
                                                </div>
                                                <div className="font-bold text-slate-800 text-base">{d.cho_nombre}</div>
                                            </div>
                                        </td>
                                        <td className="p-5 text-slate-600 font-mono text-sm">{d.cho_correoinstitucional}</td>
                                        <td className="p-5">
                                            <span className={`px-3 py-1 rounded-lg text-xs font-bold border flex items-center gap-1.5 w-fit ${d.cho_activo ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-red-50 text-red-700 border-red-100'}`}>
                                                <span className={`w-1.5 h-1.5 rounded-full ${d.cho_activo ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
                                                {d.cho_activo ? 'ACTIVO' : 'INACTIVO'}
                                            </span>
                                        </td>
                                        <td className="p-5 text-right">
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    onClick={() => setChoferEditando(d)}
                                                    className="text-slate-400 hover:text-blue-600 p-2 hover:bg-blue-50 rounded-lg transition-colors border border-transparent hover:border-blue-100"
                                                    title="Editar"
                                                >
                                                    <Pencil size={18} />
                                                </button>
                                                <button
                                                    onClick={() => eliminarChofer(d.cho_correoinstitucional)}
                                                    className="text-slate-400 hover:text-red-600 p-2 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-100"
                                                    title="Eliminar"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="4" className="py-20 text-center">
                                        <div className="flex flex-col items-center justify-center">
                                            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4 text-slate-300">
                                                <Search size={32} />
                                            </div>
                                            <h3 className="text-lg font-bold text-slate-800 mb-1">No se encontraron conductores</h3>
                                            <p className="text-slate-500 text-sm max-w-xs mx-auto mb-4">
                                                Intenta ajustar los términos de búsqueda o los filtros aplicados.
                                            </p>
                                            {(terminoBusqueda || estadoFiltro !== 'ALL') && (
                                                <button onClick={limpiarFiltros} className="text-blue-600 font-bold text-sm hover:underline">
                                                    Limpiar Filtros
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <AnimatePresence>
                {creando && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 20 }}
                            className="bg-white rounded-3xl shadow-xl w-full max-w-lg overflow-hidden"
                        >
                            <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                                <h3 className="font-bold text-slate-800 text-xl">Nuevo Conductor</h3>
                                <button onClick={() => setCreando(false)} className="text-slate-400 hover:text-slate-600 p-2 rounded-full hover:bg-slate-100 transition-colors">
                                    <X size={20} />
                                </button>
                            </div>

                            <form onSubmit={crearChofer} className="p-8 space-y-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Nombre Completo</label>
                                    <input
                                        type="text"
                                        placeholder="Ej: Juan Pérez"
                                        className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-medium text-slate-700"
                                        value={nuevoChofer.cho_nombre}
                                        onChange={e => setNuevoChofer({ ...nuevoChofer, cho_nombre: e.target.value })}
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Correo Institucional</label>
                                    <input
                                        type="email"
                                        placeholder="ejemplo@slep.cl"
                                        className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-medium text-slate-700"
                                        value={nuevoChofer.cho_correoinstitucional}
                                        onChange={e => setNuevoChofer({ ...nuevoChofer, cho_correoinstitucional: e.target.value })}
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Estado Inicial</label>
                                    <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl flex items-center gap-3">
                                        <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center text-white text-xs">
                                            <CheckCircle size={12} strokeWidth={4} />
                                        </div>
                                        <span className="text-sm font-bold text-emerald-800">Activo (Predeterminado)</span>
                                    </div>
                                </div>

                                <div className="pt-6 flex gap-3 justify-end border-t border-slate-100">
                                    <button
                                        type="button"
                                        onClick={() => setCreando(false)}
                                        className="px-5 py-2.5 text-slate-600 hover:bg-slate-100 rounded-xl font-bold transition-colors"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-lg shadow-blue-500/20 transition-all flex items-center gap-2 transform active:scale-[0.98]"
                                        disabled={cargando}
                                    >
                                        {cargando ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : <Save size={18} />}
                                        Registrar Conductor
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {choferEditando && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 20 }}
                            className="bg-white rounded-3xl shadow-xl w-full max-w-lg overflow-hidden"
                        >
                            <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                                <h3 className="font-bold text-slate-800 text-xl">Editar Conductor</h3>
                                <button onClick={() => setChoferEditando(null)} className="text-slate-400 hover:text-slate-600 p-2 rounded-full hover:bg-slate-100 transition-colors">
                                    <X size={20} />
                                </button>
                            </div>

                            <form onSubmit={actualizarChofer} className="p-8 space-y-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Correo Institucional (ID)</label>
                                    <input
                                        type="email"
                                        className="w-full px-4 py-2.5 border border-slate-200 rounded-xl bg-slate-50 text-slate-400 font-medium cursor-not-allowed"
                                        value={choferEditando.cho_correoinstitucional}
                                        disabled
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Nombre Completo</label>
                                    <input
                                        type="text"
                                        className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-medium text-slate-700"
                                        value={choferEditando.cho_nombre}
                                        onChange={e => setChoferEditando({ ...choferEditando, cho_nombre: e.target.value })}
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Estado</label>
                                    <div className="relative">
                                        <select
                                            className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all bg-white font-medium text-slate-700 appearance-none cursor-pointer"
                                            value={choferEditando.cho_activo ? 1 : 0}
                                            onChange={e => setChoferEditando({ ...choferEditando, cho_activo: parseInt(e.target.value) })}
                                        >
                                            <option value={1}>🟢 Activo</option>
                                            <option value={0}>🔴 Inactivo</option>
                                        </select>
                                        <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                                    </div>
                                </div>

                                {/* Campos ocultos */}
                                <input type="hidden" value={choferEditando.cho_licenciaconducir || ''} />
                                <input type="hidden" value={choferEditando.cho_telefono || ''} />

                                <div className="pt-6 flex gap-3 justify-end border-t border-slate-100">
                                    <button
                                        type="button"
                                        onClick={() => setChoferEditando(null)}
                                        className="px-5 py-2.5 text-slate-600 hover:bg-slate-100 rounded-xl font-bold transition-colors"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-lg shadow-blue-500/20 transition-all flex items-center gap-2 transform active:scale-[0.98]"
                                    >
                                        <Save size={18} /> Guardar Cambios
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default DriverList;
