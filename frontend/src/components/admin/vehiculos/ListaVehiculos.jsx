import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import API_URL from '../../../config/api';
import { Truck, AlertCircle, CheckCircle, Pencil, Trash2, X, Search, RefreshCw, ClipboardList } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';
import BitacoraVehiculo from './BitacoraVehiculo';
import FormularioVehiculo from './FormularioVehiculo';

const ListaVehiculos = () => {
    const [viajesVehiculo, setViajesVehiculo] = useState(null);
    const [viajes, setViajes] = useState([]);
    const [cargandoViajes, setCargandoViajes] = useState(false);
    const [vehiculos, setVehiculos] = useState([]);
    const [vehiculosFiltrados, setVehiculosFiltrados] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [vehiculoEditando, setVehiculoEditando] = useState(null);
    const [mensajeError, setMensajeError] = useState(null);
    const [mensajeExito, setMensajeExito] = useState(null);
    const [terminoBusqueda, setTerminoBusqueda] = useState('');
    const [filtroEstado, setFiltroEstado] = useState('ALL');
    const [creando, setCreando] = useState(false);
    const [bitacoraVehiculo, setBitacoraVehiculo] = useState(null);

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
    }, []);

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
                (v.vehi_tipo && v.vehi_tipo.toLowerCase().includes(terminoMinuscula))
            );
        }
        if (filtroEstado !== 'ALL') {
            resultado = resultado.filter(v => v.vehi_estado === filtroEstado);
        }
        setVehiculosFiltrados(resultado);
    }, [vehiculos, terminoBusqueda, filtroEstado]);

    const eliminarVehiculo = async (patente) => {
        if (!window.confirm(`¿Estás seguro de eliminar el vehículo ${patente}?`)) return;
        try {
            await axios.delete(`${API_URL}/vehicles/${patente}`, { withCredentials: true });
            setVehiculos(prev => prev.filter(v => v.vehi_patente !== patente));
            setMensajeExito("Vehículo eliminado correctamente.");
            setTimeout(() => setMensajeExito(null), 3000);
        } catch (error) {
            console.error(error);
            const msgError = error.response?.data?.error || 'Error al eliminar';

            if (error.response?.status === 400 && msgError.includes('tiene historial')) {
                if (window.confirm(`El vehículo no puede eliminarse porque tiene historial de viajes.\n\n¿Deseas marcarlo como "DE BAJA" para que no aparezca en nuevas solicitudes?`)) {
                    try {
                        const vehiculoActual = vehiculos.find(v => v.vehi_patente === patente);
                        if (vehiculoActual) {
                            await axios.put(`${API_URL}/vehicles/${patente}`, { ...vehiculoActual, vehi_estado: 'DE BAJA' }, { withCredentials: true });
                            obtenerVehiculos();
                            setMensajeExito("Vehículo marcado como DE BAJA correctamente.");
                            setTimeout(() => setMensajeExito(null), 3000);
                        }
                    } catch (updateError) {
                        console.error("Error al dar de baja:", updateError);
                        const datos = updateError.response?.data;
                        let msg = "Error al intentar dar de baja el vehículo.";

                        if (datos?.error) {
                            msg = datos.error;
                        } else if (datos?.errors && Array.isArray(datos.errors)) {
                            msg = datos.errors.map(e => `${e.msg} (${e.path})`).join(', ');
                        }

                        setMensajeError(msg);
                        setTimeout(() => setMensajeError(null), 5000);
                    }
                }
            } else {
                setMensajeError(msgError);
                setTimeout(() => setMensajeError(null), 3000);
            }
        }
    };

    const manejarGuardado = async (datos) => {
        try {
            if (vehiculoEditando) {

                await axios.put(`${API_URL}/vehicles/${datos.vehi_patente}`, datos, { withCredentials: true });
                setVehiculoEditando(null);
            } else {

                await axios.post(`${API_URL}/vehicles`, { ...datos, vehi_capacidad: parseInt(datos.vehi_capacidad) }, { withCredentials: true });
                setCreando(false);
            }
            obtenerVehiculos();
            setMensajeExito(vehiculoEditando ? "Vehículo actualizado correctamente." : "Vehículo creado correctamente.");
            setTimeout(() => setMensajeExito(null), 3000);
        } catch (error) {
            console.error(error);
            setMensajeError(error.response?.data?.error || 'Error al guardar');
            setTimeout(() => setMensajeError(null), 3000);
        }
    }


    const verViajes = async (vehiculo) => {
        setViajesVehiculo(vehiculo);
        setCargandoViajes(true);
        try {
            const res = await axios.get(`${API_URL}/vehicles/${vehiculo.vehi_patente}/trips`, { withCredentials: true });
            setViajes(res.data);
        } catch (error) {
            console.error("Error cargando viajes:", error);
            setMensajeError("No se pudieron cargar los viajes del vehículo.");
            setTimeout(() => setMensajeError(null), 3000);
        } finally {
            setCargandoViajes(false);
        }
    };

    const obtenerColorEstado = (estado) => {
        switch (estado) {
            case 'DISPONIBLE': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
            case 'EN RUTA': return 'bg-blue-100 text-blue-700 border-blue-200';
            case 'MANTENCION': return 'bg-orange-100 text-orange-700 border-orange-200';
            case 'DE BAJA': return 'bg-slate-800 text-white border-slate-900';
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
        <div className="p-4 md:p-8 max-w-7xl mx-auto relative font-sans">
            {(mensajeError || mensajeExito) && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm">
                    {mensajeError && (
                        <div className="bg-white border-l-4 border-red-500 p-6 rounded-2xl shadow-2xl max-w-md w-full flex flex-col items-center text-center gap-4">
                            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center text-red-500 mb-2">
                                <AlertCircle size={32} />
                            </div>
                            <h3 className="text-xl font-bold text-slate-800">¡Atención!</h3>
                            <p className="text-slate-600 font-medium">{mensajeError}</p>
                            <button type="button" onClick={() => setMensajeError(null)} className="mt-2 text-sm text-slate-400 font-bold hover:text-slate-600 uppercase tracking-wide">Cerrar</button>
                        </div>
                    )}
                    {mensajeExito && (
                        <div className="bg-white border-l-4 border-emerald-500 p-6 rounded-2xl shadow-2xl max-w-md w-full flex flex-col items-center text-center gap-4">
                            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-500 mb-2">
                                <CheckCircle size={32} />
                            </div>
                            <h3 className="text-xl font-bold text-slate-800">¡Éxito!</h3>
                            <p className="text-slate-600 font-medium">{mensajeExito}</p>
                        </div>
                    )}
                </div>
            )}

            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6 md:mb-8">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Flota de Vehículos</h2>
                    <p className="text-slate-500 text-sm mt-1">Gestión y monitoreo de las unidades móviles.</p>
                </div>
                <div className="flex items-center gap-3 w-full md:w-auto">
                    <button onClick={obtenerVehiculos} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Actualizar">
                        <RefreshCw size={18} />
                    </button>
                    <button onClick={() => setCreando(true)} className="flex-1 md:flex-none justify-center bg-slate-900 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-black transition-all shadow-lg shadow-slate-900/10 flex items-center gap-2">
                        + Nuevo Vehículo
                    </button>
                </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm mb-6">
                <div className="flex flex-col lg:flex-row gap-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            type="text"
                            placeholder="Buscar por marca, modelo, patente..."
                            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
                            value={terminoBusqueda}
                            onChange={(e) => setTerminoBusqueda(e.target.value)}
                        />
                    </div>
                    <div className="w-full lg:w-48">
                        <select
                            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer"
                            value={filtroEstado}
                            onChange={(e) => setFiltroEstado(e.target.value)}
                        >
                            <option value="ALL">Todos los Estados</option>
                            <option value="DISPONIBLE">🟢 Disponible</option>
                            <option value="EN RUTA">🔵 En Ruta</option>
                            <option value="MANTENCION">🟠 Mantención</option>
                            <option value="DE BAJA">⚫ De Baja</option>
                        </select>
                    </div>
                </div>
            </div>


            {/* Mobile View */}
            <div className="md:hidden space-y-4">
                {vehiculosFiltrados.length > 0 ? (
                    vehiculosFiltrados.map((v) => (
                        <div key={v.vehi_patente} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
                            <div className="flex justify-between items-start mb-3">
                                <div className="flex gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400">
                                        <Truck size={20} />
                                    </div>
                                    <div>
                                        <div className="font-bold text-slate-800">{v.vehi_marca} {v.vehi_modelo}</div>
                                        <span className="text-xs font-mono font-bold bg-slate-100 px-1.5 py-0.5 rounded text-slate-500 border border-slate-200">{v.vehi_patente}</span>
                                    </div>
                                </div>
                                <span className={`px-2 py-1 rounded-lg text-[10px] font-bold border flex items-center gap-1 w-fit ${obtenerColorEstado(v.vehi_estado)}`}>
                                    <span className={`w-1.5 h-1.5 rounded-full ${v.vehi_estado === 'DISPONIBLE' ? 'bg-emerald-500' : v.vehi_estado === 'EN RUTA' ? 'bg-blue-500' : v.vehi_estado === 'MANTENCION' ? 'bg-orange-500' : 'bg-white'}`}></span>
                                    {v.vehi_estado}
                                </span>
                            </div>

                            <div className="flex items-center gap-4 text-xs text-slate-500 font-medium mb-4 pl-1">
                                <div>📅 {v.vehi_anio || 'N/A'}</div>
                                <div>👥 {v.vehi_capacidad} PAX</div>
                                <div>📝 {v.vehi_tipo || 'Vehículo'}</div>
                            </div>

                            <div className="flex flex-col gap-2">
                                <button
                                    onClick={() => verViajes(v)}
                                    className="w-full py-2 bg-blue-50 text-blue-600 rounded-xl text-xs font-bold hover:bg-blue-100 transition-colors border border-blue-100 flex items-center justify-center gap-2"
                                >
                                    <ClipboardList size={14} /> Ver Próximos Viajes
                                </button>
                                <div className="grid grid-cols-3 gap-2">
                                    <button
                                        onClick={() => setBitacoraVehiculo(v)}
                                        className="py-2 bg-slate-50 border border-slate-200 text-slate-600 rounded-xl flex items-center justify-center hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-200 transition-colors"
                                        title="Bitácora"
                                    >
                                        <ClipboardList size={16} />
                                    </button>
                                    <button
                                        onClick={() => setVehiculoEditando(v)}
                                        className="py-2 bg-slate-50 border border-slate-200 text-slate-600 rounded-xl flex items-center justify-center hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition-colors"
                                        title="Editar"
                                    >
                                        <Pencil size={16} />
                                    </button>
                                    <button
                                        onClick={() => eliminarVehiculo(v.vehi_patente)}
                                        className="py-2 bg-slate-50 border border-slate-200 text-slate-600 rounded-xl flex items-center justify-center hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors"
                                        title="Eliminar"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="p-8 text-center text-slate-400 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                        No se encontraron vehículos.
                    </div>
                )}
            </div>

            <div className="hidden md:block bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[700px]">
                        <thead>
                            <tr className="bg-slate-50/50 text-slate-500 text-xs uppercase tracking-wider border-b border-slate-200">
                                <th className="p-5 font-bold">Vehículo / Marca</th>
                                <th className="p-5 font-bold">Patente / Año</th>
                                <th className="p-5 font-bold">Capacidad</th>
                                <th className="p-5 font-bold">Estado</th>
                                <th className="p-5 font-bold">Itinerario</th>
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
                                                    <div className="font-bold text-slate-800 text-base">{v.vehi_tipo || 'Vehículo'} {v.vehi_modelo}</div>
                                                    <div className="text-xs font-bold text-slate-400 uppercase tracking-wide">{v.vehi_marca}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-5">
                                            <span className="font-mono text-slate-600 bg-slate-100 px-2 py-1 rounded text-xs border border-slate-200 font-bold">
                                                {v.vehi_patente}
                                            </span>
                                            {v.vehi_anio && <div className="text-xs text-slate-400 mt-1 font-bold">{v.vehi_anio}</div>}
                                        </td>
                                        <td className="p-5 text-slate-600 font-medium">
                                            <div>{v.vehi_capacidad} PAX</div>
                                        </td>
                                        <td className="p-5">
                                            <span className={`px-3 py-1 rounded-lg text-xs font-bold border flex items-center gap-1.5 w-fit ${obtenerColorEstado(v.vehi_estado)}`}>
                                                <span className={`w-1.5 h-1.5 rounded-full ${v.vehi_estado === 'DISPONIBLE' ? 'bg-emerald-500' : v.vehi_estado === 'EN RUTA' ? 'bg-blue-500' : v.vehi_estado === 'MANTENCION' ? 'bg-orange-500' : 'bg-white'}`}></span>
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
                                                    onClick={() => setBitacoraVehiculo(v)}
                                                    className="text-slate-400 hover:text-emerald-600 p-2 hover:bg-emerald-50 rounded-lg transition-colors border border-transparent hover:border-emerald-100"
                                                    title="Ver Bitácora / Historial"
                                                >
                                                    <ClipboardList size={18} />
                                                </button>
                                                <button onClick={() => setVehiculoEditando(v)} className="text-slate-400 hover:text-blue-600 p-2 hover:bg-blue-50 rounded-lg transition-colors"><Pencil size={18} /></button>
                                                <button onClick={() => eliminarVehiculo(v.vehi_patente)} className="text-slate-400 hover:text-red-600 p-2 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={18} /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6" className="py-20 text-center text-slate-400">No se encontraron vehículos.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {(creando || vehiculoEditando) && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-3xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
                        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                            <h3 className="font-bold text-slate-800 text-xl">{creando ? 'Nuevo Vehículo' : 'Editar Vehículo'}</h3>
                            <button onClick={() => { setCreando(false); setVehiculoEditando(null); }} className="text-slate-400 hover:text-slate-600 p-2 rounded-full hover:bg-slate-100 transition-colors">
                                <X size={20} />
                            </button>
                        </div>
                        <FormularioVehiculo
                            alEnviar={manejarGuardado}
                            alCancelar={() => { setCreando(false); setVehiculoEditando(null); }}
                            inicial={vehiculoEditando}
                            cargando={cargando}
                            alError={(msg) => {
                                setMensajeError(msg);
                                setTimeout(() => setMensajeError(null), 3000);
                            }}
                        />
                    </div>
                </div>
            )}

            <AnimatePresence>
                {bitacoraVehiculo && (
                    <BitacoraVehiculo
                        vehiculo={bitacoraVehiculo}
                        alCerrar={() => setBitacoraVehiculo(null)}
                    />
                )}
            </AnimatePresence>


            {viajesVehiculo && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-3xl shadow-xl w-full max-w-2xl overflow-hidden max-h-[90vh] flex flex-col">
                        <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                            <div>
                                <h3 className="font-bold text-slate-800 text-xl">Próximos Viajes</h3>
                                <p className="text-sm text-slate-500 font-medium">Asignaciones para {viajesVehiculo.vehi_marca} {viajesVehiculo.vehi_modelo} ({viajesVehiculo.vehi_patente})</p>
                            </div>
                            <button onClick={() => setViajesVehiculo(null)} className="text-slate-400 hover:text-slate-600 p-2 rounded-full hover:bg-slate-100 transition-colors"><X size={20} /></button>
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
                                            <th className="p-4 border-b border-slate-100">Fecha</th>
                                            <th className="p-4 border-b border-slate-100">Estado</th>
                                            <th className="p-4 border-b border-slate-100">Motivo</th>
                                            <th className="p-4 border-b border-slate-100">Conductor</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 text-sm text-slate-600">
                                        {viajes.map((v) => (
                                            <tr key={v.sol_id} className="hover:bg-slate-50/50">
                                                <td className="p-4 font-bold text-slate-800">
                                                    {new Date(v.sol_fechasalida).toLocaleDateString()} <br />
                                                    <span className="text-xs text-slate-400 font-mono">
                                                        {new Date(v.sol_fechasalida).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(v.sol_fechallegada).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                </td>
                                                <td className="p-4">
                                                    <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${v.sol_estado === 'APROBADA' ? 'bg-emerald-100 text-emerald-700' :
                                                        v.sol_estado === 'PENDIENTE' ? 'bg-amber-100 text-amber-700' :
                                                            'bg-blue-100 text-blue-700'
                                                        }`}>
                                                        {v.sol_estado}
                                                    </span>
                                                </td>
                                                <td className="p-4">
                                                    <div className="font-medium text-slate-800 mb-0.5 line-clamp-1">{v.sol_motivo}</div>
                                                    <div className="text-xs text-slate-400">{v.sol_unidad}</div>
                                                </td>
                                                <td className="p-4 text-xs font-bold uppercase">{v.nombre_chofer || 'SIN CHOFER'}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            ) : (
                                <div className="p-12 text-center text-slate-400">
                                    <ClipboardList size={48} className="mx-auto mb-4 text-slate-200" />
                                    <p>No hay viajes programados próximamente.</p>
                                </div>
                            )}
                        </div>
                        <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
                            <button onClick={() => setViajesVehiculo(null)} className="px-5 py-2 bg-white border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-100 transition-colors">Cerrar</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ListaVehiculos;
