import React from 'react';
import { FileText, User, Clock, Eye } from 'lucide-react';
import StatusBadge from './StatusBadge';

const RequestCard = ({
    solicitud,
    alAccionar,
    etiquetaAccion = "Ver Detalles",
    iconoAccion = <Eye size={16} />,
    variante = "default", // 'default' | 'pendiente'
    contenidoExtra = null,
    mostrarId = true
}) => {
    const esPendiente = variante === 'pendiente';
    const colorCajaFecha = esPendiente
        ? "group-hover:bg-amber-50 group-hover:border-amber-100 group-hover:text-amber-700"
        : "group-hover:bg-blue-50 group-hover:border-blue-100 group-hover:text-blue-700";

    const colorEtiquetaFecha = esPendiente ? "group-hover:text-amber-500" : "group-hover:text-blue-400";

    return (
        <div className="bg-white p-4 md:p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow flex flex-col md:flex-row gap-4 md:gap-5 md:items-center group">

            {/* Agrupamos Fecha y Detalles para que siempre estén en fila, incluso en móvil */}
            <div className="flex flex-row gap-4 md:gap-5 flex-1 items-start min-w-0">
                {/* Fecha (Desktop) */}
                <div className={`hidden md:flex flex-shrink-0 flex-col items-center justify-center bg-slate-50 p-2 md:p-3 rounded-xl border border-slate-100 w-16 h-16 md:w-20 md:h-20 transition-colors ${colorCajaFecha}`}>
                    <span className={`text-[9px] md:text-[10px] font-bold text-slate-400 uppercase tracking-widest ${colorEtiquetaFecha}`}>
                        {esPendiente ? 'Salida' : 'Mes'}
                    </span>
                    <span className="text-lg md:text-xl font-black text-slate-700 leading-none my-0.5 md:my-1">
                        {new Date(solicitud.sol_fechasalida).getDate()}
                    </span>
                    <span className={`text-[9px] md:text-[10px] font-bold text-slate-400 uppercase ${colorEtiquetaFecha}`}>
                        {new Date(solicitud.sol_fechasalida).toLocaleString('es-CL', { month: 'short' }).replace('.', '')}
                    </span>
                </div>

                {/* Detalles Principales */}
                <div className="flex-1 space-y-3 md:space-y-2 min-w-0">

                    {/* Mobile Header: Date & Status */}
                    <div className="flex md:hidden items-center justify-between mb-2 pb-2 border-b border-slate-50">
                        <div className="flex items-center gap-2">
                            <div className={`p-1.5 rounded-lg ${esPendiente ? 'bg-amber-50 text-amber-600' : 'bg-blue-50 text-blue-600'}`}>
                                <Clock size={16} />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-xs font-bold text-slate-400 uppercase">
                                    {new Date(solicitud.sol_fechasalida).toLocaleDateString('es-CL', { day: 'numeric', month: 'short' })}
                                </span>
                                {esPendiente && (
                                    <span className="text-xs font-bold text-slate-700">
                                        {new Date(solicitud.sol_fechasalida).toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                )}
                            </div>
                        </div>
                        <StatusBadge estado={solicitud.sol_estado} />
                    </div>

                    {/* Desktop Status & ID */}
                    <div className="hidden md:flex items-center gap-2 mb-1 flex-wrap">
                        <StatusBadge estado={solicitud.sol_estado} />
                        {mostrarId && <span className="text-xs font-mono text-slate-400">ID: {solicitud.sol_id.substring(0, 8)}</span>}
                    </div>

                    <h3 className="font-bold text-lg text-slate-800 leading-tight">
                        {solicitud.sol_motivo}
                    </h3>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-slate-500">
                        <div className="flex items-center gap-1.5 min-w-0 max-w-full">
                            <div className="p-1 rounded bg-slate-100 text-slate-400 flex-shrink-0"><FileText size={14} /></div>
                            <span className="font-medium text-slate-700 truncate">{solicitud.sol_unidad}</span>
                        </div>
                        <div className="flex items-center gap-1.5 min-w-0 max-w-full">
                            <div className="p-1 rounded bg-slate-100 text-slate-400 flex-shrink-0"><User size={14} /></div>
                            <span className="truncate">{solicitud.sol_nombresolicitante}</span>
                        </div>
                        {/* Clock displayed in header on mobile, only show on desktop here */}
                        {esPendiente && (
                            <div className="hidden md:flex items-center gap-1.5">
                                <div className="p-1 rounded bg-slate-100 text-slate-400"><Clock size={14} /></div>
                                <span className="font-mono text-xs bg-slate-50 px-1.5 py-0.5 rounded border border-slate-100">
                                    {new Date(solicitud.sol_fechasalida).toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })}
                                </span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Acciones & Extra Content */}
            <div className="w-full md:w-auto pt-3 md:pt-0 border-t md:border-t-0 border-slate-100 flex md:flex-col gap-2 pl-0 md:pl-6 md:border-l flex-shrink-0">
                {contenidoExtra}

                <button
                    onClick={() => alAccionar(solicitud)}
                    className={`w-full flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl font-bold transition-all shadow-sm text-sm ${esPendiente
                        ? "bg-slate-900 hover:bg-black text-white shadow-slate-900/10 hover:shadow-slate-900/20 active:scale-95"
                        : "bg-white hover:bg-slate-50 text-slate-600 hover:text-blue-600 border border-slate-200 hover:border-blue-200"
                        }`}
                >
                    {iconoAccion} {etiquetaAccion}
                </button>
            </div>

        </div>
    );
};

export default RequestCard;
