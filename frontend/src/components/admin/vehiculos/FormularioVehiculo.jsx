import React, { useState, useEffect } from 'react';
import { Save, Info, FileText } from 'lucide-react';

const FormularioVehiculo = ({ alEnviar, alCancelar, inicial, cargando, alError }) => {
    const [datosFormulario, setDatosFormulario] = useState(inicial || {
        vehi_patente: '',
        vehi_marca: '',
        vehi_modelo: '',
        vehi_tipo: '',
        vehi_anio: '',
        vehi_color: '',
        vehi_motor: '',
        vehi_chasis: '',
        vehi_capacidad: '',
        vehi_capacidad_carga: '',
        vehi_inventario: '',
        vehi_propietario: 'SERVICIO LOCAL DE EDUCACIÓN LLANQUIHUE',
        vehi_resolucion: '',
        vehi_lugaraparcamiento: '',
        vehi_poliza: '',
        vehi_multas: '',
        vehi_estado: 'DISPONIBLE'
    });

    useEffect(() => {
        if (inicial) {
            setDatosFormulario(inicial);
        }
    }, [inicial]);

    const manejarCambio = (e) => {
        const { name, value } = e.target;

        if (name === 'vehi_patente') {
            const valorMayuscula = value.toUpperCase();
            if (/^[A-Z0-9]*$/.test(valorMayuscula) && valorMayuscula.length <= 6) {
                setDatosFormulario(prev => ({ ...prev, [name]: valorMayuscula }));
            }
            return;
        }

        if (name === 'vehi_color') {
            const valorMayuscula = value.toUpperCase();
            if (/^[A-Z\s]*$/.test(valorMayuscula)) {
                setDatosFormulario(prev => ({ ...prev, [name]: valorMayuscula }));
            }
            return;
        }

        if (['vehi_capacidad_carga', 'vehi_anio', 'vehi_capacidad'].includes(name)) {
            if (/^[0-9]*$/.test(value)) {
                setDatosFormulario(prev => ({ ...prev, [name]: value }));
            }
            return;
        }

        if (['vehi_chasis', 'vehi_motor'].includes(name)) {
            const valorMayuscula = value.toUpperCase();
            if (/^[A-Z0-9]*$/.test(valorMayuscula)) {
                setDatosFormulario(prev => ({ ...prev, [name]: valorMayuscula }));
            }
            return;
        }

        const camposTexto = ['vehi_marca', 'vehi_modelo', 'vehi_tipo', 'vehi_inventario', 'vehi_propietario', 'vehi_resolucion', 'vehi_lugaraparcamiento', 'vehi_poliza'];

        if (camposTexto.includes(name)) {
            const valorMayuscula = value.toUpperCase();
            if (/^[A-Z0-9\s\-/\.ÁÉÍÓÚÑÜ¡¿?!]*$/.test(valorMayuscula)) {
                setDatosFormulario(prev => ({ ...prev, [name]: valorMayuscula }));
            }
            return;
        }

        if (name === 'vehi_multas') {
            if (value.startsWith(' ')) return;
            if (/^[a-zA-Z0-9\s.,;:\-/"'?!¡¿@#&()ºáéíóúÁÉÍÓÚñÑüÜ]*$/.test(value)) {
                setDatosFormulario(prev => ({ ...prev, [name]: value }));
            }
            return;
        }

        setDatosFormulario(prev => ({ ...prev, [name]: value }));
    };

    const manejarEnvio = (e) => {
        e.preventDefault();

        const anioActual = new Date().getFullYear();
        const anioInput = parseInt(datosFormulario.vehi_anio);

        if (anioInput < 1980 || anioInput > anioActual + 1) {
            alError(`El año del vehículo debe estar entre 1980 y ${anioActual + 1}.`);
            return;
        }

        alEnviar(datosFormulario);
    };

    return (
        <form onSubmit={manejarEnvio} className="p-6 md:p-8 space-y-6 overflow-y-auto max-h-[85vh]">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex items-center justify-between mb-2">
                <div>
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wide block mb-1">Patente</label>
                    <input
                        type="text"
                        name="vehi_patente"
                        placeholder="ABCD12"
                        className="bg-transparent text-xl font-bold text-slate-800 placeholder:text-slate-300 outline-none uppercase w-full"
                        value={datosFormulario.vehi_patente}
                        onChange={manejarCambio}
                        disabled={!!inicial}
                        required
                    />
                    {!!inicial && <p className="text-[10px] text-slate-400 italic">No editable</p>}
                </div>
                <div className="flex flex-col items-end">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wide block mb-1">Estado</label>
                    {!inicial ? (
                        <div className="bg-emerald-100 text-emerald-700 px-3 py-1.5 rounded-lg text-sm font-bold border border-emerald-200 flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-emerald-500"></div> DISPONIBLE
                        </div>
                    ) : (
                        <select
                            name="vehi_estado"
                            className="bg-white px-3 py-1.5 border border-slate-200 rounded-lg text-sm font-bold text-slate-700 outline-none focus:border-blue-500"
                            value={datosFormulario.vehi_estado}
                            onChange={manejarCambio}
                        >
                            <option value="DISPONIBLE">🟢 Disponible</option>
                            <option value="MANTENCION">🟠 Mantenimiento</option>
                            <option value="DE BAJA">⚫ De Baja</option>
                        </select>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Tipo</label>
                    <input type="text" name="vehi_tipo" placeholder="Ej: MINIBUS" className="input-std" value={datosFormulario.vehi_tipo || ''} onChange={manejarCambio} required />
                </div>
                <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Marca</label>
                    <input type="text" name="vehi_marca" placeholder="Ej: MERCEDEZ BENZ" className="input-std" value={datosFormulario.vehi_marca} onChange={manejarCambio} required />
                </div>
                <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Modelo</label>
                    <input type="text" name="vehi_modelo" placeholder="Ej: SPRINTER" className="input-std" value={datosFormulario.vehi_modelo} onChange={manejarCambio} required />
                </div>
                <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Año</label>
                    <input type="text" inputMode="numeric" name="vehi_anio" placeholder="202X" className="input-std" value={datosFormulario.vehi_anio || ''} onChange={manejarCambio} maxLength={4} required />
                </div>
                <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Color</label>
                    <input type="text" name="vehi_color" placeholder="Blanco" className="input-std" value={datosFormulario.vehi_color || ''} onChange={manejarCambio} required />
                </div>
                <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Capacidad Pax</label>
                    <input type="text" inputMode="numeric" name="vehi_capacidad" placeholder="19" className="input-std" value={datosFormulario.vehi_capacidad} onChange={manejarCambio} required />
                </div>
            </div>


            <div className="pt-4 border-t border-slate-100">
                <h4 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2"><Info size={16} /> Datos Técnicos</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">N° Motor</label>
                        <input type="text" name="vehi_motor" className="input-std font-mono" value={datosFormulario.vehi_motor || ''} onChange={manejarCambio} required />
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">N° Chasis</label>
                        <input type="text" name="vehi_chasis" className="input-std font-mono" value={datosFormulario.vehi_chasis || ''} onChange={manejarCambio} required />
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Capacidad (kg-mt3)</label>
                        <input type="text" name="vehi_capacidad_carga" className="input-std" value={datosFormulario.vehi_capacidad_carga || ''} onChange={manejarCambio} required />
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">N° Inventario</label>
                        <input type="text" name="vehi_inventario" className="input-std font-mono" value={datosFormulario.vehi_inventario || ''} onChange={manejarCambio} required />
                    </div>
                </div>
            </div>


            <div className="pt-4 border-t border-slate-100">
                <h4 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2"><FileText size={16} /> Datos Administrativos</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2 space-y-1">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Propietario</label>
                        <input type="text" name="vehi_propietario" className="input-std" value={datosFormulario.vehi_propietario || ''} onChange={manejarCambio} required />
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Resolución Aparcamiento</label>
                        <input type="text" name="vehi_resolucion" className="input-std" value={datosFormulario.vehi_resolucion || ''} onChange={manejarCambio} required />
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Lugar Aparcamiento</label>
                        <input type="text" name="vehi_lugaraparcamiento" className="input-std" value={datosFormulario.vehi_lugaraparcamiento || ''} onChange={manejarCambio} required />
                    </div>
                    <div className="md:col-span-2 space-y-1">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">N° Póliza de Seguro</label>
                        <input type="text" name="vehi_poliza" className="input-std" value={datosFormulario.vehi_poliza || ''} onChange={manejarCambio} />
                    </div>
                    <div className="md:col-span-2 space-y-1">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Multas / Observaciones</label>
                        <textarea name="vehi_multas" className="input-std h-20" value={datosFormulario.vehi_multas || ''} onChange={manejarCambio}></textarea>
                    </div>
                </div>
            </div>

            <div className="pt-6 flex gap-3 justify-end border-t border-slate-100 mt-auto flex-shrink-0">
                <button
                    type="button"
                    onClick={alCancelar}
                    className="px-5 py-2.5 text-slate-600 hover:bg-slate-100 rounded-xl font-bold transition-colors"
                >
                    Cancelar
                </button>
                <button
                    type="submit"
                    className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-lg shadow-blue-500/20 transition-all flex items-center gap-2"
                    disabled={cargando}
                >
                    {cargando ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : <Save size={18} />}
                    Guardar
                </button>
            </div>
            <style>{`
                .input-std {
                    width: 100%;
                    padding: 0.6rem 1rem;
                    border: 1px solid #e2e8f0;
                    border-radius: 0.75rem;
                    font-size: 0.875rem;
                    line-height: 1.25rem;
                    color: #334155;
                    font-weight: 500;
                    outline: none;
                    transition: all 0.2s;
                }
                .input-std:focus {
                     border-color: #3b82f6;
                     box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
                }
            `}</style>
        </form>
    );
};

export default FormularioVehiculo;
