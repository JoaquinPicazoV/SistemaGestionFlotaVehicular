import React, { useState, useEffect } from 'react';
import { Save, CheckCircle, ChevronDown } from 'lucide-react';

const FormularioChofer = ({ alEnviar, alCancelar, inicial, cargando, alError }) => {
    const [datosFormulario, setDatosFormulario] = useState(inicial || {
        cho_correoinstitucional: '',
        cho_nombre: '',
        cho_activo: 1
    });

    useEffect(() => {
        if (inicial) {
            // Ensure activo is treated consistently (0 or 1)
            setDatosFormulario({
                ...inicial,
                cho_activo: inicial.cho_activo ? 1 : 0
            });
        }
    }, [inicial]);

    const manejarCambio = (e) => {
        const { name, value } = e.target;
        setDatosFormulario(prev => ({ ...prev, [name]: value }));
    };

    const manejarEmail = (e) => {
        const val = e.target.value.toLowerCase();
        if (/^[a-z0-9.]*$/.test(val)) {
            setDatosFormulario(prev => ({ ...prev, cho_correoinstitucional: val ? val + '@slepllanquihue.cl' : '' }));
        }
    };

    const manejarNombre = (e) => {
        const val = e.target.value;
        if (val.startsWith(' ')) return;
        if (/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]*$/.test(val)) {
            setDatosFormulario(prev => ({ ...prev, cho_nombre: val }));
        }
    };

    const manejarEnvio = (e) => {
        e.preventDefault();
        // Basic validation if needed
        alEnviar(datosFormulario);
    };

    return (
        <form onSubmit={manejarEnvio} className="p-8 space-y-6">
            {!inicial ? (
                <>
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Nombre Completo</label>
                        <input
                            type="text"
                            placeholder="Ej: Juan Pérez"
                            className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-medium text-slate-700"
                            value={datosFormulario.cho_nombre}
                            onChange={manejarNombre}
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Correo Institucional</label>
                        <div className="flex">
                            <input
                                type="text"
                                placeholder="nombre.apellido"
                                className="flex-1 px-4 py-2.5 border border-r-0 border-slate-200 rounded-l-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-medium text-slate-700"
                                value={datosFormulario.cho_correoinstitucional.replace('@slepllanquihue.cl', '')}
                                onChange={manejarEmail}
                                required
                            />
                            <span className="inline-flex items-center px-4 border border-l-0 border-slate-200 bg-slate-50 text-slate-500 text-sm font-bold rounded-r-xl select-none">
                                @slepllanquihue.cl
                            </span>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Estado Inicial</label>
                        <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl flex items-center gap-3">
                            <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center text-white text-xs"><CheckCircle size={12} strokeWidth={4} /></div>
                            <span className="text-sm font-bold text-emerald-800">Activo (Predeterminado)</span>
                        </div>
                    </div>
                </>
            ) : (
                <>
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Correo Institucional (ID)</label>
                        <input type="email" className="w-full px-4 py-2.5 border border-slate-200 rounded-xl bg-slate-50 text-slate-400 font-medium cursor-not-allowed" value={datosFormulario.cho_correoinstitucional} disabled />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Nombre Completo</label>
                        <input
                            type="text"
                            className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-medium text-slate-700"
                            value={datosFormulario.cho_nombre}
                            onChange={manejarNombre}
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Estado</label>
                        <div className="relative">
                            <select
                                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all bg-white font-medium text-slate-700 appearance-none cursor-pointer"
                                value={datosFormulario.cho_activo}
                                onChange={e => setDatosFormulario({ ...datosFormulario, cho_activo: parseInt(e.target.value) })}
                            >
                                <option value={1}>🟢 Activo</option>
                                <option value={0}>🔴 Inactivo</option>
                            </select>
                            <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                        </div>
                    </div>
                </>
            )}

            <div className="pt-6 flex gap-3 justify-end border-t border-slate-100">
                <button type="button" onClick={alCancelar} className="px-5 py-2.5 text-slate-600 hover:bg-slate-100 rounded-xl font-bold transition-colors">Cancelar</button>
                <button type="submit" className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-lg shadow-blue-500/20 transition-all flex items-center gap-2" disabled={cargando}>
                    {cargando ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : <Save size={18} />}
                    {inicial ? 'Guardar Cambios' : 'Registrar Conductor'}
                </button>
            </div>
        </form>
    );
};

export default FormularioChofer;
