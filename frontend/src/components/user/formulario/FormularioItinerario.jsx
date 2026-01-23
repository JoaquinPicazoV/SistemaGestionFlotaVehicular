import React from 'react';

const FormularioItinerario = ({ datos, alCambiar }) => {
    return (
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="bg-slate-50/50 px-6 py-4 border-b border-slate-100 flex items-center gap-2">
                <div className="bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold">2</div>
                <h3 className="font-bold text-slate-800 uppercase text-sm tracking-wide">Itinerario y Motivo</h3>
            </div>
            <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    {/* Salida */}
                    <div className="p-4 rounded-2xl border border-emerald-100 bg-emerald-50/30">
                        <div className="flex items-center gap-2 mb-3 text-emerald-700 font-bold text-sm uppercase tracking-wide">
                            <div className="w-2 h-2 rounded-full bg-emerald-500 shadow shadow-emerald-500/50"></div> Fecha Salida
                        </div>
                        <div className="flex gap-3">
                            <div className="flex-1 space-y-1">
                                <input
                                    type="date"
                                    required
                                    className="w-full bg-white p-3 rounded-xl border border-emerald-100 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all shadow-sm"
                                    value={datos.sol_fechasalida}
                                    onChange={e => {
                                        const val = e.target.value;
                                        alCambiar({ ...datos, sol_fechasalida: val, sol_fechallegada: val > datos.sol_fechallegada ? val : datos.sol_fechallegada });
                                    }}
                                    min={new Date().toISOString().split('T')[0]}
                                />
                            </div>
                            <div className="w-32 space-y-1">
                                <input
                                    type="time"
                                    required
                                    className="w-full bg-white p-3 rounded-xl border border-emerald-100 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all shadow-sm text-center"
                                    value={datos.sol_timesalida}
                                    onChange={e => {
                                        const val = e.target.value;
                                        // Si es el mismo dia y la nueva salida es >= llegada actual, resetear llegada
                                        if (datos.sol_fechasalida === datos.sol_fechallegada && datos.sol_timeallegada && val >= datos.sol_timeallegada) {
                                            alCambiar({ ...datos, sol_timesalida: val, sol_timeallegada: '' });
                                        } else {
                                            alCambiar({ ...datos, sol_timesalida: val });
                                        }
                                    }}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Regreso */}
                    <div className="p-4 rounded-2xl border border-red-100 bg-red-50/30">
                        <div className="flex items-center gap-2 mb-3 text-red-700 font-bold text-sm uppercase tracking-wide">
                            <div className="w-2 h-2 rounded-full bg-red-500 shadow shadow-red-500/50"></div> Fecha Regreso
                        </div>
                        <div className="flex gap-3">
                            <div className="flex-1 space-y-1">
                                <input
                                    type="date"
                                    required
                                    className="w-full bg-white p-3 rounded-xl border border-red-100 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none transition-all shadow-sm"
                                    value={datos.sol_fechallegada}
                                    onChange={e => alCambiar({ ...datos, sol_fechallegada: e.target.value })}
                                    min={datos.sol_fechasalida || new Date().toISOString().split('T')[0]}
                                />
                            </div>
                            <div className="w-32 space-y-1">
                                <input
                                    type="time"
                                    required
                                    className="w-full bg-white p-3 rounded-xl border border-red-100 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none transition-all shadow-sm text-center"
                                    value={datos.sol_timeallegada}
                                    onChange={e => {
                                        const val = e.target.value;
                                        // Validar consistencia temporal
                                        if (datos.sol_fechasalida === datos.sol_fechallegada && datos.sol_timesalida && val <= datos.sol_timesalida) {
                                            alert("La hora de regreso debe ser posterior a la de salida.");
                                            return;
                                        }
                                        alCambiar({ ...datos, sol_timeallegada: val });
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="space-y-5">
                    {/* Campos de Texto y Motivo */}
                    <div className="relative group">
                        <label className="absolute -top-2.5 left-3 bg-white px-1 text-xs font-bold text-blue-600 uppercase tracking-widest z-10">Solicitante Responsable</label>
                        <input
                            type="text"
                            required
                            placeholder="Nombre completo del responsable..."
                            className="w-full p-4 bg-white border border-slate-300 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-medium text-slate-800 placeholder:text-slate-300 text-base"
                            value={datos.sol_nombresolicitante}
                            onChange={e => {
                                const nuevoNombre = e.target.value;
                                if (nuevoNombre.startsWith(' ')) return;
                                if (/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]*$/.test(nuevoNombre)) {
                                    alCambiar({
                                        ...datos,
                                        sol_nombresolicitante: nuevoNombre,
                                        pasajeros: datos.pasajeros.map(p =>
                                            p.esSolicitante ? { ...p, nombre: nuevoNombre } : p
                                        )
                                    });
                                }
                            }}
                        />
                        <div className="mt-3 flex items-center justify-end">
                            <label className="relative inline-flex items-center cursor-pointer group">
                                <input
                                    type="checkbox"
                                    className="sr-only peer"
                                    checked={datos.pasajeros.some(p => p.esSolicitante)}
                                    onChange={(e) => {
                                        if (e.target.checked) {
                                            if (!datos.sol_nombresolicitante.trim()) {
                                                alert("Por favor ingresa tu nombre primero.");
                                                return;
                                            }
                                            alCambiar({
                                                ...datos,
                                                pasajeros: [...datos.pasajeros, {
                                                    nombre: datos.sol_nombresolicitante,
                                                    tipo: 1,
                                                    esSolicitante: true
                                                }]
                                            });
                                        } else {
                                            alCambiar({
                                                ...datos,
                                                pasajeros: datos.pasajeros.filter(p => !p.esSolicitante)
                                            });
                                        }
                                    }}
                                />
                                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600 group-hover:bg-slate-300"></div>
                                <span className="ml-3 text-sm font-bold text-slate-500 group-hover:text-blue-600 transition-colors">
                                    Asistiré al viaje (Agregarme a lista)
                                </span>
                            </label>
                        </div>
                    </div>

                    <div className="relative group">
                        <label className="absolute -top-2.5 left-3 bg-white px-1 text-xs font-bold text-blue-600 uppercase tracking-widest z-10">Motivo Principal</label>
                        <input
                            type="text"
                            required
                            minLength={5}
                            maxLength={100}
                            placeholder="Describe el motivo principal del viaje..."
                            className="w-full p-4 bg-white border border-slate-300 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-medium text-slate-800 placeholder:text-slate-300 text-base"
                            value={datos.sol_motivo}
                            onChange={e => {
                                const val = e.target.value;
                                if (val.startsWith(' ')) return;
                                if (/^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑüÜ\s.,;:\-/"'?!¡¿@#&()º]*$/.test(val)) alCambiar({ ...datos, sol_motivo: val });
                            }}
                        />
                    </div>

                    <div className="relative group">
                        <label className="absolute -top-2.5 left-3 bg-white px-1 text-xs font-bold text-blue-600 uppercase tracking-widest z-10">Detalle del Itinerario</label>
                        <textarea
                            required
                            minLength={20}
                            maxLength={1000}
                            placeholder="Ej: Salida desde escuela a las 08:00, primera parada en museo, regreso 16:00..."
                            className="w-full p-4 bg-white border border-slate-300 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-medium text-slate-800 placeholder:text-slate-300 min-h-[120px] text-base resize-none"
                            value={datos.sol_itinerario}
                            onChange={e => {
                                const val = e.target.value;
                                if (val.startsWith(' ')) return;
                                if (/^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑüÜ\s.,;:\-/"'?!¡¿@#&()º\n]*$/.test(val)) alCambiar({ ...datos, sol_itinerario: val });
                            }}
                        />
                    </div>

                    <div className="relative group">
                        <label className="absolute -top-2.5 left-3 bg-white px-1 text-xs font-bold text-blue-600 uppercase tracking-widest z-10">Kilometraje Estimado (Ida + Vuelta)</label>
                        <input
                            type="text"
                            inputMode="numeric"
                            required
                            placeholder="Ej: 45"
                            className="w-full p-4 bg-white border border-slate-300 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-medium text-slate-800 placeholder:text-slate-300 text-base"
                            value={datos.sol_kmestimado || ''}
                            onChange={e => {
                                const val = e.target.value;
                                if (/^[0-9]*$/.test(val)) alCambiar({ ...datos, sol_kmestimado: val });
                            }}
                        />
                        <p className="mt-1 text-xs text-slate-400 pl-2">Ingrese la distancia total aproximada del viaje.</p>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default FormularioItinerario;
