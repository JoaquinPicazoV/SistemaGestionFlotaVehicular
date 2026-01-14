import React from 'react';
import { FileText, User, Clock, Eye } from 'lucide-react';
import StatusBadge from './StatusBadge';

const RequestCard = ({
    solicitud,
    alAccionar,
    etiquetaAccion = "Ver Detalles",
    iconoAccion = <Eye size={16} />,
    variante = "default", // 'default' | 'pendiente'
    contenidoExtra = null
}) => {
    const esPendiente = variante === 'pendiente';
    const colorCajaFecha = esPendiente
        ? "group-hover:bg-amber-50 group-hover:border-amber-100 group-hover:text-amber-700"
        : "group-hover:bg-blue-50 group-hover:border-blue-100 group-hover:text-blue-700";

    const colorEtiquetaFecha = esPendiente ? "group-hover:text-amber-500" : "group-hover:text-blue-400";

    return (
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow flex flex-col md:flex-row gap-5 items-start md:items-center group">

            {/* Fecha */}
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

            {/* Detalles Principales */}
            <div className="flex-1 space-y-2 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                    <StatusBadge estado={solicitud.sol_estado} />
                    <span className="text-xs font-mono text-slate-400">ID: {solicitud.sol_id.substring(0, 8)}</span>
                </div>
                <h3 className="font-bold text-lg text-slate-800 truncate pr-4">
                    {solicitud.sol_motivo}
                </h3>
                <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-slate-500">
                    <div className="flex items-center gap-1.5">
                        <div className="p-1 rounded bg-slate-100 text-slate-400"><FileText size={12} /></div>
                        <span className="font-medium text-slate-700">{solicitud.sol_unidad}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <div className="p-1 rounded bg-slate-100 text-slate-400"><User size={12} /></div>
                        <span>{solicitud.sol_nombresolicitante}</span>
                    </div>
                    {esPendiente && (
                        <div className="flex items-center gap-1.5">
                            <div className="p-1 rounded bg-slate-100 text-slate-400"><Clock size={12} /></div>
                            <span className="font-mono text-xs bg-slate-50 px-1.5 py-0.5 rounded border border-slate-100">
                                {new Date(solicitud.sol_fechasalida).toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                        </div>
                    )}
                </div>
            </div>

            {/* Acciones & Extra Content */}
            <div className="w-full md:w-auto pt-4 md:pt-0 border-t md:border-t-0 border-slate-100 flex md:flex-col gap-2 pl-0 md:pl-6 md:border-l">
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
