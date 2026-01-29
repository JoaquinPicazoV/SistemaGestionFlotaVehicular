import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import API_URL from '../../../config/api';
import { RefreshCw, Clock, CheckCircle, XCircle, X, Plus } from 'lucide-react';

import FiltrosSolicitud from '../../common/RequestFilters';
import TarjetaSolicitud from '../../common/RequestCard';
import ModalDetalleSolicitud from '../../common/RequestDetailModal';
import FormularioExpressAdmin from '../AdminExpressForm';

const SolicitudesPendientes = () => {
    const [solicitudes, setSolicitudes] = useState([]);
    const [solicitudesFiltradas, setSolicitudesFiltradas] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [solicitudSeleccionada, setSolicitudSeleccionada] = useState(null);
    const [detallesSolicitud, setDetallesSolicitud] = useState({ pasajeros: [], destinos: [] });
    const [cargandoDetalles, setCargandoDetalles] = useState(false);
    const [mostrarFormularioExpress, setMostrarFormularioExpress] = useState(false);

    const [modalAccion, setModalAccion] = useState(null);
    const [vehiculos, setVehiculos] = useState([]);
    const [choferes, setChoferes] = useState([]);
    const [asignacion, setAsignacion] = useState({ vehi_patente: '', cho_correo: '' });

    const [motivoRechazo, setMotivoRechazo] = useState('');
    const [procesando, setProcesando] = useState(false);


    const [mensajeExito, setMensajeExito] = useState('');
    const [mensajeError, setMensajeError] = useState('');
    const [modalError, setModalError] = useState('');

    const [terminoBusqueda, setTerminoBusqueda] = useState('');
    const [mesFiltro, setMesFiltro] = useState('');
    const [fechaInicio, setFechaInicio] = useState('');
    const [fechaFin, setFechaFin] = useState('');



    const obtenerSolicitudes = useCallback(async (enSegundoPlano = false) => {
        if (!enSegundoPlano) setCargando(true);
        try {
            const respuesta = await axios.get(`${API_URL}/requests/pending`, { withCredentials: true });
            setSolicitudes(respuesta.data);
            setSolicitudesFiltradas(respuesta.data);
        } catch (error) {
            console.error("Error cargando solicitudes:", error);
        } finally {
            if (!enSegundoPlano) setCargando(false);
        }
    }, []);

    useEffect(() => {
        obtenerSolicitudes();
        const intervalo = setInterval(() => obtenerSolicitudes(true), 15000);
        return () => clearInterval(intervalo);
    }, [obtenerSolicitudes]);

    useEffect(() => {
        let resultado = [...solicitudes];


        if (terminoBusqueda) {
            const terminoMinuscula = terminoBusqueda.toLowerCase();
            resultado = resultado.filter(req =>
                req.sol_unidad.toLowerCase().includes(terminoMinuscula) ||
                req.sol_nombresolicitante.toLowerCase().includes(terminoMinuscula) ||
                req.sol_motivo.toLowerCase().includes(terminoMinuscula)
            );
        }


        if (fechaInicio && fechaFin) {
            const inicio = new Date(fechaInicio);
            const fin = new Date(fechaFin);
            fin.setHours(23, 59, 59, 999);

            resultado = resultado.filter(req => {
                const fechaSalida = new Date(req.sol_fechasalida);
                return fechaSalida >= inicio && fechaSalida <= fin;
            });
        } else if (mesFiltro) {
            resultado = resultado.filter(req => {
                const fecha = new Date(req.sol_fechasalida);
                const mesStr = `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}`;
                return mesStr === mesFiltro;
            });
        }

        setSolicitudesFiltradas(resultado);
    }, [solicitudes, terminoBusqueda, mesFiltro, fechaInicio, fechaFin]);

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

    const abrirModalAprobar = async () => {
        setProcesando(true);
        setModalError('');
        try {
            const [resVehiculos, resChoferes] = await Promise.all([
                axios.get(`${API_URL}/vehicles`, { withCredentials: true }),
                axios.get(`${API_URL}/drivers`, { withCredentials: true })
            ]);

            setVehiculos(resVehiculos.data.filter(v => v.vehi_estado === 'DISPONIBLE' && parseInt(v.vehi_capacidad) >= (detallesSolicitud.pasajeros.length + 1)));
            setChoferes(resChoferes.data.filter(d => d.cho_activo === 1));
            setModalAccion('APROBAR');
        } catch (error) {
            console.error("Error obteniendo recursos:", error);
            setMensajeError("Error cargando vehículos y conductores. Por favor intenta nuevamente.");
            setModalAccion(null);
        } finally {
            setProcesando(false);
        }
    };

    const procesarSolicitud = async () => {
        if (!solicitudSeleccionada) return;
        setProcesando(true);
        setModalError('');
        try {
            if (modalAccion === 'APROBAR') {
                if (!asignacion.vehi_patente) { setModalError("Selecciona un vehículo"); setProcesando(false); return; }
                if (solicitudSeleccionada.sol_requierechofer && !asignacion.cho_correo) { setModalError("Selecciona un conductor"); setProcesando(false); return; }

                await axios.put(`${API_URL}/requests/${solicitudSeleccionada.sol_id}/approve`, {
                    sol_patentevehiculofk: asignacion.vehi_patente,
                    sol_correochoferfk: solicitudSeleccionada.sol_requierechofer ? asignacion.cho_correo : null
                }, { withCredentials: true });
            } else {
                if (!motivoRechazo.trim()) { setModalError("Ingresa un motivo de rechazo"); setProcesando(false); return; }
                await axios.put(`${API_URL}/requests/${solicitudSeleccionada.sol_id}/reject`, {
                    sol_observacionrechazo: motivoRechazo
                }, { withCredentials: true });
            }


            setModalAccion(null);
            setSolicitudSeleccionada(null);
            setAsignacion({ vehi_patente: '', cho_correo: '' });
            setMotivoRechazo('');
            setMensajeExito(modalAccion === 'APROBAR' ? "Solicitud aprobada correctamente." : "Solicitud rechazada correctamente.");
            setTimeout(() => setMensajeExito(''), 3000);
            obtenerSolicitudes();
        } catch (error) {
            console.error("Error procesando solicitud:", error);


            if (error.response?.data?.error) {
                setModalError(error.response.data.error);
            } else if (error.message) {
                setModalError(`Error: ${error.message}`);
            } else {
                setModalError("Error desconocido al procesar la solicitud.");
            }
        } finally {
            setProcesando(false);
        }
    };

    const limpiarFiltros = () => {
        setTerminoBusqueda('');
        setMesFiltro('');
        setFechaInicio('');
        setFechaFin('');
    };

    if (mostrarFormularioExpress) {
        return (
            <FormularioExpressAdmin
                alCancelar={() => setMostrarFormularioExpress(false)}
                alCompletar={() => {
                    setMostrarFormularioExpress(false);
                    obtenerSolicitudes();
                }}
            />
        );
    }

    if (cargando) return (
        <div className="p-12 text-center text-slate-500 flex flex-col items-center">
            <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mb-4"></div>
            Cargando solicitudes pendientes...
        </div>
    );

    return (
        <div className="p-4 md:p-8 max-w-7xl mx-auto relative font-sans">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Solicitudes Pendientes</h2>
                    <p className="text-slate-500 text-sm mt-1">Revisión y gestión de requerimientos de transporte.</p>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setMostrarFormularioExpress(true)}
                        className="pl-2 pr-4 py-2 bg-white border border-slate-200 hover:border-emerald-200 hover:bg-emerald-50/50 text-slate-700 rounded-full shadow-sm hover:shadow-md text-sm font-bold flex items-center gap-2 transition-all transform active:scale-95 group"
                    >
                        <div className="bg-emerald-100 text-emerald-600 p-1 rounded-full group-hover:scale-110 transition-transform">
                            <Plus size={16} strokeWidth={3} />
                        </div>
                        <span className="group-hover:text-emerald-700 transition-colors">Nueva Solicitud Express</span>
                    </button>
                    <div className="h-8 w-[1px] bg-slate-200 mx-2"></div>
                    <button onClick={obtenerSolicitudes} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Actualizar">
                        <RefreshCw size={18} />
                    </button>
                    <div className="bg-amber-100 text-amber-700 px-4 py-1.5 rounded-full text-sm font-bold border border-amber-200 shadow-sm flex items-center gap-2">
                        <Clock size={14} /> {solicitudesFiltradas.length} Pendientes
                    </div>
                </div>
            </div>

            <FiltrosSolicitud
                terminoBusqueda={terminoBusqueda}
                setTerminoBusqueda={setTerminoBusqueda}
                mesFiltro={mesFiltro}
                setMesFiltro={setMesFiltro}
                fechaInicio={fechaInicio}
                setFechaInicio={setFechaInicio}
                fechaFin={fechaFin}
                setFechaFin={setFechaFin}
                alLimpiar={limpiarFiltros}
            />


            {(mensajeError || mensajeExito) && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm">
                    {mensajeError && (
                        <div className="bg-white border-l-4 border-red-500 p-6 rounded-2xl shadow-2xl max-w-md w-full flex flex-col items-center text-center gap-4">
                            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center text-red-500 mb-2">
                                <XCircle size={32} />
                            </div>
                            <h3 className="text-xl font-bold text-slate-800">¡Atención!</h3>
                            <p className="text-slate-600 font-medium">{mensajeError}</p>
                            <button type="button" onClick={() => setMensajeError('')} className="mt-2 text-sm text-slate-400 font-bold hover:text-slate-600 uppercase tracking-wide">Cerrar</button>
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

            <div className="grid gap-4">
                {solicitudesFiltradas.length > 0 ? (
                    solicitudesFiltradas.map((req) => (
                        <TarjetaSolicitud
                            key={req.sol_id}
                            solicitud={req}
                            alAccionar={verDetalles}
                            etiquetaAccion="Revisar"
                            variante="pendiente"
                            mostrarId={false}
                        />
                    ))
                ) : (
                    <div className="text-center py-20 bg-white rounded-2xl border border-slate-200 border-dashed animate-in fade-in zoom-in-95">
                        <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
                            <CheckCircle size={40} />
                        </div>
                        <h3 className="text-xl font-bold text-slate-800 mb-1">Todo al día</h3>
                        <p className="text-slate-500 max-w-sm mx-auto mb-6">
                            No se encontraron solicitudes pendientes con los filtros actuales.
                        </p>
                        {(terminoBusqueda || mesFiltro) && (
                            <button onClick={limpiarFiltros} className="px-6 py-2 bg-white border border-slate-200 shadow-sm text-slate-600 rounded-lg hover:bg-slate-50 font-medium text-sm transition-colors">
                                Limpiar Filtros
                            </button>
                        )}
                    </div>
                )}
            </div>

            <ModalDetalleSolicitud
                solicitud={solicitudSeleccionada}
                detalles={detallesSolicitud}
                cargandoDetalles={cargandoDetalles}
                alCerrar={() => setSolicitudSeleccionada(null)}
                titulo="Revisar Solicitud"
                mostrarId={false}
                accionesPie={
                    <>
                        <button
                            onClick={abrirModalAprobar}
                            className="flex-1 bg-emerald-600 text-white py-3.5 rounded-xl font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 transform active:scale-[0.98]"
                            disabled={procesando}
                        >
                            <CheckCircle size={20} /> Aprobar Solicitud
                        </button>
                        <button
                            onClick={() => { setModalAccion('RECHAZAR'); setModalError(''); }}
                            className="flex-1 bg-white text-slate-700 border-2 border-slate-200 py-3.5 rounded-xl font-bold hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all flex items-center justify-center gap-2 transform active:scale-[0.98]"
                            disabled={procesando}
                        >
                            <XCircle size={20} /> Rechazar
                        </button>
                    </>
                }
            />

            {modalAccion && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
                        <div className={`p-4 border-b flex justify-between items-center ${modalAccion === 'APROBAR' ? 'bg-emerald-50 border-emerald-100' : 'bg-red-50 border-red-100'}`}>
                            <h3 className={`font-bold text-lg ${modalAccion === 'APROBAR' ? 'text-emerald-800' : 'text-red-800'}`}>
                                {modalAccion === 'APROBAR' ? 'Aprobar & Asignar' : 'Rechazar Solicitud'}
                            </h3>
                            <button onClick={() => setModalAccion(null)} className="p-1 rounded-full hover:bg-white/50 transition-colors">
                                <X size={20} className={modalAccion === 'APROBAR' ? 'text-emerald-600' : 'text-red-600'} />
                            </button>
                        </div>

                        <div className="p-6 space-y-4">
                            {modalError && (
                                <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm font-bold border border-red-100 flex items-center gap-2">
                                    <XCircle size={16} /> {modalError}
                                </div>
                            )}

                            {modalAccion === 'APROBAR' ? (
                                <>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-500 uppercase">Asignar Vehículo</label>
                                        <select
                                            className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
                                            value={asignacion.vehi_patente}
                                            onChange={e => setAsignacion({ ...asignacion, vehi_patente: e.target.value })}
                                        >
                                            <option value="">-- Seleccionar Vehículo --</option>
                                            {vehiculos.map(v => (
                                                <option key={v.vehi_patente} value={v.vehi_patente}>
                                                    {v.vehi_marca} {v.vehi_modelo} ({v.vehi_patente}) - {v.vehi_capacidad} PAX
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    {solicitudSeleccionada.sol_requierechofer && (
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-slate-500 uppercase">Asignar Conductor</label>
                                            <select
                                                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
                                                value={asignacion.cho_correo}
                                                onChange={e => setAsignacion({ ...asignacion, cho_correo: e.target.value })}
                                            >
                                                <option value="">-- Seleccionar Conductor --</option>
                                                {choferes.map(d => (
                                                    <option key={d.cho_correoinstitucional} value={d.cho_correoinstitucional}>
                                                        {d.cho_nombre}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    )}
                                    {!solicitudSeleccionada.sol_requierechofer && (
                                        <div className="p-3 bg-blue-50 text-blue-700 text-xs rounded-lg border border-blue-100">
                                            * Esta solicitud no requiere conductor (autonoma).
                                        </div>
                                    )}
                                </>
                            ) : (
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase">Motivo del Rechazo</label>
                                    <textarea
                                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none h-32 resize-none"
                                        placeholder="Indique la razón del rechazo..."
                                        value={motivoRechazo}
                                        onChange={e => {
                                            const val = e.target.value;
                                            if (val.startsWith(' ')) return;
                                            if (/^[a-zA-Z0-9\s.,;:\-/"'?!¡¿@#&()ºáéíóúÁÉÍÓÚñÑüÜ]*$/.test(val)) {
                                                setMotivoRechazo(val);
                                            }
                                        }}
                                    ></textarea>
                                </div>
                            )}

                            <button
                                onClick={procesarSolicitud}
                                disabled={procesando}
                                className={`w-full py-3 rounded-xl font-bold text-white shadow-lg transition-all ${modalAccion === 'APROBAR'
                                    ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/20'
                                    : 'bg-red-600 hover:bg-red-700 shadow-red-500/20'
                                    }`}
                            >
                                {procesando ? 'Procesando...' : (modalAccion === 'APROBAR' ? 'Confirmar Aprobación' : 'Confirmar Rechazo')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SolicitudesPendientes;
