import React from 'react';

const StatusBadge = ({ estado }) => {
    const estilos = {
        'APROBADA': 'bg-emerald-100 text-emerald-700 border-emerald-200',
        'PENDIENTE': 'bg-amber-100 text-amber-700 border-amber-200',
        'RECHAZADA': 'bg-red-100 text-red-700 border-red-200',
        'FINALIZADA': 'bg-blue-100 text-blue-700 border-blue-200',
        'DISPONIBLE': 'bg-emerald-100 text-emerald-700 border-emerald-200',
        'EN RUTA': 'bg-blue-100 text-blue-700 border-blue-200',
        'MANTENCION': 'bg-red-100 text-red-700 border-red-200',
    };

    const estiloPorDefecto = 'bg-slate-100 text-slate-600 border-slate-200';

    return (
        <span className={`inline-flex items-center justify-center px-3 py-1.5 rounded-full text-xs font-bold tracking-wide border shadow-sm ${estilos[estado] || estiloPorDefecto}`}>
            {estado}
        </span>
    );
};

export default StatusBadge;
