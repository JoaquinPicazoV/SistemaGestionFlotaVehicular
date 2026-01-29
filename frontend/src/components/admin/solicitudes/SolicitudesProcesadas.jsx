import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import API_URL from '../../../config/api';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { RefreshCw, Filter, AlertCircle, CheckCircle, XCircle, Download } from 'lucide-react';
import FiltrosSolicitud from '../../common/RequestFilters';
import TarjetaSolicitud from '../../common/RequestCard';
import ModalDetalleSolicitud from '../../common/RequestDetailModal';

const SolicitudesProcesadas = () => {

    const [solicitudes, setSolicitudes] = useState([]);
    const [solicitudesFiltradas, setSolicitudesFiltradas] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [solicitudSeleccionada, setSolicitudSeleccionada] = useState(null);
    const [detallesSolicitud, setDetallesSolicitud] = useState({ pasajeros: [], destinos: [] });
    const [cargandoDetalles, setCargandoDetalles] = useState(false);
    const [mensajeExito, setMensajeExito] = useState('');
    const [mensajeError, setMensajeError] = useState('');
    const [terminoBusqueda, setTerminoBusqueda] = useState('');


    const [mesFiltro, setMesFiltro] = useState('');
    const [fechaInicio, setFechaInicio] = useState('');
    const [fechaFin, setFechaFin] = useState('');
    const [estadoFiltro, setEstadoFiltro] = useState('ALL');


    const [ordenarPor, setOrdenarPor] = useState('CRONOLOGICO');
    const [direccionOrden, setDireccionOrden] = useState('DESC');

    const obtenerSolicitudes = useCallback(async (enSegundoPlano = false) => {
        if (!enSegundoPlano) setCargando(true);
        try {
            const respuesta = await axios.get(`${API_URL}/requests/processed`, { withCredentials: true });
            setSolicitudes(respuesta.data);
            setSolicitudesFiltradas(respuesta.data);
        } catch (error) {
            console.error("Error cargando solicitudes procesadas:", error);
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
                (req.sol_unidad || '').toLowerCase().includes(terminoMinuscula) ||
                (req.sol_nombresolicitante || '').toLowerCase().includes(terminoMinuscula) ||
                (req.sol_motivo || '').toLowerCase().includes(terminoMinuscula)
            );
        }

        if (estadoFiltro !== 'ALL') {
            resultado = resultado.filter(req => req.sol_estado === estadoFiltro);
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

        resultado.sort((a, b) => {
            let valorA, valorB;

            if (ordenarPor === 'LLEGADA') {
                valorA = a.sol_id;
                valorB = b.sol_id;
            } else {
                valorA = new Date(a.sol_fechasalida).getTime();
                valorB = new Date(b.sol_fechasalida).getTime();
            }

            if (valorA < valorB) return direccionOrden === 'ASC' ? -1 : 1;
            if (valorA > valorB) return direccionOrden === 'ASC' ? 1 : -1;
            return 0;
        });

        setSolicitudesFiltradas(resultado);
    }, [solicitudes, terminoBusqueda, mesFiltro, fechaInicio, fechaFin, estadoFiltro, ordenarPor, direccionOrden]);

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

    const cancelarSolicitud = async () => {
        if (!solicitudSeleccionada) return;
        if (!window.confirm("¿Seguro que deseas cancelar esta solicitud? Esta acción liberará el vehículo y conductor asignados.")) return;

        try {
            await axios.put(`${API_URL}/requests/${solicitudSeleccionada.sol_id}/cancel`, {}, { withCredentials: true });

            setSolicitudSeleccionada(null);
            setMensajeExito("Solicitud cancelada correctamente.");
            obtenerSolicitudes();
        } catch (error) {
            console.error("Error cancelando solicitud:", error);
            setMensajeError("Error al cancelar la solicitud.");
        }
    };

    const limpiarFiltros = () => {
        setTerminoBusqueda('');
        setMesFiltro('');
        setEstadoFiltro('ALL');
    };

    const manejarDescargaExcel = async () => {
        try {
            // Fetch all data specifically for export
            const response = await axios.get(`${API_URL}/requests/processed?limit=all`, { withCredentials: true });
            const datosExportar = response.data;

            if (!datosExportar || datosExportar.length === 0) {
                setMensajeError("No hay registros para descargar.");
                setTimeout(() => setMensajeError(''), 3000);
                return;
            }

            const workbook = new ExcelJS.Workbook();
            const worksheet = workbook.addWorksheet('Historial Solicitudes');

            // Columnas
            worksheet.columns = [
                { header: 'FECHA SALIDA', key: 'salida', width: 20 },
                { header: 'FECHA LLEGADA', key: 'llegada', width: 20 },
                { header: 'ESTADO', key: 'estado', width: 15 },
                { header: 'SOLICITANTE', key: 'solicitante', width: 25 },
                { header: 'UNIDAD', key: 'unidad', width: 25 },
                { header: 'TIPO VIAJE', key: 'tipo', width: 20 },
                { header: 'ASUNTO / MOTIVO', key: 'motivo', width: 40 },
                { header: 'ITINERARIO', key: 'itinerario', width: 40 },
                { header: 'VEHÍCULO ASIGNADO', key: 'vehiculo', width: 30 },
                { header: 'CONDUCTOR', key: 'conductor', width: 25 },
                { header: 'KM ESTIMADO', key: 'km', width: 15 },
                { header: 'MOTIVO RECHAZO', key: 'rechazo', width: 40 },
                { header: 'ADMINISTRADOR', key: 'admin', width: 30 },
            ];

            // Estilo Header
            const headerRow = worksheet.getRow(1);
            headerRow.font = { bold: true, color: { argb: '000000' } };
            headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFC000' } };
            headerRow.alignment = { vertical: 'middle', horizontal: 'center' };

            headerRow.eachCell((cell) => {
                cell.border = {
                    top: { style: 'thin' },
                    left: { style: 'thin' },
                    bottom: { style: 'thin' },
                    right: { style: 'thin' }
                };
            });

            // Agregar Datos
            datosExportar.forEach(req => {
                let vehiculoTexto = 'Sin Asignar';
                let conductorTexto = 'Sin Chofer';

                if (req.sol_estado === 'RECHAZADA' || req.sol_estado === 'CANCELADO') {
                    vehiculoTexto = 'NO APLICA';
                    conductorTexto = 'NO APLICA';
                } else {
                    // Lógica Vehículo
                    if (req.vehi_patente) {
                        vehiculoTexto = `${req.vehi_modelo || 'Vehículo'} (${req.vehi_patente})`;
                    } else if (req.sol_patentevehiculofk) {
                        vehiculoTexto = req.sol_patentevehiculofk;
                    }

                    // Lógica Conductor
                    if (req.nombre_chofer) {
                        conductorTexto = req.nombre_chofer;
                    } else if (req.sol_correochoferfk) {
                        conductorTexto = req.sol_correochoferfk;
                    } else if (req.sol_requierechofer) {
                        conductorTexto = 'PENDIENTE ASIGNACIÓN';
                    }
                }

                const row = worksheet.addRow({
                    salida: new Date(req.sol_fechasalida).toLocaleString('es-CL'),
                    llegada: new Date(req.sol_fechallegada).toLocaleString('es-CL'),
                    estado: req.sol_estado,
                    solicitante: req.sol_nombresolicitante,
                    unidad: req.sol_unidad,
                    tipo: req.sol_tipo || 'Salida Estándar',
                    motivo: req.sol_motivo,
                    itinerario: req.sol_itinerario || '-',
                    vehiculo: vehiculoTexto,
                    conductor: conductorTexto,
                    km: req.sol_kmestimado || 0,
                    rechazo: (req.sol_estado === 'RECHAZADA' || req.sol_estado === 'CANCELADO') ? (req.sol_observacionrechazo || 'Cancelada por el administrador') : '-',
                    admin: req.admin_nombre || (req.sol_idadminfk ? 'Admin no encontrado' : 'Auto-gestión')
                });

                row.eachCell((cell) => {
                    cell.alignment = { vertical: 'middle', horizontal: 'left', wrapText: true };
                    cell.border = {
                        top: { style: 'thin' },
                        left: { style: 'thin' },
                        bottom: { style: 'thin' },
                        right: { style: 'thin' }
                    };
                });
            });

            const buffer = await workbook.xlsx.writeBuffer();
            const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
            saveAs(blob, `Historial_Solicitudes_SLEP_${new Date().toISOString().slice(0, 10)}.xlsx`);

        } catch (error) {
            console.error("Error al exportar Excel:", error);
            setMensajeError("Hubo un error al generar el reporte.");
            setTimeout(() => setMensajeError(''), 3000);
        }
    };

    if (cargando) return (
        <div className="p-12 text-center text-slate-500 flex flex-col items-center">
            <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mb-4"></div>
            Cargando historial de solicitudes...
        </div>
    );

    return (
        <div className="p-4 md:p-8 max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500 relative font-sans">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Solicitudes Procesadas</h2>
                    <p className="text-slate-500 text-sm mt-1">Busca y filtra el historial de viajes gestionados.</p>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={manejarDescargaExcel}
                        className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg font-bold shadow-md transition-all text-sm"
                    >
                        <Download size={18} /> Exportar Excel
                    </button>
                    <button onClick={obtenerSolicitudes} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Actualizar">
                        <RefreshCw size={18} />
                    </button>
                    <div className="bg-slate-100 text-slate-600 px-4 py-1.5 rounded-full text-sm font-bold border border-slate-200 shadow-sm">
                        {solicitudesFiltradas.length} Registros
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
                estadoFiltro={estadoFiltro}
                setEstadoFiltro={setEstadoFiltro}
                ordenarPor={ordenarPor}
                setOrdenarPor={setOrdenarPor}
                direccionOrden={direccionOrden}
                setDireccionOrden={setDireccionOrden}
                alLimpiar={limpiarFiltros}
                mostrarFiltroEstado={true}
                mostrarOrdenamiento={true}
                estadosExcluidos={['PENDIENTE']}
            />


            {(mensajeError || mensajeExito) && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm animate-in fade-in duration-300">
                    {mensajeError && (
                        <div className="bg-white border-l-4 border-red-500 p-6 rounded-2xl shadow-2xl max-w-md w-full animate-in zoom-in-95 duration-200 flex flex-col items-center text-center gap-4">
                            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center text-red-500 mb-2">
                                <AlertCircle size={32} />
                            </div>
                            <h3 className="text-xl font-bold text-slate-800">¡Atención!</h3>
                            <p className="text-slate-600 font-medium">{mensajeError}</p>
                            <button type="button" onClick={() => setMensajeError('')} className="mt-2 text-sm text-slate-400 font-bold hover:text-slate-600 uppercase tracking-wide">Cerrar</button>
                        </div>
                    )}
                    {mensajeExito && (
                        <div className="bg-white border-l-4 border-emerald-500 p-6 rounded-2xl shadow-2xl max-w-md w-full animate-in zoom-in-95 duration-200 flex flex-col items-center text-center gap-4">
                            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-500 mb-2">
                                <CheckCircle size={32} />
                            </div>
                            <h3 className="text-xl font-bold text-slate-800">¡Éxito!</h3>
                            <p className="text-slate-600 font-medium">{mensajeExito}</p>
                            <button type="button" onClick={() => setMensajeExito('')} className="mt-2 text-sm text-slate-400 font-bold hover:text-slate-600 uppercase tracking-wide">Cerrar</button>
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
                            mostrarId={false}
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


            <ModalDetalleSolicitud
                solicitud={solicitudSeleccionada}
                detalles={detallesSolicitud}
                cargandoDetalles={cargandoDetalles}
                alCerrar={() => setSolicitudSeleccionada(null)}
                mostrarId={false}
                accionesPie={
                    <div className="w-full flex justify-between items-center">
                        <div>
                            {solicitudSeleccionada?.sol_estado === 'APROBADA' && (
                                <button
                                    onClick={cancelarSolicitud}
                                    className="px-4 py-2 bg-red-50 text-red-600 border border-red-100 rounded-xl hover:bg-red-100 hover:text-red-700 font-bold text-sm transition-colors flex items-center gap-2"
                                >
                                    <XCircle size={16} /> Cancelar Solicitud
                                </button>
                            )}
                        </div>
                        <button onClick={() => setSolicitudSeleccionada(null)} className="px-6 py-2 bg-white border border-slate-300 text-slate-700 font-bold rounded-xl hover:bg-slate-100 transition-colors text-sm shadow-sm">
                            Cerrar
                        </button>
                    </div>
                }
            />
        </div>
    );
};

export default SolicitudesProcesadas;
