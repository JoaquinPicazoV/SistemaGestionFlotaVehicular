import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import API_URL from '../config/api';
import {
    ChevronRight,
    Sparkles,
    CheckCircle2,
    Bus,
    Briefcase,
    User,
    MapPin,
    Plus,
    XCircle,
    Users,
    Trash2,
    ArrowRight
} from 'lucide-react';

const UserRequestForm = ({ alCancelar, alCompletar }) => {


    const [comunas, setComunas] = useState([]);
    const [tiposPasajero, setTiposPasajero] = useState([]);
    const [enviando, setEnviando] = useState(false);
    const [mensajeExito, setMensajeExito] = useState('');
    const submittingRef = useRef(false); // Ref para evitar doble click instantáneo

    // Estado del Formulario
    const [datosFormulario, setDatosFormulario] = useState({
        sol_fechasalida: '',
        sol_timesalida: '',
        sol_fechallegada: '',
        sol_timeallegada: '',
        sol_motivo: '',
        sol_itinerario: '',
        sol_nombresolicitante: '',
        sol_tipo: 'PEDAGOGICA',
        sol_requierechofer: true,
        pasajeros: [],
        destinos: []
    });

    const [nombrePasajero, setNombrePasajero] = useState('');
    const [tipoPasajero, setTipoPasajero] = useState('1');
    const [destinoActual, setDestinoActual] = useState({ comuna_id: '', lugar_nombre: '' });
    const [lugaresDisponibles, setLugaresDisponibles] = useState([]);

    useEffect(() => {
        if (destinoActual.comuna_id) {
            axios.get(`${API_URL}/places?comuna_id=${destinoActual.comuna_id}`, { withCredentials: true })
                .then(res => setLugaresDisponibles(res.data))
                .catch(err => console.error("Error cargando lugares:", err));
        } else {
            setLugaresDisponibles([]);
        }
    }, [destinoActual.comuna_id]);

    useEffect(() => {
        const obtenerDatosIniciales = async () => {
            try {
                const [resComunas, resTipos] = await Promise.all([
                    axios.get(`${API_URL}/comunas`, { withCredentials: true }),
                    axios.get(`${API_URL}/passenger-types`, { withCredentials: true })
                ]);
                setComunas(resComunas.data);
                setTiposPasajero(resTipos.data);
            } catch (error) {
                console.error("Error obteniendo datos iniciales", error);
            }
        };

        obtenerDatosIniciales();
    }, [API_URL]);

    const obtenerNombreComuna = (id) => comunas.find(c => c.com_id == id)?.com_nombre || 'Desconocida';

    const agregarPasajero = () => {
        if (!nombrePasajero.trim()) return;
        setDatosFormulario(prev => ({
            ...prev,
            pasajeros: [...prev.pasajeros, { nombre: nombrePasajero, tipo: parseInt(tipoPasajero) }]
        }));
        setNombrePasajero('');
    };

    const eliminarPasajero = (idx) => {
        setDatosFormulario(prev => ({
            ...prev,
            pasajeros: prev.pasajeros.filter((_, i) => i !== idx)
        }));
    };

    const agregarDestino = () => {
        if (!destinoActual.comuna_id || !destinoActual.lugar_nombre.trim()) return;
        setDatosFormulario(prev => ({
            ...prev,
            destinos: [...prev.destinos, { ...destinoActual }]
        }));
        setDestinoActual({ comuna_id: '', lugar_nombre: '' });
    };

    const eliminarDestino = (idx) => {
        setDatosFormulario(prev => ({
            ...prev,
            destinos: prev.destinos.filter((_, i) => i !== idx)
        }));
    };

    const manejarEnvio = async (e) => {
        e.preventDefault();

        // Evitar doble click inmediato
        if (submittingRef.current) return;
        submittingRef.current = true;

        setEnviando(true);
        setMensajeExito('');

        try {
            const fechaSalida = `${datosFormulario.sol_fechasalida} ${datosFormulario.sol_timesalida}:00`;
            const fechaLlegada = `${datosFormulario.sol_fechallegada} ${datosFormulario.sol_timeallegada}:00`;

            const payload = {
                sol_fechasalida: fechaSalida,
                sol_fechallegada: fechaLlegada,
                sol_motivo: datosFormulario.sol_motivo,
                sol_itinerario: datosFormulario.sol_itinerario,
                sol_nombresolicitante: datosFormulario.sol_nombresolicitante,
                sol_tipo: datosFormulario.sol_tipo,
                sol_requierechofer: datosFormulario.sol_tipo === 'COMETIDO' ? datosFormulario.sol_requierechofer : true,
                pasajeros: datosFormulario.pasajeros,
                destinos: datosFormulario.destinos
            };

            // "Congelar" por 2 segundos para evitar duplicados (UX Request)
            await Promise.all([
                axios.post(`${API_URL}/requests`, payload, { withCredentials: true }),
                new Promise(resolve => setTimeout(resolve, 2000))
            ]);

            setMensajeExito('Solicitud Registrada Correctamente');
            setDatosFormulario({
                sol_fechasalida: '',
                sol_timesalida: '',
                sol_fechallegada: '',
                sol_timeallegada: '',
                sol_motivo: '',
                sol_itinerario: '',
                sol_nombresolicitante: '',
                sol_tipo: 'PEDAGOGICA',
                sol_requierechofer: true,
                pasajeros: [],
                destinos: []
            });

            setTimeout(() => {
                setMensajeExito('');
                if (alCompletar) alCompletar();
            }, 2500);

        } catch (error) {
            console.error("Error creando solicitud:", error);
            alert("Hubo un error al crear la solicitud.");
        } finally {
            setEnviando(false);
            submittingRef.current = false;
        }
    };

    return (
        <div className="max-w-4xl mx-auto animate-in fade-in zoom-in-95 duration-500">
            {/* Cabecera Título */}
            <div className="flex items-center gap-4 mb-8">
                <button
                    onClick={alCancelar}
                    className="w-10 h-10 flex items-center justify-center bg-white border border-slate-200 rounded-full text-slate-400 hover:text-blue-600 hover:border-blue-200 shadow-sm transition-all"
                >
                    <ChevronRight className="rotate-180" size={24} />
                </button>
                <div>
                    <h2 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
                        Nueva Solicitud <Sparkles size={18} className="text-amber-400" />
                    </h2>
                    <p className="text-slate-500 text-sm">Ingresa los detalles para programar tu viaje.</p>
                </div>
            </div>

            {mensajeExito && (
                <div className="mb-8 p-4 bg-emerald-50 border-2 border-emerald-100 text-emerald-800 rounded-2xl flex items-center gap-3 shadow-lg shadow-emerald-500/10 animate-fade-in-down">
                    <div className="p-2 bg-emerald-100 rounded-full"><CheckCircle2 size={24} className="text-emerald-600" /></div>
                    <div>
                        <div className="font-bold text-lg">¡Solicitud Exitosa!</div>
                        <div className="text-emerald-700 text-sm">{mensajeExito}</div>
                    </div>
                </div>
            )}

            <form onSubmit={manejarEnvio} className="space-y-6 pb-20">

                <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="bg-slate-50/50 px-6 py-4 border-b border-slate-100 flex items-center gap-2">
                        <div className="bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold">1</div>
                        <h3 className="font-bold text-slate-800 uppercase text-sm tracking-wide">Tipo de Servicio</h3>
                    </div>
                    <div className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div
                                onClick={() => setDatosFormulario({ ...datosFormulario, sol_tipo: 'PEDAGOGICA', sol_requierechofer: true })}
                                className={`cursor-pointer group relative overflow-hidden p-6 rounded-2xl border-2 transition-all duration-300 ${datosFormulario.sol_tipo === 'PEDAGOGICA'
                                    ? 'border-blue-500 bg-blue-50 shadow-md shadow-blue-100'
                                    : 'border-slate-100 hover:border-blue-300 hover:bg-slate-50 bg-white'}`}
                            >
                                <div className="flex flex-col items-center text-center gap-4 relative z-10">
                                    <div className={`p-4 rounded-full transition-all duration-300 ${datosFormulario.sol_tipo === 'PEDAGOGICA' ? 'bg-blue-500 text-white scale-110 shadow-lg shadow-blue-500/30' : 'bg-slate-100 text-slate-400 group-hover:bg-blue-100 group-hover:text-blue-500'}`}>
                                        <Bus size={32} />
                                    </div>
                                    <div>
                                        <div className={`font-bold text-lg mb-1 ${datosFormulario.sol_tipo === 'PEDAGOGICA' ? 'text-blue-900' : 'text-slate-700'}`}>Salida Pedagógica</div>
                                        <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-white/60 text-slate-500">Alumnos + Docentes</span>
                                    </div>
                                </div>
                            </div>

                            <div
                                onClick={() => setDatosFormulario({ ...datosFormulario, sol_tipo: 'COMETIDO' })}
                                className={`cursor-pointer group relative overflow-hidden p-6 rounded-2xl border-2 transition-all duration-300 ${datosFormulario.sol_tipo === 'COMETIDO'
                                    ? 'border-indigo-500 bg-indigo-50 shadow-md shadow-indigo-100'
                                    : 'border-slate-100 hover:border-indigo-300 hover:bg-slate-50 bg-white'}`}
                            >
                                <div className="flex flex-col items-center text-center gap-4 relative z-10">
                                    <div className={`p-4 rounded-full transition-all duration-300 ${datosFormulario.sol_tipo === 'COMETIDO' ? 'bg-indigo-500 text-white scale-110 shadow-lg shadow-indigo-500/30' : 'bg-slate-100 text-slate-400 group-hover:bg-indigo-100 group-hover:text-indigo-500'}`}>
                                        <Briefcase size={32} />
                                    </div>
                                    <div>
                                        <div className={`font-bold text-lg mb-1 ${datosFormulario.sol_tipo === 'COMETIDO' ? 'text-indigo-900' : 'text-slate-700'}`}>Cometido Funcionario</div>
                                        <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-white/60 text-slate-500">Gestiones / Traslados</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {datosFormulario.sol_tipo === 'COMETIDO' && (
                            <div className="mt-6 p-4 rounded-xl bg-gradient-to-r from-slate-50 to-white border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4 animate-in fade-in slide-in-from-top-2">
                                <div className="flex items-center gap-4">
                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-sm ${datosFormulario.sol_requierechofer ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-200 text-slate-400'}`}>
                                        <User size={24} />
                                    </div>
                                    <div>
                                        <div className="text-sm font-bold text-slate-900">Servicio de Conductor</div>
                                        <div className="text-xs text-slate-500">Habilita esta opción si necesitas chofer profesional.</div>
                                    </div>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input type="checkbox" className="sr-only peer" checked={datosFormulario.sol_requierechofer} onChange={e => setDatosFormulario({ ...datosFormulario, sol_requierechofer: e.target.checked })} />
                                    <div className="w-14 h-7 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-indigo-600"></div>
                                    <span className="ml-3 text-sm font-medium text-slate-700">{datosFormulario.sol_requierechofer ? 'SI' : 'NO'}</span>
                                </label>
                            </div>
                        )}
                    </div>
                </div>

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
                                            value={datosFormulario.sol_fechasalida}
                                            onChange={e => setDatosFormulario({ ...datosFormulario, sol_fechasalida: e.target.value })}
                                            min={new Date().toISOString().split('T')[0]}
                                        />
                                    </div>
                                    <div className="w-32 space-y-1">
                                        <input
                                            type="time"
                                            required
                                            className="w-full bg-white p-3 rounded-xl border border-emerald-100 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all shadow-sm text-center"
                                            value={datosFormulario.sol_timesalida}
                                            onChange={e => setDatosFormulario({ ...datosFormulario, sol_timesalida: e.target.value })}
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
                                            value={datosFormulario.sol_fechallegada}
                                            onChange={e => setDatosFormulario({ ...datosFormulario, sol_fechallegada: e.target.value })}
                                            min={datosFormulario.sol_fechasalida || new Date().toISOString().split('T')[0]}
                                        />
                                    </div>
                                    <div className="w-32 space-y-1">
                                        <input
                                            type="time"
                                            required
                                            className="w-full bg-white p-3 rounded-xl border border-red-100 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none transition-all shadow-sm text-center"
                                            value={datosFormulario.sol_timeallegada}
                                            onChange={e => setDatosFormulario({ ...datosFormulario, sol_timeallegada: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-5">
                            <div className="relative group">
                                <label className="absolute -top-2.5 left-3 bg-white px-1 text-xs font-bold text-blue-600 uppercase tracking-widest z-10">Solicitante Responsable</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="Nombre completo del responsable..."
                                    className="w-full p-4 bg-white border border-slate-300 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-medium text-slate-800 placeholder:text-slate-300 text-base"
                                    value={datosFormulario.sol_nombresolicitante}
                                    onChange={e => setDatosFormulario({ ...datosFormulario, sol_nombresolicitante: e.target.value })}
                                />
                            </div>

                            <div className="relative group">
                                <label className="absolute -top-2.5 left-3 bg-white px-1 text-xs font-bold text-blue-600 uppercase tracking-widest z-10">Motivo Principal</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="Describe el motivo principal del viaje..."
                                    className="w-full p-4 bg-white border border-slate-300 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-medium text-slate-800 placeholder:text-slate-300 text-base"
                                    value={datosFormulario.sol_motivo}
                                    onChange={e => setDatosFormulario({ ...datosFormulario, sol_motivo: e.target.value })}
                                />
                            </div>

                            <div className="relative group">
                                <label className="absolute -top-2.5 left-3 bg-white px-1 text-xs font-bold text-blue-600 uppercase tracking-widest z-10">Detalle del Itinerario</label>
                                <textarea
                                    required
                                    placeholder="Ej: Salida desde escuela a las 08:00, primera parada en museo, regreso 16:00..."
                                    className="w-full p-4 bg-white border border-slate-300 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-medium text-slate-800 placeholder:text-slate-300 min-h-[120px] text-base resize-none"
                                    value={datosFormulario.sol_itinerario}
                                    onChange={e => setDatosFormulario({ ...datosFormulario, sol_itinerario: e.target.value })}
                                />
                            </div>

                            {/* Destinos */}
                            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                                <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2 mb-3">
                                    <MapPin size={14} /> Destinos a visitar
                                </label>

                                <div className="flex flex-col md:flex-row gap-2 mb-3">
                                    <select
                                        className="w-full md:w-1/3 p-3 bg-white border border-slate-300 rounded-xl outline-none focus:border-blue-500 transition-all text-sm font-medium"
                                        value={destinoActual.comuna_id}
                                        onChange={e => setDestinoActual({ ...destinoActual, comuna_id: e.target.value })}
                                    >
                                        <option value="">Comuna...</option>
                                        {comunas.map(c => <option key={c.com_id} value={c.com_id}>{c.com_nombre}</option>)}
                                    </select>
                                    <input
                                        type="text"
                                        list="lugares-comuna"
                                        placeholder="Lugar específico (Ej: Museo Regional)"
                                        className="w-full md:flex-1 p-3 bg-white border border-slate-300 rounded-xl outline-none focus:border-blue-500 transition-all text-sm font-medium"
                                        value={destinoActual.lugar_nombre}
                                        onChange={e => setDestinoActual({ ...destinoActual, lugar_nombre: e.target.value })}
                                        onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), agregarDestino())}
                                    />
                                    <datalist id="lugares-comuna">
                                        {lugaresDisponibles.map(l => (
                                            <option key={l.lug_id} value={l.lug_nombre} />
                                        ))}
                                    </datalist>
                                    <button
                                        type="button"
                                        onClick={agregarDestino}
                                        disabled={!destinoActual.comuna_id || !destinoActual.lugar_nombre}
                                        className="w-full md:w-auto px-4 py-3 md:py-0 bg-slate-800 disabled:bg-slate-300 text-white rounded-xl hover:bg-slate-700 transition-colors font-medium text-sm flex items-center justify-center gap-2"
                                    >
                                        <Plus size={18} /> <span className="md:hidden">Agregar Destino</span>
                                    </button>
                                </div>

                                {datosFormulario.destinos.length > 0 ? (
                                    <div className="flex flex-wrap gap-2">
                                        {datosFormulario.destinos.map((d, idx) => (
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
                    </div>
                </div>

                <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="bg-slate-50/50 px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold">3</div>
                            <h3 className="font-bold text-slate-800 uppercase text-sm tracking-wide">Nómina de Ocupantes</h3>
                        </div>
                        <span className="text-xs font-bold bg-slate-200 text-slate-600 px-2 py-1 rounded-md">{datosFormulario.pasajeros.length} Personas</span>
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
                                    onChange={e => setNombrePasajero(e.target.value)}
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

                        {datosFormulario.pasajeros.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                                {datosFormulario.pasajeros.map((p, idx) => {
                                    const tipoInfo = tiposPasajero.find(t => t.tip_id === p.tipo);
                                    const label = tipoInfo ? tipoInfo.tip_nombre.substring(0, 3).toUpperCase() : 'OTR';
                                    const full = tipoInfo ? tipoInfo.tip_nombre : 'Otro';

                                    // Dynamic styling based on ID (cycling through colors)
                                    const colorMap = {
                                        1: { color: '#4338ca', bg: 'bg-indigo-50', text: 'text-indigo-700' }, // Funcionario
                                        2: { color: '#ea580c', bg: 'bg-orange-50', text: 'text-orange-700' }, // Alumno
                                        3: { color: '#059669', bg: 'bg-emerald-50', text: 'text-emerald-700' }, // Docente
                                        4: { color: '#64748b', bg: 'bg-slate-50', text: 'text-slate-700' } // Otro
                                    };
                                    const conf = colorMap[p.tipo] || colorMap[4];

                                    // Override labels with dynamic data
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

                <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/80 backdrop-blur-md border-t border-slate-200 z-40 flex justify-center shadow-[0_-10px_40px_rgba(0,0,0,0.1)]">
                    <div className="w-full max-w-4xl flex items-center justify-between gap-4">
                        <div className="hidden md:block text-slate-500 text-sm font-medium">
                            Revisa todos los datos antes de confirmar.
                        </div>
                        <button
                            type="submit"
                            disabled={enviando || datosFormulario.pasajeros.length === 0 || datosFormulario.destinos.length === 0}
                            className="flex-1 md:flex-none md:w-96 py-4 bg-gradient-to-r from-slate-900 to-slate-800 hover:from-black hover:to-slate-900 text-white font-bold text-lg rounded-2xl shadow-xl shadow-slate-900/20 transition-all transform active:scale-[0.98] disabled:opacity-50 disabled:shadow-none flex items-center justify-center gap-3"
                        >
                            {enviando ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Enviando...
                                </>
                            ) : (
                                <>
                                    Confirmar Reserva <ArrowRight size={20} />
                                </>
                            )}
                        </button>
                    </div>
                </div>

            </form>
        </div>
    );
};

export default UserRequestForm;
