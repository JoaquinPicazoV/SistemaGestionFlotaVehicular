import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import API_URL from '../../config/api';
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
    ArrowRight,
    AlertCircle,
    ShieldCheck
} from 'lucide-react';

const AdminExpressForm = ({ alCancelar, alCompletar }) => {

    const [comunas, setComunas] = useState([]);
    const [tiposPasajero, setTiposPasajero] = useState([]);
    const [vehiculos, setVehiculos] = useState([]);
    const [choferes, setChoferes] = useState([]);
    const [unidades, setUnidades] = useState([]);

    const [enviando, setEnviando] = useState(false);
    const [mensajeExito, setMensajeExito] = useState('');
    const [mensajeError, setMensajeError] = useState('');
    const peticionEnCurso = useRef(false);


    const [datosFormulario, setDatosFormulario] = useState({
        sol_fechasalida: '',
        sol_timesalida: '',
        sol_fechallegada: '',
        sol_timeallegada: '',
        sol_motivo: '',
        sol_itinerario: '',
        sol_unidad: '',
        sol_nombresolicitante: '',
        sol_tipo: 'PEDAGOGICA',
        sol_requierechofer: true,
        sol_kmestimado: '',
        pasajeros: [],
        destinos: [],

        sol_patentevehiculofk: '',
        sol_correochoferfk: ''
    });

    const [nombrePasajero, setNombrePasajero] = useState('');
    const [tipoPasajero, setTipoPasajero] = useState('1');
    const [destinoActual, setDestinoActual] = useState({ comuna_id: '', lugar_nombre: '', establecimiento_id: null });
    const [lugaresDisponibles, setLugaresDisponibles] = useState([]);
    const [tipoDestino, setTipoDestino] = useState('OFICIAL');
    const [establecimientosDisponibles, setEstablecimientosDisponibles] = useState([]);

    useEffect(() => {
        if (destinoActual.comuna_id) {
            axios.get(`${API_URL}/places?comuna_id=${destinoActual.comuna_id}`, { withCredentials: true })
                .then(res => setLugaresDisponibles(res.data))
                .catch(err => console.error("Error cargando lugares:", err));

            axios.get(`${API_URL}/establishments?comuna_id=${destinoActual.comuna_id}`, { withCredentials: true })
                .then(res => setEstablecimientosDisponibles(res.data))
                .catch(err => console.error("Error cargando establecimientos:", err));
        } else {
            setLugaresDisponibles([]);
            setEstablecimientosDisponibles([]);
        }
    }, [destinoActual.comuna_id]);

    useEffect(() => {
        const obtenerDatosIniciales = async () => {
            try {
                const [resComunas, resTipos, resVehiculos, resChoferes, resUnidades] = await Promise.all([
                    axios.get(`${API_URL}/comunas`, { withCredentials: true }),
                    axios.get(`${API_URL}/passenger-types`, { withCredentials: true }),
                    axios.get(`${API_URL}/vehicles`, { withCredentials: true }),
                    axios.get(`${API_URL}/drivers`, { withCredentials: true }),
                    axios.get(`${API_URL}/units`, { withCredentials: true })
                ]);
                setComunas(resComunas.data);
                setTiposPasajero(resTipos.data);
                setVehiculos(resVehiculos.data.filter(v => v.vehi_estado === 'DISPONIBLE' || v.vehi_estado === 'EN RUTA'));
                setChoferes(resChoferes.data.filter(d => d.cho_activo === 1));
                setUnidades(resUnidades.data);
            } catch (error) {
                console.error("Error obteniendo datos iniciales", error);
            }
        };

        obtenerDatosIniciales();
    }, []);

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

        setDatosFormulario(prev => ({
            ...prev,
            destinos: [...prev.destinos, nuevoDestino]
        }));
        setDestinoActual({ comuna_id: '', lugar_nombre: '', establecimiento_id: null });
    };

    const eliminarDestino = (idx) => {
        setDatosFormulario(prev => ({
            ...prev,
            destinos: prev.destinos.filter((_, i) => i !== idx)
        }));
    };

    const manejarEnvio = async (e) => {
        e.preventDefault();
        if (peticionEnCurso.current) return;
        peticionEnCurso.current = true;
        setEnviando(true);
        setMensajeExito('');
        setMensajeError('');

        try {
            const fechaSalida = `${datosFormulario.sol_fechasalida} ${datosFormulario.sol_timesalida}:00`;
            const fechaLlegada = `${datosFormulario.sol_fechallegada} ${datosFormulario.sol_timeallegada}:00`;

            const dSalida = new Date(fechaSalida);
            const dLlegada = new Date(fechaLlegada);

            if (!datosFormulario.sol_unidad) {
                setMensajeError("Debe seleccionar una unidad solicitante.");
                setEnviando(false);
                peticionEnCurso.current = false;
                return;
            }

            if (dSalida >= dLlegada) {
                setMensajeError("La fecha y hora de llegada debe ser posterior a la de salida.");
                setEnviando(false);
                peticionEnCurso.current = false;
                return;
            }

            const datosEnvio = {
                sol_fechasalida: fechaSalida,
                sol_fechallegada: fechaLlegada,
                sol_unidad: datosFormulario.sol_unidad,
                sol_motivo: datosFormulario.sol_motivo,
                sol_itinerario: datosFormulario.sol_itinerario,
                sol_nombresolicitante: datosFormulario.sol_nombresolicitante,
                sol_tipo: datosFormulario.sol_tipo,
                sol_requierechofer: datosFormulario.sol_tipo === 'COMETIDO' ? datosFormulario.sol_requierechofer : true,
                sol_kmestimado: datosFormulario.sol_kmestimado,
                pasajeros: datosFormulario.pasajeros,
                destinos: datosFormulario.destinos,

                sol_patentevehiculofk: datosFormulario.sol_patentevehiculofk,
                sol_correochoferfk: datosFormulario.sol_requierechofer ? datosFormulario.sol_correochoferfk : null
            };

            await axios.post(`${API_URL}/requests/admin`, datosEnvio, { withCredentials: true });

            setMensajeExito('Solicitud Express Creada y Aprobada Correctamente');

            setTimeout(() => {
                setMensajeExito('');
                if (alCompletar) alCompletar();
            }, 2500);

        } catch (error) {
            console.error("Error creando solicitud admin:", error);
            if (error.response && error.response.status === 409) {
                setMensajeError(error.response.data.error || "Conflicto de horario detectado.");
            } else {
                setMensajeError("Error al procesar la solicitud express.");
            }
        } finally {
            setEnviando(false);
            peticionEnCurso.current = false;
        }
    };

    return (
        <div className="max-w-4xl mx-auto pb-32">
            <div className="flex items-center gap-4 mb-8">
                <button onClick={alCancelar} className="w-10 h-10 flex items-center justify-center bg-white border border-slate-200 rounded-full text-slate-400 hover:text-blue-600 hover:border-blue-200 shadow-sm transition-all"><ChevronRight className="rotate-180" size={24} /></button>
                <div>
                    <h2 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">Solicitud Express <ShieldCheck size={24} className="text-emerald-500" /></h2>
                </div>
            </div>

            {mensajeExito && (
                <div className="mb-8 p-4 bg-emerald-50 border-2 border-emerald-100 text-emerald-800 rounded-2xl flex items-center gap-3 shadow-lg shadow-emerald-500/10">
                    <div className="p-2 bg-emerald-100 rounded-full"><CheckCircle2 size={24} className="text-emerald-600" /></div>
                    <div className="font-bold text-lg">{mensajeExito}</div>
                </div>
            )}

            {mensajeError && (
                <div className="mb-8 p-4 bg-red-50 border-2 border-red-100 text-red-800 rounded-2xl flex items-center gap-3 shadow-lg shadow-red-500/10" role="alert">
                    <div className="p-2 bg-red-100 rounded-full"><AlertCircle size={24} className="text-red-600" /></div>
                    <div>
                        <div className="font-bold text-lg">Error</div>
                        <div className="text-red-700 text-sm font-medium">{mensajeError}</div>
                    </div>
                </div>
            )}

            <form onSubmit={manejarEnvio} className="space-y-6">


                <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="bg-slate-50/50 px-6 py-4 border-b border-slate-100 flex items-center gap-2">
                        <div className="bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold">1</div>
                        <h3 className="font-bold text-slate-800 uppercase text-sm tracking-wide">Tipo de Servicio</h3>
                    </div>
                    <div className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <button type="button" onClick={() => setDatosFormulario({ ...datosFormulario, sol_tipo: 'PEDAGOGICA', sol_requierechofer: true })} className={`w-full text-left cursor-pointer group relative overflow-hidden p-6 rounded-2xl border-2 transition-all duration-300 ${datosFormulario.sol_tipo === 'PEDAGOGICA' ? 'border-blue-500 bg-blue-50 shadow-md shadow-blue-100' : 'border-slate-100 hover:border-blue-300 hover:bg-slate-50 bg-white'}`}>
                                <div className="flex flex-col items-center text-center gap-4 relative z-10">
                                    <div className={`p-4 rounded-full transition-all duration-300 ${datosFormulario.sol_tipo === 'PEDAGOGICA' ? 'bg-blue-500 text-white scale-110 shadow-lg shadow-blue-500/30' : 'bg-slate-100 text-slate-400 group-hover:bg-blue-100 group-hover:text-blue-500'}`}><Bus size={32} /></div>
                                    <div><div className={`font-bold text-lg mb-1 ${datosFormulario.sol_tipo === 'PEDAGOGICA' ? 'text-blue-900' : 'text-slate-700'}`}>Salida Pedagógica</div><span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-white/60 text-slate-500">Alumnos + Docentes</span></div>
                                </div>
                            </button>
                            <button type="button" onClick={() => setDatosFormulario({ ...datosFormulario, sol_tipo: 'COMETIDO' })} className={`w-full text-left cursor-pointer group relative overflow-hidden p-6 rounded-2xl border-2 transition-all duration-300 ${datosFormulario.sol_tipo === 'COMETIDO' ? 'border-indigo-500 bg-indigo-50 shadow-md shadow-indigo-100' : 'border-slate-100 hover:border-indigo-300 hover:bg-slate-50 bg-white'}`}>
                                <div className="flex flex-col items-center text-center gap-4 relative z-10">
                                    <div className={`p-4 rounded-full transition-all duration-300 ${datosFormulario.sol_tipo === 'COMETIDO' ? 'bg-indigo-500 text-white scale-110 shadow-lg shadow-indigo-500/30' : 'bg-slate-100 text-slate-400 group-hover:bg-indigo-100 group-hover:text-indigo-500'}`}><Briefcase size={32} /></div>
                                    <div><div className={`font-bold text-lg mb-1 ${datosFormulario.sol_tipo === 'COMETIDO' ? 'text-indigo-900' : 'text-slate-700'}`}>Cometido Funcionario</div><span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-white/60 text-slate-500">Gestiones / Traslados</span></div>
                                </div>
                            </button>
                        </div>
                        <div className="mt-6 p-4 rounded-xl bg-gradient-to-r from-slate-50 to-white border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div className="flex items-center gap-4"><div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-sm ${datosFormulario.sol_requierechofer ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-200 text-slate-400'}`}><User size={24} /></div><div><div className="text-sm font-bold text-slate-900">Servicio de Conductor</div><div className="text-xs text-slate-500">Habilita esta opción si necesitas chofer del servicio.</div></div></div>
                            <label className="relative inline-flex items-center cursor-pointer"><input type="checkbox" className="sr-only peer" checked={datosFormulario.sol_requierechofer} onChange={e => setDatosFormulario({ ...datosFormulario, sol_requierechofer: e.target.checked })} /><div className="w-14 h-7 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-indigo-600"></div><span className="ml-3 text-sm font-medium text-slate-700">{datosFormulario.sol_requierechofer ? 'SI' : 'NO'}</span></label>
                        </div>
                    </div>
                </div>


                <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="bg-slate-50/50 px-6 py-4 border-b border-slate-100 flex items-center gap-2"><div className="bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold">2</div><h3 className="font-bold text-slate-800 uppercase text-sm tracking-wide">Itinerario y Motivo</h3></div>
                    <div className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                            <div className="p-4 rounded-2xl border border-emerald-100 bg-emerald-50/30">
                                <div className="flex items-center gap-2 mb-3 text-emerald-700 font-bold text-sm uppercase tracking-wide"><div className="w-2 h-2 rounded-full bg-emerald-500 shadow shadow-emerald-500/50"></div> Fecha Salida</div>
                                <div className="flex gap-3">
                                    <input
                                        type="date"
                                        required
                                        className="flex-1 bg-white p-3 rounded-xl border border-emerald-100 text-sm font-bold text-slate-700 outline-none"
                                        value={datosFormulario.sol_fechasalida}
                                        onChange={e => {
                                            const val = e.target.value;
                                            setDatosFormulario(prev => ({ ...prev, sol_fechasalida: val, sol_fechallegada: val > prev.sol_fechallegada ? val : prev.sol_fechallegada }));
                                        }}
                                    />
                                    <input
                                        type="time"
                                        required
                                        className="w-32 bg-white p-3 rounded-xl border border-emerald-100 text-sm font-bold text-slate-700 outline-none text-center"
                                        value={datosFormulario.sol_timesalida}
                                        onChange={e => {
                                            const val = e.target.value;
                                            if (datosFormulario.sol_fechasalida === datosFormulario.sol_fechallegada && datosFormulario.sol_timeallegada && val >= datosFormulario.sol_timeallegada) {
                                                setDatosFormulario(prev => ({ ...prev, sol_timesalida: val, sol_timeallegada: '' }));
                                            } else {
                                                setDatosFormulario(prev => ({ ...prev, sol_timesalida: val }));
                                            }
                                        }}
                                    />
                                </div>
                            </div>
                            <div className="p-4 rounded-2xl border border-red-100 bg-red-50/30">
                                <div className="flex items-center gap-2 mb-3 text-red-700 font-bold text-sm uppercase tracking-wide"><div className="w-2 h-2 rounded-full bg-red-500 shadow shadow-red-500/50"></div> Fecha Regreso</div>
                                <div className="flex gap-3">
                                    <input
                                        type="date"
                                        required
                                        className="flex-1 bg-white p-3 rounded-xl border border-red-100 text-sm font-bold text-slate-700 outline-none"
                                        value={datosFormulario.sol_fechallegada}
                                        onChange={e => setDatosFormulario(prev => ({ ...prev, sol_fechallegada: e.target.value }))}
                                        min={datosFormulario.sol_fechasalida}
                                    />
                                    <input
                                        type="time"
                                        required
                                        className="w-32 bg-white p-3 rounded-xl border border-red-100 text-sm font-bold text-slate-700 outline-none text-center"
                                        value={datosFormulario.sol_timeallegada}
                                        onChange={e => setDatosFormulario(prev => ({ ...prev, sol_timeallegada: e.target.value }))}
                                    />
                                </div>
                                {datosFormulario.sol_fechasalida === datosFormulario.sol_fechallegada &&
                                    datosFormulario.sol_timesalida &&
                                    datosFormulario.sol_timeallegada < datosFormulario.sol_timesalida && (
                                        <div className="mt-2 text-xs font-bold text-red-500 flex items-center gap-1">
                                            <AlertCircle size={12} /> Hora inválida (anterior a salida)
                                        </div>
                                    )}
                            </div>
                        </div>
                        <div className="space-y-5">
                            <div className="relative group">
                                <label className="absolute -top-2.5 left-3 bg-white px-1 text-xs font-bold text-blue-600 uppercase tracking-widest z-10">Unidad Solicitante</label>
                                <select
                                    required
                                    className="w-full p-4 bg-white border border-slate-300 rounded-xl outline-none font-medium text-slate-800"
                                    value={datosFormulario.sol_unidad}
                                    onChange={e => setDatosFormulario({ ...datosFormulario, sol_unidad: e.target.value })}
                                >
                                    <option value="">-- Seleccionar Unidad --</option>
                                    {unidades.map(u => (
                                        <option key={u.usu_id} value={u.usu_unidad}>{u.usu_unidad}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="relative group"><label className="absolute -top-2.5 left-3 bg-white px-1 text-xs font-bold text-blue-600 uppercase tracking-widest z-10">Solicitante Responsable</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="Nombre completo del responsable..."
                                    className="w-full p-4 bg-white border border-slate-300 rounded-xl outline-none font-medium text-slate-800"
                                    value={datosFormulario.sol_nombresolicitante}
                                    onChange={e => {
                                        const nuevoNombre = e.target.value;
                                        if (nuevoNombre.startsWith(' ')) return;
                                        if (/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]*$/.test(nuevoNombre)) {
                                            setDatosFormulario(prev => ({
                                                ...prev,
                                                sol_nombresolicitante: nuevoNombre,
                                                pasajeros: prev.pasajeros.map(p =>
                                                    p.esSolicitante ? { ...p, nombre: nuevoNombre } : p
                                                )
                                            }));
                                        }
                                    }}
                                />
                                <div className="mt-3 flex items-center justify-end">
                                    <label className="relative inline-flex items-center cursor-pointer group">
                                        <input
                                            type="checkbox"
                                            className="sr-only peer"
                                            checked={datosFormulario.pasajeros.some(p => p.esSolicitante)}
                                            onChange={(e) => {
                                                if (e.target.checked) {
                                                    if (!datosFormulario.sol_nombresolicitante.trim()) {
                                                        setMensajeError("Por favor ingresa el nombre del responsable primero.");
                                                        return;
                                                    }
                                                    setDatosFormulario(prev => ({
                                                        ...prev,
                                                        pasajeros: [...prev.pasajeros, {
                                                            nombre: prev.sol_nombresolicitante,
                                                            tipo: 1, // Asumimos Funcionario por defecto para el responsable
                                                            esSolicitante: true
                                                        }]
                                                    }));
                                                } else {
                                                    setDatosFormulario(prev => ({
                                                        ...prev,
                                                        pasajeros: prev.pasajeros.filter(p => !p.esSolicitante)
                                                    }));
                                                }
                                            }}
                                        />
                                        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600 group-hover:bg-slate-300"></div>
                                        <span className="ml-3 text-sm font-bold text-slate-500 group-hover:text-blue-600 transition-colors">
                                            Asistirá al viaje (Agregar a lista)
                                        </span>
                                    </label>
                                </div>
                            </div>
                            <div className="relative group"><label className="absolute -top-2.5 left-3 bg-white px-1 text-xs font-bold text-blue-600 uppercase tracking-widest z-10">Motivo Principal</label>
                                <input
                                    type="text"
                                    required
                                    minLength={5}
                                    maxLength={500}
                                    placeholder="Describe el motivo principal del viaje..."
                                    className="w-full p-4 bg-white border border-slate-300 rounded-xl outline-none font-medium text-slate-800"
                                    value={datosFormulario.sol_motivo}
                                    onChange={e => {
                                        const val = e.target.value;
                                        if (val.startsWith(' ')) return;
                                        if (/^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑüÜ\s.,;:\-/"'?!¡¿@#&()º]*$/.test(val)) setDatosFormulario({ ...datosFormulario, sol_motivo: val });
                                    }}
                                />
                                <div className="mt-1 mr-2 text-[10px] font-bold text-slate-400 text-right uppercase tracking-wider">
                                    {datosFormulario.sol_motivo.length} / 500 caracteres
                                </div>
                            </div>
                            <div className="relative group"><label className="absolute -top-2.5 left-3 bg-white px-1 text-xs font-bold text-blue-600 uppercase tracking-widest z-10">Detalle del Itinerario</label>
                                <textarea
                                    required
                                    minLength={20}
                                    maxLength={1000}
                                    placeholder="Ej: Salida desde escuela..."
                                    className="w-full p-4 bg-white border border-slate-300 rounded-xl outline-none font-medium text-slate-800 resize-none min-h-[120px]"
                                    value={datosFormulario.sol_itinerario}
                                    onChange={e => {
                                        const val = e.target.value;
                                        if (val.startsWith(' ')) return;
                                        if (/^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑüÜ\s.,;:\-/"'?!¡¿@#&()º\n]*$/.test(val)) setDatosFormulario({ ...datosFormulario, sol_itinerario: val });
                                    }}
                                />
                                <div className="mt-1 mr-2 text-[10px] font-bold text-slate-400 text-right uppercase tracking-wider">
                                    {datosFormulario.sol_itinerario.length} / 1000 caracteres
                                </div>
                            </div>
                            <div className="relative group"><label className="absolute -top-2.5 left-3 bg-white px-1 text-xs font-bold text-blue-600 uppercase tracking-widest z-10">Kilometraje Estimado</label>
                                <input
                                    type="text"
                                    inputMode="numeric"
                                    required
                                    placeholder="45"
                                    className="w-full p-4 bg-white border border-slate-300 rounded-xl outline-none font-medium text-slate-800"
                                    value={datosFormulario.sol_kmestimado}
                                    onChange={e => {
                                        const val = e.target.value;
                                        if (/^[0-9]*$/.test(val)) setDatosFormulario({ ...datosFormulario, sol_kmestimado: val });
                                    }}
                                />
                            </div>


                            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                                <label className="text-xs font-bold text-slate-500 uppercase flex items-center justify-between gap-2 mb-3">
                                    <div className="flex items-center gap-2"><MapPin size={14} /> Destinos a visitar</div>
                                    <div className="flex bg-slate-200 p-1 rounded-lg">
                                        <button type="button" onClick={() => setTipoDestino('OFICIAL')} className={`px-3 py-1 rounded-md text-[10px] uppercase font-bold transition-all ${tipoDestino === 'OFICIAL' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>Establecimiento</button>
                                        <button type="button" onClick={() => setTipoDestino('OTRO')} className={`px-3 py-1 rounded-md text-[10px] uppercase font-bold transition-all ${tipoDestino === 'OTRO' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>Otro Lugar</button>
                                    </div>
                                </label>
                                <div className="flex flex-col md:flex-row gap-2 mb-3">
                                    <select className="w-full md:w-1/3 p-3 bg-white border border-slate-300 rounded-xl outline-none text-sm font-medium" value={destinoActual.comuna_id} onChange={e => setDestinoActual({ ...destinoActual, comuna_id: e.target.value, establecimiento_id: null, lugar_nombre: '' })}>
                                        <option value="">Comuna...</option>{comunas.map(c => <option key={c.com_id} value={c.com_id}>{c.com_nombre}</option>)}
                                    </select>
                                    {tipoDestino === 'OFICIAL' ? (
                                        <select className="w-full md:flex-1 p-3 bg-white border border-slate-300 rounded-xl outline-none text-sm font-medium disabled:bg-slate-100" value={destinoActual.establecimiento_id || ''} onChange={e => setDestinoActual({ ...destinoActual, establecimiento_id: e.target.value })} disabled={!destinoActual.comuna_id}><option value="">Selecciona Establecimiento...</option>{establecimientosDisponibles.map(e => <option key={e.est_id} value={e.est_id}>{e.est_nombre}</option>)}</select>
                                    ) : (
                                        <>
                                            <input
                                                type="text"
                                                list="lugares-adm"
                                                placeholder="Lugar específico"
                                                className="w-full md:flex-1 p-3 bg-white border border-slate-300 rounded-xl outline-none text-sm font-medium disabled:bg-slate-100"
                                                value={destinoActual.lugar_nombre}
                                                onChange={e => {
                                                    const val = e.target.value;
                                                    if (val.startsWith(' ')) return;
                                                    if (/^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑüÜ\s.,;:\-/"'?!¡¿@#&()º]*$/.test(val)) setDestinoActual({ ...destinoActual, lugar_nombre: val });
                                                }}
                                                disabled={!destinoActual.comuna_id}
                                            />
                                            <datalist id="lugares-adm">{lugaresDisponibles.map(l => <option key={l.lug_id} value={l.lug_nombre} />)}</datalist>
                                        </>
                                    )}
                                    <button type="button" onClick={agregarDestino} disabled={!destinoActual.comuna_id} className="w-full md:w-auto px-4 bg-slate-800 disabled:bg-slate-300 text-white rounded-xl font-medium"><Plus size={18} /></button>
                                </div>
                                <p className="text-[10px] text-blue-500 font-bold mb-3 pl-1 flex items-center gap-1">
                                    <AlertCircle size={12} /> Recuerda presionar el botón "+" para guardar el destino en la lista.
                                </p>
                                {datosFormulario.destinos.length > 0 ? (
                                    <div className="flex flex-wrap gap-2">{datosFormulario.destinos.map((d, idx) => (<div key={idx} className="flex items-center gap-2 pl-3 pr-2 py-2 bg-blue-100/50 text-blue-800 rounded-lg border border-blue-200/50 shadow-sm"><MapPin size={14} /><span className="text-sm font-bold">{d.lugar_nombre}</span><button type="button" onClick={() => eliminarDestino(idx)} className="text-blue-400 hover:text-red-500 ml-1"><XCircle size={14} /></button></div>))}</div>
                                ) : <div className="text-xs text-slate-400 italic text-center py-2">Agrega al menos un destino.</div>}
                            </div>
                        </div>
                    </div>
                </div>


                <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="bg-slate-50/50 px-6 py-4 border-b border-slate-100 flex items-center justify-between"><div className="flex items-center gap-2"><div className="bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold">3</div><h3 className="font-bold text-slate-800 uppercase text-sm tracking-wide">Nómina de Ocupantes</h3></div><span className="text-xs font-bold bg-slate-200 text-slate-600 px-2 py-1 rounded-md">{datosFormulario.pasajeros.length} Personas</span></div>
                    <div className="p-6">
                        <div className="flex flex-col md:flex-row gap-3 mb-6 bg-slate-50 p-4 rounded-2xl border border-slate-100 shadow-inner">
                            <div className="flex-1 relative">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                                <input
                                    type="text"
                                    placeholder="Nombre Completo del Pasajero"
                                    className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:border-blue-500 shadow-sm"
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
                                <select className="w-40 px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 focus:outline-none" value={tipoPasajero} onChange={e => setTipoPasajero(e.target.value)}>{tiposPasajero.map(t => <option key={t.tip_id} value={t.tip_id}>{t.tip_nombre}</option>)}</select>
                                <button type="button" onClick={agregarPasajero} disabled={!nombrePasajero.trim()} className="px-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-blue-500/20 disabled:opacity-50"><Plus size={24} /></button>
                            </div>
                        </div>
                        <p className="text-[10px] text-blue-500 font-bold mb-4 pl-1 flex items-center gap-1 -mt-4">
                            <AlertCircle size={12} /> Has click en el "+" para añadir a la persona a la lista.
                        </p>
                        {datosFormulario.pasajeros.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                                {datosFormulario.pasajeros.map((p, idx) => {
                                    const tipoInfo = tiposPasajero.find(t => t.tip_id === p.tipo);
                                    const label = tipoInfo ? tipoInfo.tip_nombre.substring(0, 3).toUpperCase() : 'OTR';
                                    return (
                                        <div key={idx} className="flex items-center justify-between p-3 bg-white border border-slate-100 rounded-xl shadow-sm hover:shadow-md transition-all group border-l-4" style={{ borderLeftColor: '#4338ca' }}>
                                            <div className="flex items-center gap-3"><div className="w-10 h-10 rounded-lg flex items-center justify-center text-xs font-black bg-indigo-50 text-indigo-700">{label}</div><div><div className="text-sm font-bold text-slate-800">{p.nombre}</div></div></div>
                                            <button type="button" onClick={() => eliminarPasajero(idx)} className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={18} /></button>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : <div className="text-center py-10 border-2 border-dashed border-slate-100 rounded-2xl"><Users size={48} className="mx-auto text-slate-300 mb-2" /><p className="text-slate-400 font-medium">Lista vacía.</p></div>}
                    </div>
                </div>


                <div className="bg-white rounded-3xl shadow-sm border border-emerald-200 overflow-hidden ring-4 ring-emerald-500/5">
                    <div className="bg-emerald-50 px-6 py-4 border-b border-emerald-100 flex items-center gap-2">
                        <div className="bg-emerald-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold">4</div>
                        <h3 className="font-bold text-emerald-900 uppercase text-sm">Asignar Recursos (Aprobación Inmediata)</h3>
                    </div>
                    <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Vehículo</label>
                            <select required className="w-full p-3 bg-slate-50 border rounded-xl" value={datosFormulario.sol_patentevehiculofk} onChange={e => setDatosFormulario({ ...datosFormulario, sol_patentevehiculofk: e.target.value })}>
                                <option value="">-- Seleccionar Vehículo --</option>
                                {vehiculos.map(v => <option key={v.vehi_patente} value={v.vehi_patente}>{v.vehi_marca} {v.vehi_modelo} ({v.vehi_patente}) - {v.vehi_capacidad} PAX</option>)}
                            </select>
                        </div>
                        {datosFormulario.sol_requierechofer && (
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Conductor</label>
                                <select required className="w-full p-3 bg-slate-50 border rounded-xl" value={datosFormulario.sol_correochoferfk} onChange={e => setDatosFormulario({ ...datosFormulario, sol_correochoferfk: e.target.value })}>
                                    <option value="">-- Seleccionar Conductor --</option>
                                    {choferes.map(c => <option key={c.cho_correoinstitucional} value={c.cho_correoinstitucional}>{c.cho_nombre}</option>)}
                                </select>
                            </div>
                        )}
                    </div>
                </div>

                <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/90 backdrop-blur border-t z-40 flex justify-center shadow-[0_-10px_40px_rgba(0,0,0,0.1)]">
                    <div className="w-full max-w-4xl flex gap-4">
                        <button type="button" onClick={alCancelar} className="px-6 py-3 font-bold text-slate-500 hover:bg-slate-50 rounded-xl">Cancelar</button>
                        <button
                            type="submit"
                            disabled={enviando || !datosFormulario.sol_unidad || !datosFormulario.sol_patentevehiculofk || (datosFormulario.sol_requierechofer && !datosFormulario.sol_correochoferfk) || datosFormulario.destinos.length === 0}
                            className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-lg"
                        >
                            {enviando ? 'Procesando...' : <><ShieldCheck size={20} /> Crear y Aprobar Inmediatamente</>}
                        </button>
                    </div>
                </div>


                {(mensajeError || mensajeExito) && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm">
                        {mensajeError && (
                            <div className="bg-white border-l-4 border-red-500 p-6 rounded-2xl shadow-2xl max-w-md w-full flex flex-col items-center text-center gap-4">
                                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center text-red-500 mb-2">
                                    <AlertCircle size={32} />
                                </div>
                                <h3 className="text-xl font-bold text-slate-800">¡Atención!</h3>
                                <p className="text-slate-600 font-medium">{mensajeError}</p>
                                <button type="button" onClick={() => setMensajeError('')} className="mt-2 text-sm text-slate-400 font-bold hover:text-slate-600 uppercase tracking-wide">Cerrar</button>
                            </div>
                        )}
                        {mensajeExito && (
                            <div className="bg-white border-l-4 border-emerald-500 p-6 rounded-2xl shadow-2xl max-w-md w-full flex flex-col items-center text-center gap-4">
                                <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-500 mb-2">
                                    <CheckCircle2 size={32} />
                                </div>
                                <h3 className="text-xl font-bold text-slate-800">¡Éxito!</h3>
                                <p className="text-slate-600 font-medium">{mensajeExito}</p>
                            </div>
                        )}
                    </div>
                )}

            </form>
        </div>
    );
};

export default AdminExpressForm;
