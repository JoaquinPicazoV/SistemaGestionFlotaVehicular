import React, { useState, useEffect } from 'react';
import axios from 'axios';
import API_URL from '../../config/api';
import { X, Plus, Pencil, Trash2, Save, FileText, Wrench, Search, Eye, Calendar, User, DollarSign, Activity, MapPin } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const VehicleBitacora = ({ vehiculo, onClose }) => {
    const [registros, setRegistros] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [modoEdicion, setModoEdicion] = useState(false);
    const [registroEditando, setRegistroEditando] = useState(null);
    const [busqueda, setBusqueda] = useState('');
    const [verDetalle, setVerDetalle] = useState(null);

    // Estado para el formulario (nuevo o edición)
    const [formData, setFormData] = useState({
        bit_fecha: new Date().toISOString().slice(0, 16),
        bit_funcionario_responsable: '',
        bit_kilometraje: '',
        bit_evento: '',
        bit_mecanico: '',
        bit_valor_mantencion: 0,
        bit_observaciones: ''
    });

    useEffect(() => {
        cargarBitacora();
    }, [vehiculo]);

    const cargarBitacora = async () => {
        setCargando(true);
        try {
            const res = await axios.get(`${API_URL}/vehicles/${vehiculo.vehi_patente}/bitacora`, { withCredentials: true });
            setRegistros(res.data);
        } catch (error) {
            console.error(error);
        } finally {
            setCargando(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;

        // Validaciones estrictas por campo
        if (['bit_evento', 'bit_mecanico'].includes(name)) {
            if (value.startsWith(' ')) return;
            // Solo letras, números y espacios (SIN símbolos), permite tildes y puntuación básica
            if (/^[a-zA-Z0-9\sáéíóúÁÉÍÓÚñÑüÜ.,;:\-/"'?!¡¿@#&()º]*$/.test(value)) {
                setFormData(prev => ({ ...prev, [name]: value }));
            }
            return;
        }

        if (name === 'bit_observaciones') {
            if (value.startsWith(' ')) return;
            // Letras, números y puntuación común, permite tildes
            if (/^[a-zA-Z0-9\s.,;:\-/"'?!¡¿@#&()ºáéíóúÁÉÍÓÚñÑüÜ]*$/.test(value)) {
                setFormData(prev => ({ ...prev, [name]: value }));
            }
            return;
        }

        if (name === 'bit_funcionario_responsable') {
            if (value.startsWith(' ')) return;
            // Solo letras (mayusc/minusc) y tildes. SIN números ni símbolos.
            if (/^[a-zA-Z\sáéíóúÁÉÍÓÚñÑüÜ]*$/.test(value)) {
                setFormData(prev => ({ ...prev, [name]: value }));
            }
            return;
        }

        if (name === 'bit_kilometraje' || name === 'bit_valor_mantencion') {
            // Solo números puros
            if (/^[0-9]*$/.test(value)) {
                setFormData(prev => ({ ...prev, [name]: value }));
            }
            return;
        }

        // Fecha y otros
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const iniciarEdicion = (registro) => {
        setRegistroEditando(registro);
        setFormData({
            ...registro,
            bit_fecha: new Date(registro.bit_fecha).toISOString().slice(0, 16),
            // Limpieza preventiva de datos antiguos
            bit_evento: registro.bit_evento,
            bit_mecanico: registro.bit_mecanico || '',
            bit_funcionario_responsable: registro.bit_funcionario_responsable,
            bit_kilometraje: registro.bit_kilometraje.toString(),
            bit_valor_mantencion: registro.bit_valor_mantencion.toString(),
            bit_observaciones: registro.bit_observaciones || ''
        });
        setModoEdicion(true);
    };

    const cancelarEdicion = () => {
        setModoEdicion(false);
        setRegistroEditando(null);
        setFormData({
            bit_fecha: new Date().toISOString().slice(0, 16),
            bit_funcionario_responsable: '',
            bit_kilometraje: '',
            bit_evento: '',
            bit_mecanico: '',
            bit_valor_mantencion: 0,
            bit_observaciones: ''
        });
    };

    const guardarRegistro = async (e) => {
        e.preventDefault();
        try {
            if (registroEditando) {
                await axios.put(`${API_URL}/vehicles/bitacora/${registroEditando.bit_id}`, formData, { withCredentials: true });
            } else {
                await axios.post(`${API_URL}/vehicles/${vehiculo.vehi_patente}/bitacora`, formData, { withCredentials: true });
            }
            cargarBitacora();
            cancelarEdicion();
        } catch (error) {
            console.error("Error guardando bitácora:", error);
            alert("Error al guardar el registro");
        }
    };

    const eliminarRegistro = async (id) => {
        if (!window.confirm("¿Segura/o que deseas eliminar este registro histórico?")) return;
        try {
            await axios.delete(`${API_URL}/vehicles/bitacora/${id}`, { withCredentials: true });
            cargarBitacora();
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4"
        >
            <motion.div
                initial={{ scale: 0.95, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.95, opacity: 0, y: 20 }}
                className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl overflow-hidden max-h-[90vh] flex flex-col"
            >
                {/* Header */}
                <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-blue-100 text-blue-600 rounded-xl">
                            <FileText size={24} />
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-800 text-xl">Bitácora de Eventos</h3>
                            <p className="text-sm text-slate-500 font-medium">
                                Historial de mantenimiento - <span className="text-blue-600 font-bold">{vehiculo.vehi_modelo} ({vehiculo.vehi_patente})</span>
                            </p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-2 rounded-full hover:bg-slate-100 transition-colors">
                        <X size={24} />
                    </button>
                </div>

                <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">

                    {/* Panel Izquierdo: Formulario */}
                    <div className="w-full lg:w-1/3 bg-slate-50/50 border-r border-slate-100 p-6 overflow-y-auto">
                        <h4 className="text-sm font-bold text-slate-700 uppercase tracking-wide mb-4 flex items-center gap-2">
                            {modoEdicion ? <span className="text-orange-500 flex items-center gap-2"><Pencil size={14} /> Editando Registro</span> : <span className="text-emerald-600 flex items-center gap-2"><Plus size={14} /> Nuevo Evento</span>}
                        </h4>

                        <form onSubmit={guardarRegistro} className="space-y-4">
                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Fecha del Evento</label>
                                <input type="datetime-local" name="bit_fecha" className="input-field" value={formData.bit_fecha} onChange={handleInputChange} required />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Evento / Tipo</label>
                                <input type="text" name="bit_evento" className="input-field" placeholder="Ej: Cambio de Aceite, Choque, Revisión..." value={formData.bit_evento} onChange={handleInputChange} required />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Kilometraje Actual</label>
                                <input type="text" inputMode="numeric" name="bit_kilometraje" className="input-field" placeholder="10500" value={formData.bit_kilometraje} onChange={handleInputChange} required />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Funcionario Responsable</label>
                                <input type="text" name="bit_funcionario_responsable" className="input-field" placeholder="Nombre funcionario..." value={formData.bit_funcionario_responsable} onChange={handleInputChange} required />
                            </div>

                            <div className="pt-2 border-t border-slate-200">
                                <label className="text-xs font-bold text-slate-400 uppercase block mb-2">Datos de Mantención</label>
                                <div className="space-y-3">
                                    <div>
                                        <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Mecánico</label>
                                        <input type="text" name="bit_mecanico" className="input-field" placeholder="Mecánico / Taller" value={formData.bit_mecanico || ''} onChange={handleInputChange} required />
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Costo Mantención</label>
                                        <div className="relative">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">$</span>
                                            <input type="text" inputMode="numeric" name="bit_valor_mantencion" className="input-field !pl-12" placeholder="0" value={formData.bit_valor_mantencion} onChange={handleInputChange} required />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Observaciones</label>
                                <textarea name="bit_observaciones" className="input-field h-20 resize-none" placeholder="Detalles adicionales..." value={formData.bit_observaciones || ''} onChange={handleInputChange} required></textarea>
                            </div>

                            <div className="flex gap-2 pt-2">
                                {modoEdicion && (
                                    <button type="button" onClick={cancelarEdicion} className="flex-1 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl font-bold text-sm">
                                        Cancelar
                                    </button>
                                )}
                                <button type="submit" className="flex-1 py-2.5 bg-slate-900 hover:bg-black text-white rounded-xl font-bold text-sm shadow-lg shadow-slate-900/10 flex items-center justify-center gap-2">
                                    <Save size={16} /> {modoEdicion ? 'Actualizar' : 'Guardar'}
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Panel Derecho: Lista */}
                    <div className="w-full lg:w-2/3 bg-white p-0 flex flex-col h-full">
                        <div className="p-4 bg-slate-50/30 border-b border-slate-100 flex flex-col sm:flex-row gap-4 justify-between items-center">
                            <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wide">Historial Registrado</h4>
                            <div className="relative w-full sm:w-64">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                <input
                                    type="text"
                                    placeholder="Buscar en bitácora..."
                                    className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all"
                                    value={busqueda}
                                    onChange={(e) => setBusqueda(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar space-y-3">
                            {cargando ? (
                                <div className="text-center py-10 text-slate-400">Cargando bitácora...</div>
                            ) : registros.length === 0 ? (
                                <div className="text-center py-20 flex flex-col items-center">
                                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4 text-slate-300">
                                        <FileText size={24} />
                                    </div>
                                    <p className="text-slate-500 font-medium">No hay registros en la bitácora.</p>
                                    <p className="text-xs text-slate-400">Usa el formulario para agregar el primer evento.</p>
                                </div>
                            ) : (
                                registros
                                    .filter(reg =>
                                        reg.bit_evento.toLowerCase().includes(busqueda.toLowerCase()) ||
                                        reg.bit_funcionario_responsable.toLowerCase().includes(busqueda.toLowerCase()) ||
                                        (reg.bit_mecanico || '').toLowerCase().includes(busqueda.toLowerCase()) ||
                                        (reg.bit_observaciones || '').toLowerCase().includes(busqueda.toLowerCase())
                                    )
                                    .map((reg) => (
                                        <div key={reg.bit_id} className="group flex flex-col sm:flex-row gap-4 p-4 rounded-xl border border-slate-100 hover:border-slate-300 hover:shadow-md transition-all bg-white relative">
                                            <div className="flex-shrink-0 flex flex-col items-center justify-center w-16 bg-slate-50 rounded-lg border border-slate-100 py-2">
                                                <span className="text-xs font-bold text-slate-400 uppercase">{new Date(reg.bit_fecha).toLocaleString('es-CL', { month: 'short' })}</span>
                                                <span className="text-xl font-black text-slate-800">{new Date(reg.bit_fecha).getDate()}</span>
                                                <span className="text-[10px] text-slate-400">{new Date(reg.bit_fecha).getFullYear()}</span>
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                <div className="flex justify-between items-start">
                                                    <h5 className="font-bold text-slate-800 text-lg flex items-center gap-2">
                                                        {reg.bit_evento}
                                                        {reg.bit_valor_mantencion > 0 && (
                                                            <span className="text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded border border-green-200 font-mono">
                                                                ${reg.bit_valor_mantencion.toLocaleString('es-CL')}
                                                            </span>
                                                        )}
                                                    </h5>
                                                    <div className="flex gap-1">
                                                        <button onClick={() => setVerDetalle(reg)} className="p-1.5 text-slate-500 hover:bg-slate-100 rounded-lg" title="Ver detalle"><Eye size={16} /></button>
                                                        <button onClick={() => iniciarEdicion(reg)} className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg" title="Editar"><Pencil size={16} /></button>
                                                        <button onClick={() => eliminarRegistro(reg.bit_id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg" title="Eliminar"><Trash2 size={16} /></button>
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-2 gap-x-4 gap-y-1 mt-2 text-sm text-slate-600">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-xs font-bold text-slate-400 uppercase w-24">Responsable:</span>
                                                        <span className="truncate font-medium">{reg.bit_funcionario_responsable}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-xs font-bold text-slate-400 uppercase w-16">Km:</span>
                                                        <span className="font-mono text-slate-800 bg-slate-100 px-1.5 rounded text-xs">{reg.bit_kilometraje.toLocaleString()} km</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                            )}
                        </div>
                    </div>
                </div>

                <style>{`
                    .input-field {
                        width: 100%;
                        padding: 0.5rem 0.75rem;
                        background-color: #fff;
                        border: 1px solid #e2e8f0;
                        border-radius: 0.5rem;
                        font-size: 0.875rem;
                        color: #1e293b;
                        outline: none;
                        transition: all 0.2s;
                    }
                    .input-field:focus {
                        border-color: #3b82f6;
                        box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
                    }
                `}</style>
            </motion.div>

            {/* Modal de Detalle */}
            <AnimatePresence>
                {verDetalle && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm"
                        onClick={() => setVerDetalle(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                                <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
                                    <FileText size={20} className="text-blue-500" />
                                    Detalle del Evento
                                </h3>
                                <button onClick={() => setVerDetalle(null)} className="text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-200 transition-colors">
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="p-6 space-y-6">
                                <div className="text-center mb-6">
                                    <div className="inline-block px-4 py-1.5 bg-blue-50 text-blue-700 rounded-full text-sm font-bold border border-blue-100 mb-2">
                                        {verDetalle.bit_evento}
                                    </div>
                                    <p className="text-slate-400 text-sm font-medium">
                                        {new Date(verDetalle.bit_fecha).toLocaleDateString('es-CL', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                                        <div className="flex items-center gap-2 mb-1 text-slate-400 text-xs font-bold uppercase">
                                            <User size={14} /> Responsable
                                        </div>
                                        <p className="font-semibold text-slate-700">{verDetalle.bit_funcionario_responsable}</p>
                                    </div>
                                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                                        <div className="flex items-center gap-2 mb-1 text-slate-400 text-xs font-bold uppercase">
                                            <Activity size={14} /> Kilometraje
                                        </div>
                                        <p className="font-mono font-semibold text-slate-700">{verDetalle.bit_kilometraje.toLocaleString()} km</p>
                                    </div>
                                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                                        <div className="flex items-center gap-2 mb-1 text-slate-400 text-xs font-bold uppercase">
                                            <Wrench size={14} /> Mecánico / Taller
                                        </div>
                                        <p className="font-semibold text-slate-700">{verDetalle.bit_mecanico || '-'}</p>
                                    </div>
                                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                                        <div className="flex items-center gap-2 mb-1 text-slate-400 text-xs font-bold uppercase">
                                            <DollarSign size={14} /> Costo Mantención
                                        </div>
                                        <p className="font-mono font-bold text-green-600">${verDetalle.bit_valor_mantencion.toLocaleString('es-CL')}</p>
                                    </div>
                                </div>

                                {verDetalle.bit_observaciones && (
                                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                                        <div className="flex items-center gap-2 mb-2 text-slate-400 text-xs font-bold uppercase">
                                            <FileText size={14} /> Observaciones
                                        </div>
                                        <p className="text-slate-600 text-sm leading-relaxed italic">"{verDetalle.bit_observaciones}"</p>
                                    </div>
                                )}
                            </div>

                            <div className="p-4 bg-slate-50 border-t border-slate-100 text-right">
                                <button
                                    onClick={() => setVerDetalle(null)}
                                    className="px-6 py-2 bg-white border border-slate-200 text-slate-700 font-bold rounded-xl text-sm hover:bg-slate-50 transition-colors"
                                >
                                    Cerrar
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default VehicleBitacora;
