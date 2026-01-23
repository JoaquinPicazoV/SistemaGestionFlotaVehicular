import React, { useState, useEffect } from 'react';
import axios from 'axios';
import API_URL from '../../../config/api';
import { User, Users, Plus, Trash2, AlertCircle } from 'lucide-react';

const ListaPasajeros = ({ datos, alCambiar }) => {
    const [nombrePasajero, setNombrePasajero] = useState('');
    const [tipoPasajero, setTipoPasajero] = useState('1');
    const [tiposPasajero, setTiposPasajero] = useState([]);

    useEffect(() => {
        axios.get(`${API_URL}/passenger-types`, { withCredentials: true })
            .then(res => setTiposPasajero(res.data))
            .catch(err => console.error("Error obteniendo tipos pasajero", err));
    }, []);

    const agregarPasajero = () => {
        if (!nombrePasajero.trim()) return;
        alCambiar({
            ...datos,
            pasajeros: [...datos.pasajeros, { nombre: nombrePasajero, tipo: parseInt(tipoPasajero) }]
        });
        setNombrePasajero('');
    };

    const eliminarPasajero = (idx) => {
        alCambiar({
            ...datos,
            pasajeros: datos.pasajeros.filter((_, i) => i !== idx)
        });
    };

    return (
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden mt-6">
            <div className="bg-slate-50/50 px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold">3</div>
                    <h3 className="font-bold text-slate-800 uppercase text-sm tracking-wide">Nómina de Ocupantes</h3>
                </div>
                <span className="text-xs font-bold bg-slate-200 text-slate-600 px-2 py-1 rounded-md">{datos.pasajeros.length} Personas</span>
            </div>
            <div className="p-6">
                <div className="flex flex-col md:flex-row gap-3 mb-6 bg-slate-50 p-4 rounded-2xl border border-slate-100 shadow-inner">
                    <div className="flex-1 relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                        <input
                            type="text"
                            placeholder="Nombre Completo del Pasajero"
                            className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm"
                            value={nombrePasajero}
                            onChange={e => {
                                const val = e.target.value;
                                if (val.startsWith(' ')) return;
                                if (/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]*$/.test(val)) setNombrePasajero(val);
                            }}
                            onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), agregarPasajero())}
                        />
                    </div>
                    <div className="flex gap-2">
                        <select
                            className="w-40 px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 focus:outline-none focus:border-blue-500 cursor-pointer shadow-sm"
                            value={tipoPasajero}
                            onChange={e => setTipoPasajero(e.target.value)}
                        >
                            {tiposPasajero.length > 0 ? (
                                tiposPasajero.map(tipo => (
                                    <option key={tipo.tip_id} value={tipo.tip_id}>{tipo.tip_nombre}</option>
                                ))
                            ) : (
                                <>
                                    <option value="1">Funcionario</option>
                                    <option value="2">Alumno</option>
                                </>
                            )}
                        </select>
                        <button
                            type="button"
                            onClick={agregarPasajero}
                            disabled={!nombrePasajero.trim()}
                            className="px-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-blue-500/20 flex items-center disabled:opacity-50 disabled:shadow-none"
                        >
                            <Plus size={24} />
                        </button>
                    </div>
                </div>
                <p className="text-[10px] text-blue-500 font-bold mb-4 pl-1 flex items-center gap-1 -mt-4">
                    <AlertCircle size={12} /> Has click en el "+" para añadir a la persona a la lista.
                </p>

                {datos.pasajeros.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                        {datos.pasajeros.map((p, idx) => {
                            const tipoInfo = tiposPasajero.find(t => t.tip_id === p.tipo);
                            const label = tipoInfo ? tipoInfo.tip_nombre.substring(0, 3).toUpperCase() : 'OTR';
                            const full = tipoInfo ? tipoInfo.tip_nombre : 'Otro';

                            const colorMap = {
                                1: { color: '#4338ca', bg: 'bg-indigo-50', text: 'text-indigo-700' },
                                2: { color: '#ea580c', bg: 'bg-orange-50', text: 'text-orange-700' },
                                3: { color: '#059669', bg: 'bg-emerald-50', text: 'text-emerald-700' },
                                4: { color: '#64748b', bg: 'bg-slate-50', text: 'text-slate-700' }
                            };
                            const conf = colorMap[p.tipo] || colorMap[4];
                            const finalConf = { ...conf, label, full };

                            return (
                                <div key={idx} className="flex items-center justify-between p-3 bg-white border border-slate-100 rounded-xl shadow-sm hover:shadow-md transition-all group border-l-4" style={{ borderLeftColor: finalConf.color }}>
                                    <div className="flex items-center gap-3">
                                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-xs font-black tracking-tighter ${finalConf.bg} ${finalConf.text}`}>
                                            {finalConf.label}
                                        </div>
                                        <div>
                                            <div className="text-sm font-bold text-slate-800">{p.nombre}</div>
                                            <div className="text-[10px] uppercase font-bold text-slate-400">{finalConf.full}</div>
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => eliminarPasajero(idx)}
                                        className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="text-center py-10 border-2 border-dashed border-slate-100 rounded-2xl">
                        <div className="text-slate-300 mb-2"><Users size={48} className="mx-auto" /></div>
                        <p className="text-slate-400 font-medium">La lista de pasajeros está vacía.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ListaPasajeros;
