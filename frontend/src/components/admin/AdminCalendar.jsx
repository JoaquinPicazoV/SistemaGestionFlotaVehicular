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
    const [events, setEvents] = useState([]);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [currentDate, setCurrentDate] = useState(new Date());

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const res = await axios.get(`${API_URL}/requests/processed`, { withCredentials: true });
                const acceptedRequests = res.data.filter(req =>
                    req.sol_estado === 'APROBADA' || req.sol_estado === 'FINALIZADA'
                );

                const calendarEvents = acceptedRequests.map(req => ({
                    id: req.sol_id,
                    title: `${req.sol_unidad} - ${req.sol_motivo}`,
                    start: new Date(req.sol_fechasalida),
                    end: new Date(req.sol_fechallegada),
                    resource: req,
                    isFinalized: req.sol_estado === 'FINALIZADA'
                }));

                setEvents(calendarEvents);
            } catch (error) {
                console.error("Error cargando eventos:", error);
            }
        };

        fetchEvents();
    }, []);

    const onNavigate = (newDate) => {
        setCurrentDate(newDate);
    };

    const handleNextMonth = () => {
        setCurrentDate(addMonths(currentDate, 1));
    };

    const handlePrevMonth = () => {
        setCurrentDate(subMonths(currentDate, 1));
    };

    const handleToday = () => {
        setCurrentDate(new Date());
    };

    const handleDateChange = (e) => {
        if (e.target.value) {
            const [year, month] = e.target.value.split('-');
            const newDate = new Date(parseInt(year), parseInt(month) - 1, 1);
            setCurrentDate(newDate);
        }
    };

    // Custom Toolbar integrado en el componente principal para usar el estado controlado
    const CustomToolbar = () => {
        const label = format(currentDate, 'MMMM yyyy', { locale: es });

        return (
            <div className="flex items-center justify-between mb-6 p-2 border-b border-slate-100 pb-4">
                <div className="flex items-center gap-2">
                    <button
                        onClick={handlePrevMonth}
                        className="w-10 h-10 flex items-center justify-center hover:bg-slate-100 rounded-full text-slate-600 transition-colors border border-transparent hover:border-slate-200"
                        title="Mes Anterior"
                        type="button"
                    >
                        <ChevronLeft size={24} />
                    </button>
                    <button
                        onClick={handleToday}
                        className="px-4 py-2 text-sm font-bold text-slate-700 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors bg-white shadow-sm"
                        type="button"
                    >
                        Hoy
                    </button>
                    <button
                        onClick={handleNextMonth}
                        className="w-10 h-10 flex items-center justify-center hover:bg-slate-100 rounded-full text-slate-600 transition-colors border border-transparent hover:border-slate-200"
                        title="Mes Siguiente"
                        type="button"
                    >
                        <ChevronRight size={24} />
                    </button>
                </div>

                <div className="text-2xl font-black text-slate-800 capitalize tracking-tight">
                    {label}
                </div>

                <div className="flex items-center gap-3">
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <CalendarIcon size={16} className="text-slate-400" />
                        </div>
                        <input
                            type="month"
                            className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-blue-500 shadow-sm cursor-pointer hover:bg-slate-50 transition-colors"
                            onChange={handleDateChange}
                            value={format(currentDate, 'yyyy-MM')}
                        />
                    </div>
                </div>
            </div>
        );
    };

    const EventComponent = ({ event }) => (
        <div className="px-2 py-1 h-full flex flex-col justify-center overflow-hidden">
            <div className="font-bold truncate text-[11px] leading-tight">{event.resource.sol_unidad}</div>
            <div className="truncate opacity-90 text-[10px]">{event.resource.sol_motivo}</div>
        </div>
    );

    const eventStyleGetter = (event) => {
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
            <CustomToolbar />

            <div className="flex-1 bg-white relative">
                <Calendar
                    localizer={localizer}
                    events={events}
                    startAccessor="start"
                    endAccessor="end"
                    style={{ height: '100%' }}
                    culture='es'
                    view='month'
                    onView={() => { }}
                    date={currentDate}
                    onNavigate={onNavigate}
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
                    eventPropGetter={eventStyleGetter}
                    components={{
                        event: EventComponent,
                        toolbar: () => null
                    }}
                    onSelectEvent={(event) => setSelectedEvent(event)}
                    popup
                />
            </div>

            <style>{`
                /* Modern Calendar Overrides */
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
                .rbc-month-row { border-bottom: 1px solid #f1f5f9; min-height: 120px; }
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
                
                /* Eventos Modernos */
                .rbc-event {
                    border-radius: 6px;
                    box-shadow: 0 2px 4px rgba(37, 99, 235, 0.1);
                    border: none !important;
                    padding: 2px 4px;
                    margin: 1px 4px;
                    transition: all 0.2s;
                }
                .rbc-event:hover { transform: translateY(-1px); box-shadow: 0 4px 6px rgba(37, 99, 235, 0.15); }
                
                /* Botón Ver Más */
                .rbc-show-more {
                    background-color: #f1f5f9;
                    color: #475569;
                    font-size: 0.75rem;
                    font-weight: 700;
                    padding: 2px 8px;
                    border-radius: 999px;
                    margin: 4px;
                    display: inline-block;
                    transition: all 0.2s;
                }
                .rbc-show-more:hover {
                    background-color: #e2e8f0;
                    color: #1e293b;
                    text-decoration: none;
                }
            `}</style>

            {/* Modal de Detalle */}
            {selectedEvent && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-200 scale-100">
                        <div className={`p-5 ${selectedEvent.isFinalized ? 'bg-slate-700' : 'bg-blue-600'} text-white flex justify-between items-start`}>
                            <div>
                                <h3 className="text-xl font-bold">{selectedEvent.resource.sol_unidad}</h3>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-white/20`}>
                                        {selectedEvent.resource.sol_estado}
                                    </span>
                                    <span className="text-sm opacity-90">{selectedEvent.resource.sol_tipo}</span>
                                </div>
                            </div>
                            <button onClick={() => setSelectedEvent(null)} className="text-white/70 hover:text-white p-1 hover:bg-white/10 rounded-lg transition-colors">
                                <span className="text-2xl leading-none">×</span>
                            </button>
                        </div>
                        <div className="p-6 space-y-5">
                            <div>
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 block">Motivo del Viaje</label>
                                <p className="text-slate-800 font-medium text-lg leading-snug">{selectedEvent.resource.sol_motivo}</p>
                            </div>

                            <div className="grid grid-cols-2 gap-6 p-4 bg-slate-50 rounded-xl border border-slate-100">
                                <div>
                                    <label className="text-xs font-bold text-slate-400 uppercase mb-1 block">Salida</label>
                                    <p className="text-sm font-bold text-slate-700">{format(selectedEvent.start, 'dd MMM yyyy', { locale: es })}</p>
                                    <p className="text-xs text-slate-500">{format(selectedEvent.start, 'HH:mm')} hrs</p>
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-slate-400 uppercase mb-1 block">Regreso</label>
                                    <p className="text-sm font-bold text-slate-700">{format(selectedEvent.end, 'dd MMM yyyy', { locale: es })}</p>
                                    <p className="text-xs text-slate-500">{format(selectedEvent.end, 'HH:mm')} hrs</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-bold text-slate-400 uppercase block mb-1">Chofer Asignado</label>
                                    <div className="flex items-center gap-2 text-sm font-medium text-slate-700 p-2 border border-slate-100 rounded-lg">
                                        {selectedEvent.resource.nombre_chofer ? (
                                            <>
                                                <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs">👤</div>
                                                <span className="truncate">{selectedEvent.resource.nombre_chofer.split(' ')[0]}</span>
                                            </>
                                        ) : <span className="text-slate-400 italic">Sin asignar</span>}
                                    </div>
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-slate-400 uppercase block mb-1">Vehículo</label>
                                    <div className="flex items-center gap-2 text-sm font-medium text-slate-700 p-2 border border-slate-100 rounded-lg">
                                        {selectedEvent.resource.vehi_patente ? (
                                            <>
                                                <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-xs">🚗</div>
                                                <span>{selectedEvent.resource.vehi_patente}</span>
                                            </>
                                        ) : <span className="text-slate-400 italic">Sin asignar</span>}
                                    </div>
                                </div>
                            </div>

                            {selectedEvent.resource.sol_itinerario && (
                                <div>
                                    <label className="text-xs font-bold text-slate-400 uppercase block mb-1">Itinerario</label>
                                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-sm text-slate-600 italic">
                                        "{selectedEvent.resource.sol_itinerario}"
                                    </div>
                                </div>
                            )}

                            <div className="flex justify-end pt-2">
                                <button
                                    onClick={() => setSelectedEvent(null)}
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
