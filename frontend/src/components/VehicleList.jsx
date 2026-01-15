import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import API_URL from '../config/api';
import { Truck, AlertCircle, CheckCircle, Pencil, Trash2, X, Save, Search, RefreshCw, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const VehicleList = () => {
    const [vehiculoViajes, setVehiculoViajes] = useState(null);
    const [viajes, setViajes] = useState([]);
    const [cargandoViajes, setCargandoViajes] = useState(false);

    // Restaurar estados originales
    const [vehiculos, setVehiculos] = useState([]);
    const [vehiculosFiltrados, setVehiculosFiltrados] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [vehiculoEditando, setVehiculoEditando] = useState(null);
    const [mensajeError, setMensajeError] = useState(null);
    const [terminoBusqueda, setTerminoBusqueda] = useState('');
    const [estadoFiltro, setEstadoFiltro] = useState('ALL');
    const [creando, setCreando] = useState(false);
    const [nuevoVehiculo, setNuevoVehiculo] = useState({
        vehi_patente: '',
        vehi_marca: '',
        vehi_modelo: '',
        vehi_capacidad: '',
        vehi_estado: 'DISPONIBLE'
    });



    const obtenerVehiculos = useCallback(async () => {
        setCargando(true);
        try {
            const respuesta = await axios.get(`${API_URL}/vehicles`, { withCredentials: true });
            setVehiculos(respuesta.data);
            setVehiculosFiltrados(respuesta.data);
        } catch (error) {
            console.error("Error cargando vehículos:", error);
        } finally {
            setCargando(false);
        }
    }, [API_URL]);

    useEffect(() => {
        obtenerVehiculos();
    }, [obtenerVehiculos]);

    useEffect(() => {
        let resultado = vehiculos;

        if (terminoBusqueda) {
            const terminoMinuscula = terminoBusqueda.toLowerCase();
            resultado = resultado.filter(v =>
                v.vehi_marca.toLowerCase().includes(terminoMinuscula) ||
                v.vehi_modelo.toLowerCase().includes(terminoMinuscula) ||
                v.vehi_patente.toLowerCase().includes(terminoMinuscula) ||
                v.vehi_capacidad.toString().includes(terminoMinuscula)
            );
        }

        if (estadoFiltro !== 'ALL') {
            resultado = resultado.filter(v => v.vehi_estado === estadoFiltro);
        }

        setVehiculosFiltrados(resultado);
    }, [vehiculos, terminoBusqueda, estadoFiltro]);

    const eliminarVehiculo = async (patente) => {
        if (!window.confirm(`¿Estás seguro de eliminar el vehículo ${patente}?`)) return;

        try {
            await axios.delete(`${API_URL}/vehicles/${patente}`, { withCredentials: true });
            setVehiculos(prev => prev.filter(v => v.vehi_patente !== patente));
            setMensajeError(null);
        } catch (error) {
            console.error(error);
            setMensajeError(error.response?.data?.error || 'Error al eliminar');
            setTimeout(() => setMensajeError(null), 3000);
        }
    };

    const actualizarVehiculo = async (e) => {
        e.preventDefault();
        try {
            await axios.put(`${API_URL}/vehicles/${vehiculoEditando.vehi_patente}`, vehiculoEditando, { withCredentials: true });
            setVehiculoEditando(null);
            obtenerVehiculos();
        } catch (error) {
            console.error(error);
            alert('Error al actualizar');
        }
    };

    const crearVehiculo = async (e) => {
        e.preventDefault();
        try {
            const payload = { ...nuevoVehiculo, vehi_capacidad: parseInt(nuevoVehiculo.vehi_capacidad) };
            await axios.post(`${API_URL}/vehicles`, payload, { withCredentials: true });

            setCreando(false);
            setNuevoVehiculo({
                vehi_patente: '',
                vehi_marca: '',
                vehi_modelo: '',
                vehi_capacidad: '',
                vehi_estado: 'DISPONIBLE'
            });
            obtenerVehiculos();
        } catch (error) {
            console.error(error);
            setMensajeError(error.response?.data?.error || 'Error al crear vehículo');
            setTimeout(() => setMensajeError(null), 3000);
        }
    };

    const verViajes = async (vehiculo) => {
        setVehiculoViajes(vehiculo);
        setCargandoViajes(true);
        try {
            const res = await axios.get(`${API_URL}/vehicles/${vehiculo.vehi_patente}/trips`, { withCredentials: true });
            setViajes(res.data);
        } catch (error) {
            console.error("Error cargando viajes:", error);
            alert("No se pudieron cargar los viajes.");
        } finally {
            setCargandoViajes(false);
        }
    };

    const limpiarFiltros = () => {
        setTerminoBusqueda('');
        setEstadoFiltro('ALL');
    };

    const obtenerColorEstado = (estado) => {
        switch (estado) {
            case 'DISPONIBLE': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
            case 'EN RUTA': return 'bg-blue-100 text-blue-700 border-blue-200';
            case 'MANTENCION': return 'bg-orange-100 text-orange-700 border-orange-200';
            default: return 'bg-slate-100 text-slate-700 border-slate-200';
        }
    };

    if (cargando) return (
        <div className="p-12 text-center text-slate-500 flex flex-col items-center">
            <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mb-4"></div>
            Cargando flota de vehículos...
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
                    <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Flota de Vehículos</h2>
                    <p className="text-slate-500 text-sm mt-1">Gestión y monitoreo de las unidades móviles.</p>
                </div>

                <div className="flex items-center gap-3">
                    <button onClick={obtenerVehiculos} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Actualizar">
                        <RefreshCw size={18} />
                    </button>
                    <button onClick={() => setCreando(true)} className="bg-slate-900 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-black transition-all shadow-lg shadow-slate-900/10 flex items-center gap-2">
                        + Nuevo Vehículo
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
                            placeholder="Buscar por marca, modelo, patente o capacidad..."
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
                                <option value="DISPONIBLE">🟢 Disponibles</option>
                                <option value="EN RUTA">🔵 En Ruta</option>
                                <option value="MANTENCION">🟠 Mantenimiento</option>
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
                    <table className="w-full text-left border-collapse min-w-[700px]">
                        <thead>
                            <tr className="bg-slate-50/50 text-slate-500 text-xs uppercase tracking-wider border-b border-slate-200">
                                <th className="p-5 font-bold">Vehículo / Marca</th>
                                <th className="p-5 font-bold">Patente</th>
                                <th className="p-5 font-bold">Capacidad</th>
                                <th className="p-5 font-bold">Estado</th>
                                <th className="p-5 font-bold">Próximos Viajes</th>
                                <th className="p-5 font-bold text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-sm">
                            {vehiculosFiltrados.length > 0 ? (
                                vehiculosFiltrados.map((v) => (
                                    <tr key={v.vehi_patente} className="hover:bg-slate-50/80 transition-colors group">
                                        <td className="p-5">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-white group-hover:text-blue-500 group-hover:shadow-sm transition-all border border-transparent group-hover:border-slate-100">
                                                    <Truck size={22} />
                                                </div>
                                                <div>
                                                    <div className="font-bold text-slate-800 text-base">{v.vehi_modelo}</div>
                                                    <div className="text-xs font-bold text-slate-400 uppercase tracking-wide">{v.vehi_marca}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-5">
                                            <span className="font-mono text-slate-600 bg-slate-100 px-2 py-1 rounded text-xs border border-slate-200 font-bold">
                                                {v.vehi_patente}
                                            </span>
                                        </td>
                                        <td className="p-5 text-slate-600 font-medium">{v.vehi_capacidad} Pasajeros</td>
                                        <td className="p-5">
                                            <span className={`px-3 py-1 rounded-lg text-xs font-bold border flex items-center gap-1.5 w-fit ${obtenerColorEstado(v.vehi_estado)}`}>
                                                <span className={`w-1.5 h-1.5 rounded-full ${v.vehi_estado === 'DISPONIBLE' ? 'bg-emerald-500' : v.vehi_estado === 'EN RUTA' ? 'bg-blue-500' : 'bg-orange-500'}`}></span>
                                                {v.vehi_estado}
                                            </span>
                                        </td>
                                        <td className="p-5">
                                            <button
                                                onClick={() => verViajes(v)}
                                                className="px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-xs font-bold hover:bg-blue-100 transition-colors border border-blue-100"
                                            >
                                                Ver Itinerario
                                            </button>
                                        </td>
                                        <td className="p-5 text-right">
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    onClick={() => setVehiculoEditando(v)}
                                                    className="text-slate-400 hover:text-blue-600 p-2 hover:bg-blue-50 rounded-lg transition-colors border border-transparent hover:border-blue-100"
                                                    title="Editar"
                                                >
                                                    <Pencil size={18} />
                                                </button>
                                                <button
                                                    onClick={() => eliminarVehiculo(v.vehi_patente)}
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
                                    <td colSpan="6" className="py-20 text-center">
                                        <div className="flex flex-col items-center justify-center">
                                            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4 text-slate-300">
                                                <Search size={32} />
                                            </div>
                                            <h3 className="text-lg font-bold text-slate-800 mb-1">No se encontraron vehículos</h3>
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
                                <h3 className="font-bold text-slate-800 text-xl">Nuevo Vehículo</h3>
                                <button onClick={() => setCreando(false)} className="text-slate-400 hover:text-slate-600 p-2 rounded-full hover:bg-slate-100 transition-colors">
                                    <X size={20} />
                                </button>
                            </div>

                            <form onSubmit={crearVehiculo} className="p-8 space-y-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Patente</label>
                                    <input
                                        type="text"
                                        placeholder="Ej: AB-CD-12"
                                        className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-medium text-slate-700 uppercase"
                                        value={nuevoVehiculo.vehi_patente}
                                        onChange={e => setNuevoVehiculo({ ...nuevoVehiculo, vehi_patente: e.target.value.toUpperCase() })}
                                        required
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Marca</label>
                                        <input
                                            type="text"
                                            placeholder="Ej: Toyota"
                                            className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-medium text-slate-700"
                                            value={nuevoVehiculo.vehi_marca}
                                            onChange={e => setNuevoVehiculo({ ...nuevoVehiculo, vehi_marca: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Modelo</label>
                                        <input
                                            type="text"
                                            placeholder="Ej: Sprinter"
                                            className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-medium text-slate-700"
                                            value={nuevoVehiculo.vehi_modelo}
                                            onChange={e => setNuevoVehiculo({ ...nuevoVehiculo, vehi_modelo: e.target.value })}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Capacidad</label>
                                        <div className="relative">
                                            <input
                                                type="number"
                                                className="w-full pl-4 pr-10 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-medium text-slate-700"
                                                value={nuevoVehiculo.vehi_capacidad}
                                                onChange={e => setNuevoVehiculo({ ...nuevoVehiculo, vehi_capacidad: e.target.value })}
                                                required
                                                min="1"
                                            />
                                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">Pax</span>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Estado Inicial</label>
                                        <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl flex items-center gap-3">
                                            <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center text-white text-xs">
                                                <CheckCircle size={12} strokeWidth={4} />
                                            </div>
                                            <span className="text-sm font-bold text-emerald-800">Disponible (Predeterminado)</span>
                                        </div>
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
                                        Crear Vehículo
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {vehiculoEditando && (
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
                                <h3 className="font-bold text-slate-800 text-xl">Editar Vehículo</h3>
                                <button onClick={() => setVehiculoEditando(null)} className="text-slate-400 hover:text-slate-600 p-2 rounded-full hover:bg-slate-100 transition-colors">
                                    <X size={20} />
                                </button>
                            </div>

                            <form onSubmit={actualizarVehiculo} className="p-8 space-y-6">
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Marca</label>
                                        <input
                                            type="text"
                                            className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-medium text-slate-700"
                                            value={vehiculoEditando.vehi_marca}
                                            onChange={e => setVehiculoEditando({ ...vehiculoEditando, vehi_marca: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Modelo</label>
                                        <input
                                            type="text"
                                            className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-medium text-slate-700"
                                            value={vehiculoEditando.vehi_modelo}
                                            onChange={e => setVehiculoEditando({ ...vehiculoEditando, vehi_modelo: e.target.value })}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Patente</label>
                                    <input
                                        type="text"
                                        className="w-full px-4 py-2.5 border border-slate-200 rounded-xl bg-slate-50 text-slate-400 font-mono font-bold cursor-not-allowed"
                                        value={vehiculoEditando.vehi_patente}
                                        disabled
                                    />
                                    <p className="text-[10px] text-slate-400 italic">La patente es un identificador único y no puede modificarse.</p>
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Capacidad</label>
                                        <div className="relative">
                                            <input
                                                type="number"
                                                className="w-full pl-4 pr-10 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-medium text-slate-700"
                                                value={vehiculoEditando.vehi_capacidad}
                                                onChange={e => setVehiculoEditando({ ...vehiculoEditando, vehi_capacidad: parseInt(e.target.value) })}
                                                required
                                                min="1"
                                            />
                                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">Pax</span>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Estado</label>
                                        <div className="relative">
                                            <select
                                                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all bg-white font-medium text-slate-700 appearance-none cursor-pointer"
                                                value={vehiculoEditando.vehi_estado}
                                                onChange={e => setVehiculoEditando({ ...vehiculoEditando, vehi_estado: e.target.value })}
                                            >
                                                <option value="DISPONIBLE">🟢 Disponible</option>
                                                <option value="EN RUTA">🔵 En Ruta</option>
                                                <option value="MANTENCION">🟠 En Mantención</option>
                                            </select>
                                            <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-6 flex gap-3 justify-end border-t border-slate-100">
                                    <button
                                        type="button"
                                        onClick={() => setVehiculoEditando(null)}
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

            {/* MODAL VER VIAJES */}
            <AnimatePresence>
                {vehiculoViajes && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                        <motion.div initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }} className="bg-white rounded-3xl shadow-xl w-full max-w-2xl overflow-hidden max-h-[90vh] flex flex-col">
                            <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                                <div>
                                    <h3 className="font-bold text-slate-800 text-xl">Próximos Viajes</h3>
                                    <p className="text-sm text-slate-500 font-medium">Asignaciones para {vehiculoViajes.vehi_modelo} ({vehiculoViajes.vehi_patente})</p>
                                </div>
                                <button onClick={() => setVehiculoViajes(null)} className="text-slate-400 hover:text-slate-600 p-2 rounded-full hover:bg-slate-100 transition-colors"><X size={20} /></button>
                            </div>

                            <div className="p-0 overflow-y-auto custom-scrollbar">
                                {cargandoViajes ? (
                                    <div className="p-12 text-center text-slate-400">
                                        <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mb-4 mx-auto"></div>
                                        Cargando itinerario...
                                    </div>
                                ) : viajes.length > 0 ? (
                                    <table className="w-full text-left">
                                        <thead className="bg-slate-50 sticky top-0 z-10 text-xs text-slate-500 uppercase font-bold tracking-wider">
                                            <tr>
                                                <th className="p-4 border-b border-slate-100">Fecha Salida</th>
                                                <th className="p-4 border-b border-slate-100">Destino/Motivo</th>
                                                <th className="p-4 border-b border-slate-100">Unidad</th>
                                                <th className="p-4 border-b border-slate-100">Regreso Est.</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100 text-sm text-slate-600">
                                            {viajes.map((v) => (
                                                <tr key={v.sol_id} className="hover:bg-slate-50/50">
                                                    <td className="p-4 font-bold text-slate-800">
                                                        {new Date(v.sol_fechasalida).toLocaleDateString()} <br />
                                                        <span className="text-xs text-blue-600 font-mono bg-blue-50 px-1 py-0.5 rounded">{new Date(v.sol_fechasalida).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                    </td>
                                                    <td className="p-4">
                                                        <div className="font-medium text-slate-800 mb-0.5">{v.sol_motivo}</div>
                                                        <div className="text-xs text-slate-400">ID: {v.sol_id.slice(0, 8)}...</div>
                                                    </td>
                                                    <td className="p-4 text-xs font-bold uppercase">{v.sol_unidad}</td>
                                                    <td className="p-4 font-mono text-xs">
                                                        {new Date(v.sol_fechallegada).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                ) : (
                                    <div className="p-16 text-center text-slate-400">
                                        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
                                            <Search size={24} />
                                        </div>
                                        <p className="font-medium">No tiene viajes próximos asignados.</p>
                                    </div>
                                )}
                            </div>

                            <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end">
                                <button
                                    onClick={() => setVehiculoViajes(null)}
                                    className="px-6 py-2.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl font-bold transition-colors"
                                >
                                    Cerrar
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default VehicleList;
