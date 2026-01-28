import React from 'react';
import { Bus, Briefcase, User } from 'lucide-react';

const SeleccionServicio = ({ datos, alCambiar }) => {
    return (
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="bg-slate-50/50 px-6 py-4 border-b border-slate-100 flex items-center gap-2">
                <div className="bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold">1</div>
                <h3 className="font-bold text-slate-800 uppercase text-sm tracking-wide">Tipo de Servicio</h3>
            </div>
            <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div
                        onClick={() => alCambiar({ ...datos, sol_tipo: 'PEDAGOGICA', sol_requierechofer: true })}
                        className={`cursor-pointer group relative overflow-hidden p-6 rounded-2xl border-2 transition-all duration-300 ${datos.sol_tipo === 'PEDAGOGICA'
                            ? 'border-blue-500 bg-blue-50 shadow-md shadow-blue-100'
                            : 'border-slate-100 hover:border-blue-300 hover:bg-slate-50 bg-white'}`}
                    >
                        <div className="flex flex-col items-center text-center gap-4 relative z-10">
                            <div className={`p-4 rounded-full transition-all duration-300 ${datos.sol_tipo === 'PEDAGOGICA' ? 'bg-blue-500 text-white scale-110 shadow-lg shadow-blue-500/30' : 'bg-slate-100 text-slate-400 group-hover:bg-blue-100 group-hover:text-blue-500'}`}>
                                <Bus size={32} />
                            </div>
                            <div>
                                <div className={`font-bold text-lg mb-1 ${datos.sol_tipo === 'PEDAGOGICA' ? 'text-blue-900' : 'text-slate-700'}`}>Salida Pedagógica</div>
                                <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-white/60 text-slate-500">Alumnos + Docentes</span>
                            </div>
                        </div>
                    </div>

                    <div
                        onClick={() => alCambiar({ ...datos, sol_tipo: 'COMETIDO' })}
                        className={`cursor-pointer group relative overflow-hidden p-6 rounded-2xl border-2 transition-all duration-300 ${datos.sol_tipo === 'COMETIDO'
                            ? 'border-indigo-500 bg-indigo-50 shadow-md shadow-indigo-100'
                            : 'border-slate-100 hover:border-indigo-300 hover:bg-slate-50 bg-white'}`}
                    >
                        <div className="flex flex-col items-center text-center gap-4 relative z-10">
                            <div className={`p-4 rounded-full transition-all duration-300 ${datos.sol_tipo === 'COMETIDO' ? 'bg-indigo-500 text-white scale-110 shadow-lg shadow-indigo-500/30' : 'bg-slate-100 text-slate-400 group-hover:bg-indigo-100 group-hover:text-indigo-500'}`}>
                                <Briefcase size={32} />
                            </div>
                            <div>
                                <div className={`font-bold text-lg mb-1 ${datos.sol_tipo === 'COMETIDO' ? 'text-indigo-900' : 'text-slate-700'}`}>Cometido Funcionario</div>
                                <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-white/60 text-slate-500">Gestiones / Traslados</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-6 p-4 rounded-xl bg-gradient-to-r from-slate-50 to-white border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4 animate-in fade-in slide-in-from-top-2">
                    <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-sm ${datos.sol_requierechofer ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-200 text-slate-400'}`}>
                            <User size={24} />
                        </div>
                        <div>
                            <div className="text-sm font-bold text-slate-900">Servicio de Conductor</div>
                            <div className="text-xs text-slate-500">Habilita esta opción si necesitas chofer del servicio.</div>
                        </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" checked={datos.sol_requierechofer} onChange={e => alCambiar({ ...datos, sol_requierechofer: e.target.checked })} />
                        <div className="w-14 h-7 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-indigo-600"></div>
                        <span className="ml-3 text-sm font-medium text-slate-700">{datos.sol_requierechofer ? 'SI' : 'NO'}</span>
                    </label>
                </div>
            </div>
        </div>
    );
};

export default SeleccionServicio;
