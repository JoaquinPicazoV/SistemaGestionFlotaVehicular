import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, Clock, MapPin, User, CheckCircle, Archive, Bus } from 'lucide-react';
import StatusBadge from './StatusBadge';

const RequestDetailModal = ({
    solicitud,
    detalles,
    cargandoDetalles,
    alCerrar,
    titulo = "Detalle de Solicitud",
    accionesPie = null,
    mostrarId = true
}) => {
    if (!solicitud) return null;

    return (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={alCerrar}>
            <div
                className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]"
                onClick={e => e.stopPropagation()}
            >
                <div className="px-8 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/80">
                    <div>
                        <h3 className="font-bold text-slate-800 text-xl">{titulo}</h3>
                        <div className="flex items-center gap-2 mt-1">
                            {mostrarId && <p className="font-mono text-slate-400 text-xs bg-white px-2 py-0.5 rounded border border-slate-200">#{solicitud.sol_id.substring(0, 8)}</p>}
                            <StatusBadge estado={solicitud.sol_estado} />
                        </div>
                    </div>
                    <button onClick={alCerrar} className="text-slate-400 hover:text-slate-600 transition-colors bg-white p-2 rounded-full border border-slate-200 hover:border-slate-300 shadow-sm">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-8 overflow-y-auto custom-scrollbar">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                        <div className="space-y-6">
                            <div>
                                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Solicitante</h4>
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-sm">
                                        {solicitud.sol_nombresolicitante?.charAt(0)}
                                    </div>
                                    <div>
                                        <p className="text-slate-800 font-bold text-sm">{solicitud.sol_nombresolicitante}</p>
                                        <p className="text-slate-500 text-xs">{solicitud.sol_unidad}</p>
                                    </div>
                                </div>
                            </div>
                            <div>
                                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Fecha Salida</h4>
                                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 inline-block w-full">
                                    <div className="flex items-center gap-2 text-slate-700 mb-1">
                                        <Calendar size={16} className="text-blue-500" />
                                        <span className="font-bold">{new Date(solicitud.sol_fechasalida).toLocaleDateString('es-CL')}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-slate-500 text-xs">
                                        <Clock size={14} />
                                        {new Date(solicitud.sol_fechasalida).toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })} hrs
                                    </div>
                                </div>
                            </div>
                            <div>
                                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Fecha Llegada</h4>
                                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 inline-block w-full">
                                    <div className="flex items-center gap-2 text-slate-700 mb-1">
                                        <Calendar size={16} className="text-red-500" />
                                        <span className="font-bold">{new Date(solicitud.sol_fechallegada).toLocaleDateString('es-CL')}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-slate-500 text-xs">
                                        <Clock size={14} />
                                        {new Date(solicitud.sol_fechallegada).toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })} hrs
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div>
                                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Motivo del Viaje</h4>
                                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-slate-600 text-sm font-medium leading-relaxed italic break-words whitespace-pre-wrap">
                                    "{solicitud.sol_motivo}"
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Logística</h4>
                                    <div className="flex flex-col gap-2 items-start">
                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold border ${solicitud.sol_requierechofer ? 'bg-purple-50 text-purple-700 border-purple-100' : 'bg-slate-50 text-slate-600 border-slate-100'}`}>
                                            {solicitud.sol_requierechofer ? 'CON CHOFER' : 'SIN CHOFER'}
                                        </span>
                                        {solicitud.nombre_chofer && (
                                            <div className="flex items-center gap-2 bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-100">
                                                <div className="w-5 h-5 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center text-[10px] font-bold">
                                                    {solicitud.nombre_chofer.charAt(0)}
                                                </div>
                                                <span className="text-xs font-medium text-slate-700">{solicitud.nombre_chofer}</span>
                                            </div>
                                        )}
                                        {solicitud.vehi_patente && (
                                            <div className="flex items-center gap-2 bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-100 mt-1">
                                                <div className="w-5 h-5 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center text-[10px] font-bold">
                                                    <Bus size={10} />
                                                </div>
                                                <div className="flex flex-col leading-none">
                                                    <span className="text-xs font-medium text-slate-700">{solicitud.vehi_marca} {solicitud.vehi_modelo}</span>
                                                    <span className="text-[10px] text-slate-400 font-mono tracking-wider">{solicitud.vehi_patente}</span>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                {detalles?.pasajeros && (
                                    <div>
                                        <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Solicitante</h4>
                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold border ${detalles.pasajeros.some(p => p.pas_nombre.trim().toLowerCase() === solicitud.sol_nombresolicitante.trim().toLowerCase()) ? 'bg-blue-50 text-blue-700 border-blue-100' : 'bg-slate-50 text-slate-600 border-slate-100'}`}>
                                            {detalles.pasajeros.some(p => p.pas_nombre.trim().toLowerCase() === solicitud.sol_nombresolicitante.trim().toLowerCase()) ? 'VIAJA' : 'NO VIAJA'}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                            <div className="bg-slate-50 px-4 py-2 border-b border-slate-100">
                                <h4 className="text-xs font-bold text-slate-600 flex items-center gap-2">
                                    <MapPin size={14} className="text-slate-400" /> Destinos e Itinerario
                                </h4>
                            </div>
                            <div className="p-4">
                                {cargandoDetalles ? <p className="text-xs text-slate-400">Cargando destinos...</p> : (
                                    <div className="space-y-3">
                                        {detalles?.destinos?.length > 0 ? (
                                            <div className="flex flex-wrap gap-2 mb-3">
                                                {detalles.destinos.map((d, i) => (
                                                    <span key={i} className="inline-flex items-center gap-1 px-2.5 py-1 bg-red-50 text-red-700 border border-red-100 rounded-lg text-xs font-semibold">
                                                        <MapPin size={12} /> {d.lug_nombre}, {d.com_nombre}
                                                    </span>
                                                ))}
                                            </div>
                                        ) : <p className="text-sm text-slate-400 italic">Sin destinos.</p>}

                                        {solicitud.sol_itinerario && (
                                            <div className="text-sm text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100">
                                                <span className="text-xs font-bold text-slate-400 block mb-1 uppercase">Ruta Detallada</span>
                                                {solicitud.sol_itinerario}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                            <div className="bg-slate-50 px-4 py-2 border-b border-slate-100">
                                <h4 className="text-xs font-bold text-slate-600 flex items-center gap-2">
                                    <User size={14} className="text-slate-400" /> Ocupantes ({detalles?.pasajeros?.length || 0})
                                </h4>
                            </div>
                            <div className="p-4 bg-slate-50/50">
                                {cargandoDetalles ? <p className="text-xs text-slate-400">Cargando pasajeros...</p> : (
                                    <div className="flex flex-wrap gap-2">
                                        {detalles?.pasajeros?.length > 0 ? detalles.pasajeros.map((p, i) => {
                                            const estilos = {
                                                1: { bg: 'bg-indigo-50', border: 'border-indigo-100', text: 'text-indigo-700', dot: 'bg-indigo-400' }, // Funcionario
                                                2: { bg: 'bg-orange-50', border: 'border-orange-100', text: 'text-orange-700', dot: 'bg-orange-400' }, // Alumno
                                                3: { bg: 'bg-emerald-50', border: 'border-emerald-100', text: 'text-emerald-700', dot: 'bg-emerald-400' }, // Docente
                                                4: { bg: 'bg-slate-50', border: 'border-slate-100', text: 'text-slate-700', dot: 'bg-slate-400' }   // Otro
                                            };
                                            const estilo = estilos[p.pas_idtipofk] || estilos[4];

                                            return (
                                                <div key={i} className={`px-3 py-1.5 rounded-lg border text-xs font-medium flex items-center gap-2 ${estilo.bg} ${estilo.border} ${estilo.text}`}>
                                                    <span className={`w-2 h-2 rounded-full ${estilo.dot}`}></span>
                                                    <div className="flex flex-col leading-tight">
                                                        <span className="font-bold">{p.pas_nombre}</span>
                                                        <span className="text-[10px] opacity-75 uppercase">{p.tip_nombre}</span>
                                                    </div>
                                                </div>
                                            );
                                        }) : <span className="text-sm text-slate-400 italic">Sin pasajeros registrados.</span>}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {solicitud.sol_estado === 'RECHAZADA' && solicitud.sol_observacionrechazo && (
                        <div className="mt-8 bg-red-50 p-4 rounded-2xl border border-red-100">
                            <h4 className="text-[10px] font-bold text-red-700 uppercase tracking-widest mb-2">Motivo de Rechazo</h4>
                            <p className="text-red-600 text-sm font-medium leading-relaxed break-words whitespace-pre-wrap">
                                "{solicitud.sol_observacionrechazo}"
                            </p>
                        </div>
                    )}

                    {accionesPie && (
                        <div className="mt-8 flex flex-col sm:flex-row gap-4 border-t border-slate-100 pt-6">
                            {accionesPie}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default RequestDetailModal;
