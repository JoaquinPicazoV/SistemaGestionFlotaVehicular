import React from 'react';
import { FileText, User, Clock, Eye } from 'lucide-react';
import StatusBadge from './StatusBadge';

const RequestCard = ({
    solicitud,
    alAccionar,
    etiquetaAccion = "Ver Detalles",
    iconoAccion = <Eye size={16} />,
    variante = "default",
    contenidoExtra = null,
    mostrarId = true
}) => {
    const esPendiente = variante === 'pendiente';
    const colorCajaFecha = esPendiente
        ? "group-hover:bg-amber-50 group-hover:border-amber-100 group-hover:text-amber-700"
        : "group-hover:bg-blue-50 group-hover:border-blue-100 group-hover:text-blue-700";

    const colorEtiquetaFecha = esPendiente ? "group-hover:text-amber-500" : "group-hover:text-blue-400";

    return (
        <div className="bg-white w-full p-4 md:p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow group overflow-hidden">
            <div className="md:hidden flex flex-col gap-3">
                <div className="flex justify-between items-start gap-2">
                    <StatusBadge estado={solicitud.sol_estado} />
                    <div className="flex flex-col items-end flex-shrink-0">
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-lg ${esPendiente ? 'bg-amber-50 text-amber-600' : 'bg-blue-50 text-blue-600'}`}>
                            {new Date(solicitud.sol_fechasalida).toLocaleDateString('es-CL', { day: 'numeric', month: 'short' })}
                        </span>
                    </div>
                </div>

                <div className="space-y-2">
                    <h3 className="font-bold text-base text-slate-800 leading-snug line-clamp-2 break-words">
                        {solicitud.sol_motivo}
                    </h3>
                    <div className="flex flex-wrap gap-2 text-xs text-slate-500 font-medium">
                        <span className="flex items-center gap-1 bg-slate-50 px-2 py-1 rounded-md border border-slate-100 max-w-full truncate">
                            <User size={12} className="flex-shrink-0" /> <span className="truncate">{solicitud.sol_nombresolicitante}</span>
                        </span>
                        <span className="flex items-center gap-1 bg-slate-50 px-2 py-1 rounded-md border border-slate-100 max-w-full truncate">
                            <FileText size={12} className="flex-shrink-0" /> <span className="truncate">{solicitud.sol_unidad}</span>
                        </span>
                    </div>
                    {esPendiente && (
                        <div className="flex items-center gap-1.5 text-xs text-amber-600 font-bold bg-amber-50 px-2 py-1 rounded-md w-fit">
                            <Clock size={12} />
                            {new Date(solicitud.sol_fechasalida).toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })}
                        </div>
                    )}
                </div>

                <div className="pt-2 mt-auto">
                    <button
                        onClick={() => alAccionar(solicitud)}
                        className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-bold transition-all shadow-sm text-sm ${esPendiente
                            ? "bg-slate-900 hover:bg-black text-white shadow-slate-900/10 active:scale-95"
                            : "bg-white hover:bg-slate-50 text-slate-600 hover:text-blue-600 border border-slate-200 hover:border-blue-200"
                            }`}
                    >
                        {iconoAccion} {etiquetaAccion}
                    </button>
                    {contenidoExtra && <div className="mt-2 text-xs overflow-hidden">{contenidoExtra}</div>}
                </div>
            </div>

            <div className="hidden md:flex flex-row gap-5 items-center w-full">
                <div className="flex flex-row gap-5 flex-1 items-start min-w-0">
                    <div className={`flex-shrink-0 flex flex-col items-center justify-center bg-slate-50 p-3 rounded-xl border border-slate-100 w-20 h-20 transition-colors ${colorCajaFecha}`}>
                        <span className={`text-[10px] font-bold text-slate-400 uppercase tracking-widest ${colorEtiquetaFecha}`}>
                            {esPendiente ? 'Salida' : 'Mes'}
                        </span>
                        <span className="text-xl font-black text-slate-700 leading-none my-1">
                            {new Date(solicitud.sol_fechasalida).getDate()}
                        </span>
                        <span className={`text-[10px] font-bold text-slate-400 uppercase ${colorEtiquetaFecha}`}>
                            {new Date(solicitud.sol_fechasalida).toLocaleString('es-CL', { month: 'short' }).replace('.', '')}
                        </span>
                    </div>

                    <div className="flex-1 space-y-2 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <StatusBadge estado={solicitud.sol_estado} />
                            {mostrarId && <span className="text-xs font-mono text-slate-400">ID: {solicitud.sol_id.substring(0, 8)}</span>}
                        </div>

                        <h3 className="font-bold text-lg text-slate-800 leading-tight truncate">
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
                            {esPendiente && (
                                <div className="flex items-center gap-1.5">
                                    <div className="p-1 rounded bg-slate-100 text-slate-400"><Clock size={14} /></div>
                                    <span className="font-mono text-xs bg-slate-50 px-1.5 py-0.5 rounded border border-slate-100">
                                        {new Date(solicitud.sol_fechasalida).toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="w-auto flex flex-col gap-2 pl-6 border-l border-slate-100 flex-shrink-0">
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
        </div>
    );
};

export default RequestCard;
