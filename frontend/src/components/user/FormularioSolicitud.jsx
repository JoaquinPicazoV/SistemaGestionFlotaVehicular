import React, { useState, useRef } from 'react';
import axios from 'axios';
import API_URL from '../../config/api';
import {
    ChevronRight,
    CheckCircle2,
    ArrowRight,
    AlertCircle
} from 'lucide-react';

import SeleccionServicio from './formulario/SeleccionServicio';
import FormularioItinerario from './formulario/FormularioItinerario';
import SelectorDestinos from './formulario/SelectorDestinos';
import ListaPasajeros from './formulario/ListaPasajeros';

const FormularioSolicitud = ({ alCancelar, alCompletar }) => {

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
        sol_nombresolicitante: '',
        sol_tipo: 'PEDAGOGICA',
        sol_requierechofer: true,
        pasajeros: [],
        destinos: []
    });

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

            if (dSalida >= dLlegada) {
                setMensajeError("La fecha y hora de llegada debe ser posterior a la de salida.");
                setEnviando(false);
                peticionEnCurso.current = false;
                return;
            }

            const datosSolicitud = {
                sol_fechasalida: fechaSalida,
                sol_fechallegada: fechaLlegada,
                sol_motivo: datosFormulario.sol_motivo,
                sol_itinerario: datosFormulario.sol_itinerario,
                sol_nombresolicitante: datosFormulario.sol_nombresolicitante,
                sol_tipo: datosFormulario.sol_tipo,
                sol_requierechofer: datosFormulario.sol_requierechofer,
                sol_kmestimado: datosFormulario.sol_kmestimado,
                pasajeros: datosFormulario.pasajeros,
                destinos: datosFormulario.destinos
            };


            await Promise.all([
                axios.post(`${API_URL}/requests`, datosSolicitud, { withCredentials: true }),
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
                sol_kmestimado: '', // RESET
                pasajeros: [],
                destinos: []
            });

            setTimeout(() => {
                setMensajeExito('');
                if (alCompletar) alCompletar();
            }, 2500);

        } catch (error) {
            console.error("Error creando solicitud:", error);
            if (error.response && error.response.data && error.response.data.error) {
                setMensajeError(error.response.data.error);
            } else {
                setMensajeError("Hubo un error al crear la solicitud. Por favor intenta nuevamente.");
            }
        } finally {
            setEnviando(false);
            peticionEnCurso.current = false;
        }
    };

    return (
        <div className="max-w-4xl mx-auto animate-in fade-in zoom-in-95 duration-500">

            <div className="flex items-center gap-4 mb-8">
                <button
                    onClick={alCancelar}
                    className="w-10 h-10 flex items-center justify-center bg-white border border-slate-200 rounded-full text-slate-400 hover:text-blue-600 hover:border-blue-200 shadow-sm transition-all"
                >
                    <ChevronRight className="rotate-180" size={24} />
                </button>
                <div>
                    <h2 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
                        Nueva Solicitud
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

            {mensajeError && (
                <div className="mb-8 p-4 bg-red-50 border-2 border-red-100 text-red-800 rounded-2xl flex items-center gap-3 shadow-lg shadow-red-500/10 animate-fade-in-down" role="alert">
                    <div className="p-2 bg-red-100 rounded-full"><AlertCircle size={24} className="text-red-600" /></div>
                    <div>
                        <div className="font-bold text-lg">Error</div>
                        <div className="text-red-700 text-sm font-medium">{mensajeError}</div>
                    </div>
                </div>
            )}

            <form onSubmit={manejarEnvio} className="space-y-6 pb-20">

                <SeleccionServicio
                    datos={datosFormulario}
                    alCambiar={setDatosFormulario}
                />

                <FormularioItinerario
                    datos={datosFormulario}
                    alCambiar={setDatosFormulario}
                />

                <SelectorDestinos
                    datos={datosFormulario}
                    alCambiar={setDatosFormulario}
                />

                <ListaPasajeros
                    datos={datosFormulario}
                    alCambiar={setDatosFormulario}
                />


                <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/80 backdrop-blur-md border-t border-slate-200 z-40 flex justify-center shadow-[0_-10px_40px_rgba(0,0,0,0.1)]">
                    <div className="w-full max-w-4xl flex items-center justify-between gap-4">
                        <div className="hidden md:block text-slate-500 text-sm font-medium">
                            Revisa todos los datos antes de confirmar.
                        </div>
                        <button
                            type="submit"
                            disabled={enviando || datosFormulario.destinos.length === 0}
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


                {(mensajeError || mensajeExito) && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm animate-in fade-in duration-300">
                        {mensajeError && (
                            <div className="bg-white border-l-4 border-red-500 p-6 rounded-2xl shadow-2xl max-w-md w-full animate-in zoom-in-95 duration-200 flex flex-col items-center text-center gap-4">
                                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center text-red-500 mb-2">
                                    <AlertCircle size={32} />
                                </div>
                                <h3 className="text-xl font-bold text-slate-800">¡Atención!</h3>
                                <p className="text-slate-600 font-medium">{mensajeError}</p>
                                <button type="button" onClick={() => setMensajeError('')} className="mt-2 text-sm text-slate-400 font-bold hover:text-slate-600 uppercase tracking-wide">Cerrar</button>
                            </div>
                        )}
                        {mensajeExito && (
                            <div className="bg-white border-l-4 border-emerald-500 p-6 rounded-2xl shadow-2xl max-w-md w-full animate-in zoom-in-95 duration-200 flex flex-col items-center text-center gap-4">
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

export default FormularioSolicitud;
