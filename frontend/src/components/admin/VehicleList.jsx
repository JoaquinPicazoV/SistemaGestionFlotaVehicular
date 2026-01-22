import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import API_URL from '../../config/api';
import { Truck, AlertCircle, CheckCircle, Pencil, Trash2, X, Save, Search, RefreshCw, ChevronDown, Info, FileText, ClipboardList } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import VehicleBitacora from './VehicleBitacora';

const VehicleForm = ({ onSubmit, onCancel, inicial, cargando }) => {
    const [formData, setFormData] = useState(inicial || {
        vehi_patente: '',
        vehi_marca: '',
        vehi_modelo: '',
        vehi_tipo: '',
        vehi_anio: '',
        vehi_color: '',
        vehi_motor: '',
        vehi_chasis: '',
        vehi_capacidad: '',
        vehi_capacidad_carga: '',
        vehi_inventario: '',
        vehi_propietario: 'SERVICIO LOCAL DE LLANQUIHUE',
        vehi_resolucion: '',
        vehi_lugaraparcamiento: '',
        vehi_poliza: '',
        vehi_multas: '',
        vehi_estado: 'DISPONIBLE'
    });

    useEffect(() => {
        if (inicial) {
            setFormData(inicial);
        }
    }, [inicial]);

    const handleChange = (e) => {
        const { name, value } = e.target;

        // Validaciones Específicas
        if (name === 'vehi_patente') {
            // Solo letras y números, sin guiones. Máximo 6 caracteres.
            const upperVal = value.toUpperCase();
            if (/^[A-Z0-9]*$/.test(upperVal) && upperVal.length <= 6) {
                setFormData(prev => ({ ...prev, [name]: upperVal }));
            }
            return;
        }

        if (name === 'vehi_color') {
            // Solo letras y espacios
            const upperVal = value.toUpperCase();
            if (/^[A-Z\s]*$/.test(upperVal)) {
                setFormData(prev => ({ ...prev, [name]: upperVal }));
            }
            return;
        }

        if (['vehi_motor', 'vehi_capacidad_carga', 'vehi_anio', 'vehi_capacidad'].includes(name)) {
            // Solo números
            if (/^[0-9]*$/.test(value)) {
                setFormData(prev => ({ ...prev, [name]: value }));
            }
            return;
        }

        if (name === 'vehi_chasis') {
            // Solo letras y números (sin espacios ni guiones)
            const upperVal = value.toUpperCase();
            if (/^[A-Z0-9]*$/.test(upperVal)) {
                setFormData(prev => ({ ...prev, [name]: upperVal }));
            }
            return;
        }

        // Validación General para campos de texto (excluyendo campos puramente numéricos si los hubiera como inputs text)
        // Lista de campos de texto restringidos
        const textFields = ['vehi_marca', 'vehi_modelo', 'vehi_tipo', 'vehi_inventario', 'vehi_propietario', 'vehi_resolucion', 'vehi_lugaraparcamiento', 'vehi_poliza'];

        if (textFields.includes(name)) {
            // Solo letras, números, espacios, guión, slash y punto.
            const upperVal = value.toUpperCase();
            if (/^[A-Z0-9\s\-/\.]*$/.test(upperVal)) {
                setFormData(prev => ({ ...prev, [name]: upperVal }));
            }
            return;
        }

        if (name === 'vehi_multas') {
            if (/^[a-zA-Z0-9\s.,;:\-/"'?!@#&()º]*$/.test(value)) {
                setFormData(prev => ({ ...prev, [name]: value }));
            }
            return;
        }

        // Para el resto (selects, números)
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(formData);
    };

    return (
        <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-6 overflow-y-auto max-h-[85vh]">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex items-center justify-between mb-2">
                <div>
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wide block mb-1">Patente</label>
                    <input
                        type="text"
                        name="vehi_patente"
                        placeholder="ABCD12"
                        className="bg-transparent text-xl font-bold text-slate-800 placeholder:text-slate-300 outline-none uppercase w-full"
                        value={formData.vehi_patente}
                        onChange={handleChange}
                        disabled={!!inicial} // Si es edicion, no se edita patente
                        required
                    />
                    {!!inicial && <p className="text-[10px] text-slate-400 italic">No editable</p>}
                </div>
                <div className="flex flex-col items-end">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wide block mb-1">Estado</label>
                    {!inicial ? (
                        <div className="bg-emerald-100 text-emerald-700 px-3 py-1.5 rounded-lg text-sm font-bold border border-emerald-200 flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-emerald-500"></div> DISPONIBLE
                        </div>
                    ) : (
                        <select
                            name="vehi_estado"
                            className="bg-white px-3 py-1.5 border border-slate-200 rounded-lg text-sm font-bold text-slate-700 outline-none focus:border-blue-500"
                            value={formData.vehi_estado}
                            onChange={handleChange}
                        >
                            <option value="DISPONIBLE">🟢 Disponible</option>
                            <option value="EN RUTA">🔵 En Ruta</option>
                            <option value="MANTENCION">🟠 Mantenimiento</option>
                        </select>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Tipo</label>
                    <input type="text" name="vehi_tipo" placeholder="Ej: MINIBUS" className="input-std" value={formData.vehi_tipo || ''} onChange={handleChange} required />
                </div>
                <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Marca</label>
                    <input type="text" name="vehi_marca" placeholder="Ej: MERCEDEZ BENZ" className="input-std" value={formData.vehi_marca} onChange={handleChange} required />
                </div>
                <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Modelo</label>
                    <input type="text" name="vehi_modelo" placeholder="Ej: SPRINTER" className="input-std" value={formData.vehi_modelo} onChange={handleChange} required />
                </div>
                <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Año</label>
                    <input type="text" inputMode="numeric" name="vehi_anio" placeholder="202X" className="input-std" value={formData.vehi_anio || ''} onChange={handleChange} maxLength={4} />
                </div>
                <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Color</label>
                    <input type="text" name="vehi_color" placeholder="Blanco" className="input-std" value={formData.vehi_color || ''} onChange={handleChange} />
                </div>
                <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Capacidad Pax</label>
                    <input type="text" inputMode="numeric" name="vehi_capacidad" placeholder="19" className="input-std" value={formData.vehi_capacidad} onChange={handleChange} required />
                </div>
            </div>

            {/* Datos Técnicos */}
            <div className="pt-4 border-t border-slate-100">
                <h4 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2"><Info size={16} /> Datos Técnicos</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">N° Motor</label>
                        <input type="text" name="vehi_motor" className="input-std font-mono" value={formData.vehi_motor || ''} onChange={handleChange} />
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">N° Chasis</label>
                        <input type="text" name="vehi_chasis" className="input-std font-mono" value={formData.vehi_chasis || ''} onChange={handleChange} />
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Capacidad (kg-mt3)</label>
                        <input type="text" name="vehi_capacidad_carga" className="input-std" value={formData.vehi_capacidad_carga || ''} onChange={handleChange} />
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">N° Inventario</label>
                        <input type="text" name="vehi_inventario" className="input-std font-mono" value={formData.vehi_inventario || ''} onChange={handleChange} />
                    </div>
                </div>
            </div>

            {/* Datos Administrativos */}
            <div className="pt-4 border-t border-slate-100">
                <h4 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2"><FileText size={16} /> Datos Administrativos</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2 space-y-1">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Propietario</label>
                        <input type="text" name="vehi_propietario" className="input-std" value={formData.vehi_propietario || ''} onChange={handleChange} />
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Resolución Aparcamiento</label>
                        <input type="text" name="vehi_resolucion" className="input-std" value={formData.vehi_resolucion || ''} onChange={handleChange} />
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Lugar Aparcamiento</label>
                        <input type="text" name="vehi_lugaraparcamiento" className="input-std" value={formData.vehi_lugaraparcamiento || ''} onChange={handleChange} />
                    </div>
                    <div className="md:col-span-2 space-y-1">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">N° Póliza de Seguro</label>
                        <input type="text" name="vehi_poliza" className="input-std" value={formData.vehi_poliza || ''} onChange={handleChange} />
                    </div>
                    <div className="md:col-span-2 space-y-1">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Multas / Observaciones</label>
                        <textarea name="vehi_multas" className="input-std h-20" value={formData.vehi_multas || ''} onChange={handleChange}></textarea>
                    </div>
                </div>
            </div>

            <div className="pt-6 flex gap-3 justify-end border-t border-slate-100 mt-auto flex-shrink-0">
                <button
                    type="button"
                    onClick={onCancel}
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
                    Guardar
                </button>
            </div>
            <style>{`
                .input-std {
                    width: 100%;
                    padding: 0.6rem 1rem;
                    border: 1px solid #e2e8f0;
                    border-radius: 0.75rem;
                    font-size: 0.875rem;
                    line-height: 1.25rem;
                    color: #334155;
                    font-weight: 500;
                    outline: none;
                    transition: all 0.2s;
                }
                .input-std:focus {
                     border-color: #3b82f6;
                     box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
                }
            `}</style>
        </form>
    );
};


const VehicleList = () => {
    const [vehiculoViajes, setVehiculoViajes] = useState(null);
    const [viajes, setViajes] = useState([]);
    const [cargandoViajes, setCargandoViajes] = useState(false);
    const [vehiculos, setVehiculos] = useState([]);
    const [vehiculosFiltrados, setVehiculosFiltrados] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [vehiculoEditando, setVehiculoEditando] = useState(null);
    const [mensajeError, setMensajeError] = useState(null);
    const [terminoBusqueda, setTerminoBusqueda] = useState('');
    const [estadoFiltro, setEstadoFiltro] = useState('ALL');
    const [creando, setCreando] = useState(false);
    const [vehiculoBitacora, setVehiculoBitacora] = useState(null);

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
                (v.vehi_tipo && v.vehi_tipo.toLowerCase().includes(terminoMinuscula))
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

    const manejarGuardado = async (datos) => {
        try {
            if (vehiculoEditando) {
                // Actualizar
                await axios.put(`${API_URL}/vehicles/${datos.vehi_patente}`, datos, { withCredentials: true });
                setVehiculoEditando(null);
            } else {
                // Crear
                await axios.post(`${API_URL}/vehicles`, { ...datos, vehi_capacidad: parseInt(datos.vehi_capacidad) }, { withCredentials: true });
                setCreando(false);
            }
            obtenerVehiculos();
        } catch (error) {
            console.error(error);
            setMensajeError(error.response?.data?.error || 'Error al guardar');
            setTimeout(() => setMensajeError(null), 3000);
        }
    }


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
        <div className="p-4 md:p-8 max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500 relative font-sans">
            {mensajeError && (
                <div className="absolute top-4 right-4 md:right-8 bg-red-100 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2 shadow-lg z-50 animate-bounce max-w-[90%]">
                    <AlertCircle size={18} className="flex-shrink-0" /> <span className="text-sm">{mensajeError}</span>
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

            {/* BARRA DE FILTROS */}
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
                </div>
            </div>

            {/* DESKTOP VIEW: TABLE */}
            <div className="hidden md:block bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[700px]">
                        <thead>
                            <tr className="bg-slate-50/50 text-slate-500 text-xs uppercase tracking-wider border-b border-slate-200">
                                <th className="p-5 font-bold">Vehículo / Marca</th>
                                <th className="p-5 font-bold">Patente / Año</th>
                                <th className="p-5 font-bold">Capacidad</th>
                                <th className="p-5 font-bold">Estado</th>
                                <th className="p-5 font-bold">Inventario</th>
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
                                                <span className={`w-1.5 h-1.5 rounded-full ${v.vehi_estado === 'DISPONIBLE' ? 'bg-emerald-500' : v.vehi_estado === 'EN RUTA' ? 'bg-blue-500' : 'bg-orange-500'}`}></span>
                                                {v.vehi_estado}
                                            </span>
                                        </td>
                                        <td className="p-5 text-xs font-mono text-slate-500">{v.vehi_inventario || '-'}</td>
                                        <td className="p-5 text-right">
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    onClick={() => setVehiculoBitacora(v)}
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
                    <div className="bg-white rounded-3xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
                        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                            <h3 className="font-bold text-slate-800 text-xl">{creando ? 'Nuevo Vehículo' : 'Editar Vehículo'}</h3>
                            <button onClick={() => { setCreando(false); setVehiculoEditando(null); }} className="text-slate-400 hover:text-slate-600 p-2 rounded-full hover:bg-slate-100 transition-colors">
                                <X size={20} />
                            </button>
                        </div>
                        <VehicleForm
                            onSubmit={manejarGuardado}
                            onCancel={() => { setCreando(false); setVehiculoEditando(null); }}
                            inicial={vehiculoEditando}
                            cargando={cargando} // Reusing main loading state or create a specific one if needed
                        />
                    </div>
                </div>
            )}

            <AnimatePresence>
                {vehiculoBitacora && (
                    <VehicleBitacora
                        vehiculo={vehiculoBitacora}
                        onClose={() => setVehiculoBitacora(null)}
                    />
                )}
            </AnimatePresence>
        </div>
    );
};

export default VehicleList;
