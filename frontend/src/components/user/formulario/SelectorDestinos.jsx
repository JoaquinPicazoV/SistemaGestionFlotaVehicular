import React, { useState, useEffect } from 'react';
import axios from 'axios';
import API_URL from '../../../config/api';
import { MapPin, Plus, XCircle, AlertCircle } from 'lucide-react';

const SelectorDestinos = ({ datos, alCambiar }) => {
    const [comunas, setComunas] = useState([]);
    const [destinoActual, setDestinoActual] = useState({ comuna_id: '', lugar_nombre: '', establecimiento_id: null });
    const [lugaresDisponibles, setLugaresDisponibles] = useState([]);
    const [tipoDestino, setTipoDestino] = useState('OFICIAL'); // 'OFICIAL' | 'OTRO'
    const [establecimientosDisponibles, setEstablecimientosDisponibles] = useState([]);

    // Cargar comunas al montar
    useEffect(() => {
        axios.get(`${API_URL}/comunas`, { withCredentials: true })
            .then(res => setComunas(res.data))
            .catch(err => console.error("Error cargando comunas", err));
    }, []);

    // Cargar lugares/establecimientos al cambiar comuna
    useEffect(() => {
        if (destinoActual.comuna_id) {
            // Cargar lugares para sugerencias (modo libre)
            axios.get(`${API_URL}/places?comuna_id=${destinoActual.comuna_id}`, { withCredentials: true })
                .then(res => setLugaresDisponibles(res.data))
                .catch(err => console.error("Error cargando lugares:", err));

            // Cargar establecimientos oficiales (modo estricto)
            axios.get(`${API_URL}/establishments?comuna_id=${destinoActual.comuna_id}`, { withCredentials: true })
                .then(res => setEstablecimientosDisponibles(res.data))
                .catch(err => console.error("Error cargando establecimientos:", err));
        } else {
            setLugaresDisponibles([]);
            setEstablecimientosDisponibles([]);
        }
    }, [destinoActual.comuna_id]);

    const obtenerNombreComuna = (id) => comunas.find(c => c.com_id == id)?.com_nombre || 'Desconocida';

    const agregarDestino = () => {
        if (!destinoActual.comuna_id) return;

        let nuevoDestino = { ...destinoActual };

        if (tipoDestino === 'OFICIAL') {
            if (!nuevoDestino.establecimiento_id) return;
            const est = establecimientosDisponibles.find(e => e.est_id == nuevoDestino.establecimiento_id);
            if (est) nuevoDestino.lugar_nombre = est.est_nombre;
        } else {
            if (!nuevoDestino.lugar_nombre.trim()) return;
            nuevoDestino.establecimiento_id = null;
        }

        alCambiar({
            ...datos,
            destinos: [...datos.destinos, nuevoDestino]
        });
        setDestinoActual({ comuna_id: '', lugar_nombre: '', establecimiento_id: null });
    };

    const eliminarDestino = (idx) => {
        alCambiar({
            ...datos,
            destinos: datos.destinos.filter((_, i) => i !== idx)
        });
    };

    return (
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden mt-6">
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 m-6">
                <label className="text-xs font-bold text-slate-500 uppercase flex items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2"><MapPin size={14} /> Destinos a visitar</div>
                    <div className="flex bg-slate-200 p-1 rounded-lg">
                        <button
                            type="button"
                            onClick={() => setTipoDestino('OFICIAL')}
                            className={`px-3 py-1 rounded-md text-[10px] uppercase font-bold transition-all ${tipoDestino === 'OFICIAL' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            Establecimiento
                        </button>
                        <button
                            type="button"
                            onClick={() => setTipoDestino('OTRO')}
                            className={`px-3 py-1 rounded-md text-[10px] uppercase font-bold transition-all ${tipoDestino === 'OTRO' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            Otro Lugar
                        </button>
                    </div>
                </label>

                <div className="flex flex-col md:flex-row gap-2 mb-3">
                    <select
                        className="w-full md:w-1/3 p-3 bg-white border border-slate-300 rounded-xl outline-none focus:border-blue-500 transition-all text-sm font-medium"
                        value={destinoActual.comuna_id}
                        onChange={e => setDestinoActual({ ...destinoActual, comuna_id: e.target.value, establecimiento_id: null, lugar_nombre: '' })}
                    >
                        <option value="">Comuna...</option>
                        {comunas.map(c => <option key={c.com_id} value={c.com_id}>{c.com_nombre}</option>)}
                    </select>

                    {tipoDestino === 'OFICIAL' ? (
                        <select
                            className="w-full md:flex-1 p-3 bg-white border border-slate-300 rounded-xl outline-none focus:border-blue-500 transition-all text-sm font-medium disabled:bg-slate-100 disabled:text-slate-400"
                            value={destinoActual.establecimiento_id || ''}
                            onChange={e => setDestinoActual({ ...destinoActual, establecimiento_id: e.target.value })}
                            disabled={!destinoActual.comuna_id}
                        >
                            <option value="">Selecciona Establecimiento...</option>
                            {establecimientosDisponibles.map(e => (
                                <option key={e.est_id} value={e.est_id}>{e.est_nombre}</option>
                            ))}
                        </select>
                    ) : (
                        <>
                            <input
                                type="text"
                                list="lugares-comuna"
                                placeholder="Lugar específico (Ej: Museo Regional)"
                                className="w-full md:flex-1 p-3 bg-white border border-slate-300 rounded-xl outline-none focus:border-blue-500 transition-all text-sm font-medium disabled:bg-slate-100 disabled:text-slate-400"
                                value={destinoActual.lugar_nombre}
                                onChange={e => {
                                    const val = e.target.value;
                                    if (val.startsWith(' ')) return;
                                    if (/^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑüÜ\s.,;:\-/"'?!¡¿@#&()º]*$/.test(val)) setDestinoActual({ ...destinoActual, lugar_nombre: val });
                                }}
                                onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), agregarDestino())}
                                disabled={!destinoActual.comuna_id}
                            />
                            <datalist id="lugares-comuna">
                                {lugaresDisponibles.map(l => (
                                    <option key={l.lug_id} value={l.lug_nombre} />
                                ))}
                            </datalist>
                        </>
                    )}

                    <button
                        type="button"
                        onClick={agregarDestino}
                        disabled={!destinoActual.comuna_id || (tipoDestino === 'OFICIAL' ? !destinoActual.establecimiento_id : !destinoActual.lugar_nombre)}
                        className="w-full md:w-auto px-4 py-3 md:py-0 bg-slate-800 disabled:bg-slate-300 text-white rounded-xl hover:bg-slate-700 transition-colors font-medium text-sm flex items-center justify-center gap-2 shadow-lg shadow-slate-900/10"
                    >
                        <Plus size={18} /> <span className="md:hidden">Agregar Destino</span>
                    </button>
                </div>
                <p className="text-[10px] text-blue-500 font-bold mb-3 pl-1 flex items-center gap-1">
                    <AlertCircle size={12} /> Recuerda presionar el botón "+" para guardar el destino en la lista.
                </p>

                {datos.destinos.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                        {datos.destinos.map((d, idx) => (
                            <div key={idx} className="flex items-center gap-2 pl-3 pr-2 py-2 bg-blue-100/50 text-blue-800 rounded-lg border border-blue-200/50 shadow-sm animate-in fade-in zoom-in-95">
                                <MapPin size={14} className="text-blue-500" />
                                <span className="text-sm font-bold">{d.lugar_nombre}</span>
                                <span className="text-xs opacity-60 font-medium tracking-wide">({obtenerNombreComuna(d.comuna_id)})</span>
                                <button type="button" onClick={() => eliminarDestino(idx)} className="p-1 hover:bg-white rounded-md transition-colors text-blue-400 hover:text-red-500 ml-1"><XCircle size={14} /></button>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-xs text-slate-400 italic text-center py-2">Agrega al menos un destino.</div>
                )}
            </div>
        </div>
    );
};

export default SelectorDestinos;
