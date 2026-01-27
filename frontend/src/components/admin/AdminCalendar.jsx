import React, { useState, useEffect } from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay, addMonths, subMonths } from 'date-fns';
import { es } from 'date-fns/locale';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import axios from 'axios';
import API_URL from '../../config/api';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';

const locales = {
    'es': es,
};

const localizer = dateFnsLocalizer({
    format,
    parse,
    startOfWeek,
    getDay,
    locales,
});

const AdminCalendar = () => {
    const [eventos, setEventos] = useState([]);
    const [eventoSeleccionado, setEventoSeleccionado] = useState(null);
    const [fechaActual, setFechaActual] = useState(new Date());

    useEffect(() => {
        const obtenerEventos = async () => {
            try {
                const res = await axios.get(`${API_URL}/requests/processed`, { withCredentials: true });
                const solicitudesAceptadas = res.data.filter(req =>
                    req.sol_estado === 'APROBADA' || req.sol_estado === 'FINALIZADA'
                );

                const eventosCalendario = solicitudesAceptadas.map(req => ({
                    id: req.sol_id,
                    title: `${req.sol_unidad} - ${req.sol_motivo}`,
                    start: new Date(req.sol_fechasalida),
                    end: new Date(req.sol_fechallegada),
                    resource: req,
                    isFinalized: req.sol_estado === 'FINALIZADA'
                }));

                setEventos(eventosCalendario);
            } catch (error) {
                console.error("Error cargando eventos:", error);
            }
        };

        obtenerEventos();
    }, []);

    const alNavegar = (nuevaFecha) => {
        setFechaActual(nuevaFecha);
    };

    const manejarMesSiguiente = () => {
        setFechaActual(addMonths(fechaActual, 1));
    };

    const manejarMesAnterior = () => {
        setFechaActual(subMonths(fechaActual, 1));
    };

    const manejarHoy = () => {
        setFechaActual(new Date());
    };

    const manejarCambioFecha = (e) => {
        if (e.target.value) {
            const [anio, mes] = e.target.value.split('-');
            const nuevaFecha = new Date(parseInt(anio), parseInt(mes) - 1, 1);
            setFechaActual(nuevaFecha);
        }
    };

    const BarraHerramientas = () => {
        const etiqueta = format(fechaActual, 'MMMM yyyy', { locale: es });

        return (
            <div className="flex items-center justify-between mb-6 p-2 border-b border-slate-100 pb-4">
                <div className="flex items-center gap-2">
                    <button
                        onClick={manejarMesAnterior}
                        className="w-10 h-10 flex items-center justify-center hover:bg-slate-100 rounded-full text-slate-600 transition-colors border border-transparent hover:border-slate-200"
                        title="Mes Anterior"
                        type="button"
                    >
                        <ChevronLeft size={24} />
                    </button>
                    <button
                        onClick={manejarHoy}
                        className="px-4 py-2 text-sm font-bold text-slate-700 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors bg-white shadow-sm"
                        type="button"
                    >
                        Hoy
                    </button>
                    <button
                        onClick={manejarMesSiguiente}
                        className="w-10 h-10 flex items-center justify-center hover:bg-slate-100 rounded-full text-slate-600 transition-colors border border-transparent hover:border-slate-200"
                        title="Mes Siguiente"
                        type="button"
                    >
                        <ChevronRight size={24} />
                    </button>
                </div>

                <div className="text-2xl font-black text-slate-800 capitalize tracking-tight">
                    {etiqueta}
                </div>

                <div className="flex items-center gap-3">
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <CalendarIcon size={16} className="text-slate-400" />
                        </div>
                        <input
                            type="month"
                            className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-blue-500 shadow-sm cursor-pointer hover:bg-slate-50 transition-colors"
                            onChange={manejarCambioFecha}
                            value={format(fechaActual, 'yyyy-MM')}
                        />
                    </div>
                </div>
            </div>
        );
    };

    const ComponenteEvento = ({ event }) => (
        <div
            className="px-2 py-1 h-full flex flex-col justify-center overflow-hidden"
            title={`${event.resource.sol_unidad} - ${event.resource.sol_motivo}`}
        >
            <div className="font-bold truncate text-[11px] leading-tight">{event.resource.sol_unidad}</div>
            <div className="truncate opacity-90 text-[10px]">{event.resource.sol_motivo}</div>
        </div>
    );

    const obtenerEstiloEvento = (event) => {
        const isFinalized = event.isFinalized;
        return {
            style: {
                backgroundColor: isFinalized ? '#64748b' : '#2563eb',
                borderRadius: '6px',
                opacity: 0.95,
                color: 'white',
                border: 'none',
                borderLeft: isFinalized ? '4px solid #334155' : '4px solid #1e3a8a',
                display: 'block',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }
        };
    };

    return (
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm h-[calc(100vh-12rem)] min-h-[600px] flex flex-col overflow-hidden">
            <BarraHerramientas />

            <div className="flex-1 bg-white relative overflow-hidden">
                <Calendar
                    localizer={localizer}
                    events={eventos}
                    startAccessor="start"
                    endAccessor="end"
                    style={{ height: '100%' }}
                    culture='es'
                    view='month'
                    onView={() => { }}
                    date={fechaActual}
                    onNavigate={alNavegar}
                    views={['month']}
                    messages={{
                        today: "Hoy",
                        previous: "Anterior",
                        next: "Siguiente",
                        month: "Mes",
                        week: "Semana",
                        day: "Día",
                        agenda: "Agenda",
                        date: "Fecha",
                        time: "Hora",
                        event: "Evento",
                        noEventsInRange: "Sin eventos",
                        showMore: total => `+ Ver ${total} más`
                    }}
                    eventPropGetter={obtenerEstiloEvento}
                    components={{
                        event: ComponenteEvento,
                        toolbar: () => null
                    }}
                    onSelectEvent={(event) => setEventoSeleccionado(event)}
                    popup
                />
            </div>

            <style>{`
                .rbc-calendar { font-family: inherit; }
                .rbc-month-view { border: none; border-top: 1px solid #f1f5f9; }
                .rbc-header {
                    padding: 12px 0;
                    font-size: 0.75rem;
                    font-weight: 700;
                    color: #64748b;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                    border-bottom: 1px solid #f1f5f9;
                }
                .rbc-month-row { border-bottom: 1px solid #f1f5f9; overflow: visible; }
                .rbc-day-bg { border-left: 1px solid #f1f5f9; }
                .rbc-day-bg + .rbc-day-bg { border-left: 1px solid #f1f5f9; }
                .rbc-off-range-bg { background-color: #f8fafc; }
                .rbc-date-cell {
                    padding: 8px;
                    font-size: 0.85rem;
                    font-weight: 600;
                    color: #334155;
                }
                .rbc-off-range .rbc-button-link { color: #cbd5e1; }
                .rbc-today { background-color: #eff6ff; }
                
                .rbc-event {
                    border-radius: 6px;
                    box-shadow: 0 2px 4px rgba(37, 99, 235, 0.1);
                    border: none !important;
                    padding: 1px 3px;
                    margin: 1px 2px;
                    min-height: 24px;
                    transition: all 0.2s;
                }
                .rbc-event:hover { transform: translateY(-1px); box-shadow: 0 4px 6px rgba(37, 99, 235, 0.15); z-index: 10; }
                
                .rbc-row-segment {
                     padding: 0 2px;
                }

                .rbc-show-more {
                    background-color: #f1f5f9;
                    color: #475569;
                    font-size: 0.75rem;
                    font-weight: 700;
                    padding: 2px 8px;
                    border-radius: 999px;
                    margin: 1px;
                    display: inline-block;
                    transition: all 0.2s;
                    white-space: nowrap;
                }
                .rbc-show-more:hover {
                    background-color: #e2e8f0;
                    color: #1e293b;
                    text-decoration: none;
                }
                
                .rbc-overlay {
                    z-index: 50;
                }
            `}</style>


            {eventoSeleccionado && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
                        <div className={`p-5 ${eventoSeleccionado.isFinalized ? 'bg-slate-700' : 'bg-blue-600'} text-white flex justify-between items-start`}>
                            <div>
                                <h3 className="text-xl font-bold">{eventoSeleccionado.resource.sol_unidad}</h3>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-white/20`}>
                                        {eventoSeleccionado.resource.sol_estado}
                                    </span>
                                    <span className="text-sm opacity-90">{eventoSeleccionado.resource.sol_tipo}</span>
                                </div>
                            </div>
                            <button onClick={() => setEventoSeleccionado(null)} className="text-white/70 hover:text-white p-1 hover:bg-white/10 rounded-lg transition-colors">
                                <span className="text-2xl leading-none">×</span>
                            </button>
                        </div>
                        <div className="p-6 space-y-5">
                            <div>
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 block">Motivo del Viaje</label>
                                <p className="text-slate-800 font-medium text-lg leading-snug">{eventoSeleccionado.resource.sol_motivo}</p>
                            </div>

                            <div className="grid grid-cols-2 gap-6 p-4 bg-slate-50 rounded-xl border border-slate-100">
                                <div>
                                    <label className="text-xs font-bold text-slate-400 uppercase mb-1 block">Salida</label>
                                    <p className="text-sm font-bold text-slate-700">{format(eventoSeleccionado.start, 'dd MMM yyyy', { locale: es })}</p>
                                    <p className="text-xs text-slate-500">{format(eventoSeleccionado.start, 'HH:mm')} hrs</p>
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-slate-400 uppercase mb-1 block">Regreso</label>
                                    <p className="text-sm font-bold text-slate-700">{format(eventoSeleccionado.end, 'dd MMM yyyy', { locale: es })}</p>
                                    <p className="text-xs text-slate-500">{format(eventoSeleccionado.end, 'HH:mm')} hrs</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-bold text-slate-400 uppercase block mb-1">Chofer Asignado</label>
                                    <div className="flex items-center gap-2 text-sm font-medium text-slate-700 p-2 border border-slate-100 rounded-lg">
                                        {eventoSeleccionado.resource.nombre_chofer ? (
                                            <>
                                                <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs">👤</div>
                                                <span className="truncate">{eventoSeleccionado.resource.nombre_chofer.split(' ')[0]}</span>
                                            </>
                                        ) : <span className="text-slate-400 italic">Sin asignar</span>}
                                    </div>
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-slate-400 uppercase block mb-1">Vehículo</label>
                                    <div className="flex items-center gap-2 text-sm font-medium text-slate-700 p-2 border border-slate-100 rounded-lg">
                                        {eventoSeleccionado.resource.vehi_patente ? (
                                            <>
                                                <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-xs">🚗</div>
                                                <span>{eventoSeleccionado.resource.vehi_patente}</span>
                                            </>
                                        ) : <span className="text-slate-400 italic">Sin asignar</span>}
                                    </div>
                                </div>
                            </div>

                            {eventoSeleccionado.resource.sol_itinerario && (
                                <div>
                                    <label className="text-xs font-bold text-slate-400 uppercase block mb-1">Itinerario</label>
                                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-sm text-slate-600 italic">
                                        "{eventoSeleccionado.resource.sol_itinerario}"
                                    </div>
                                </div>
                            )}

                            <div className="flex justify-end pt-2">
                                <button
                                    onClick={() => setEventoSeleccionado(null)}
                                    className="px-6 py-2.5 bg-slate-900 hover:bg-black text-white rounded-xl text-sm font-bold transition-all shadow-lg shadow-slate-900/20 active:scale-95"
                                >
                                    Cerrar Detalle
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminCalendar;
