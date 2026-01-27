import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import API_URL from '../config/api';
import { User, ShieldCheck, ArrowLeft, Key, Building2, Mail, Loader2, Sparkles } from 'lucide-react';

import LogoSlep from '../assets/LogoSLEP.png';

const Login = () => {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [tipoUsuario, setTipoUsuario] = useState('funcionario');
    const [credenciales, setCredenciales] = useState({ usuario: '', clave: '' });
    const [cargando, setCargando] = useState(false);
    const [mensajeError, setMensajeError] = useState(null);
    const [formularioVisible, setFormularioVisible] = useState(true);

    const cambiarTipoUsuario = (tipo) => {
        if (tipo === tipoUsuario) return;
        setFormularioVisible(false);
        setTimeout(() => {
            setTipoUsuario(tipo);
            setMensajeError(null);
            setCredenciales({ usuario: '', clave: '' });
            setFormularioVisible(true);
        }, 200);
    };

    const manejarEnvio = async (e) => {
        e.preventDefault();
        setCargando(true);
        setMensajeError(null);

        try {
            const response = await axios.post(`${API_URL}/auth/login`, {
                usuario: credenciales.usuario,
                clave: credenciales.clave
            }, { withCredentials: true });

            if (response.status === 200) {
                // Actualizar contexto y navegar
                if (response.data.usuario) {
                    login(response.data.usuario);
                }
                navigate('/dashboard');
            }
        } catch (err) {
            if (err.response && err.response.data) {
                setMensajeError(err.response.data.error || 'Error al iniciar sesión');
            } else {
                setMensajeError('Error de conexión. Intenta más tarde.');
            }
        } finally {
            setCargando(false);
        }
    };

    const tema = tipoUsuario === 'funcionario'
        ? {
            bg: 'bg-slate-900',
            gradient: 'from-blue-600 to-cyan-500',
            blobTop: 'bg-blue-600/20',
            blobBottom: 'bg-cyan-600/20',
            btnShadow: 'shadow-blue-500/20'
        }
        : {
            bg: 'bg-slate-950',
            gradient: 'from-indigo-600 to-purple-600',
            blobTop: 'bg-indigo-600/20',
            blobBottom: 'bg-purple-600/20',
            btnShadow: 'shadow-indigo-500/20'
        };

    return (
        <div className={`min-h-screen ${tema.bg} flex items-center justify-center p-4 relative overflow-hidden transition-colors duration-700`}>


            <div className={`absolute top-[-20%] left-[-10%] w-[50%] h-[50%] ${tema.blobTop} rounded-full blur-[120px] animate-pulse duration-1000`} />
            <div className={`absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] ${tema.blobBottom} rounded-full blur-[120px] animate-pulse delay-700 duration-1000`} />

            <div className="w-full max-w-lg relative z-10 perspective-1000">

                <div className="text-center mb-4 animate-fade-in-down flex flex-col items-center">
                    <img src={LogoSlep} alt="Logo SLEP" className="h-40 w-auto object-contain drop-shadow-2xl" />
                </div>

                <div className="bg-white/95 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl shadow-black/20 overflow-hidden transform transition-all duration-500 hover:shadow-black/30">


                    <div className="flex p-2 bg-slate-100/50 gap-2">
                        <button
                            onClick={() => cambiarTipoUsuario('funcionario')}
                            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all duration-300 relative overflow-hidden ${tipoUsuario === 'funcionario'
                                ? 'bg-white text-blue-600 shadow-md transform scale-[1.02]'
                                : 'text-slate-500 hover:bg-white/50 hover:text-slate-700'
                                } `}
                        >
                            <Building2 size={18} className={tipoUsuario === 'funcionario' ? 'animate-bounce-subtle' : ''} />
                            <span className="relative z-10">Unidad</span>
                            {tipoUsuario === 'funcionario' && (
                                <div className="absolute inset-0 bg-blue-50/50 z-0"></div>
                            )}
                        </button>

                        <button
                            onClick={() => cambiarTipoUsuario('admin')}
                            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all duration-300 relative overflow-hidden ${tipoUsuario === 'admin'
                                ? 'bg-white text-indigo-600 shadow-md transform scale-[1.02]'
                                : 'text-slate-500 hover:bg-white/50 hover:text-slate-700'
                                } `}
                        >
                            <ShieldCheck size={18} className={tipoUsuario === 'admin' ? 'animate-bounce-subtle' : ''} />
                            <span className="relative z-10">Administrador</span>
                            {tipoUsuario === 'admin' && (
                                <div className="absolute inset-0 bg-indigo-50/50 z-0"></div>
                            )}
                        </button>
                    </div>

                    <div className={`p-8 transition-opacity duration-200 ${formularioVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>

                        <div className="flex items-center gap-4 mb-8">
                            <div className={`p-3 rounded-2xl bg-gradient-to-br ${tema.gradient} text-white shadow-lg transform rotate-3`}>
                                {tipoUsuario === 'funcionario' ? <Sparkles size={24} /> : <Key size={24} />}
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-slate-800">
                                    {tipoUsuario === 'funcionario' ? 'Ingreso Unidades' : 'Panel de Control'}
                                </h2>
                                <p className="text-xs text-slate-500 font-medium">
                                    {tipoUsuario === 'funcionario' ? 'Credenciales de unidad' : 'Acceso restringido'}
                                </p>
                            </div>
                        </div>

                        {mensajeError && (
                            <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm flex items-center gap-3 animate-shake">
                                <div className="w-1.5 h-1.5 rounded-full bg-red-500"></div>
                                {mensajeError}
                            </div>
                        )}

                        <form onSubmit={manejarEnvio} className="space-y-5">

                            <div className="group">
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 ml-1">
                                    {tipoUsuario === 'funcionario' ? 'Usuario de Unidad' : 'Correo Institucional'}
                                </label>
                                <div className="relative transform transition-all duration-200 group-focus-within:scale-[1.01]">
                                    <div className="absolute left-4 top-3.5 text-slate-400 group-focus-within:text-blue-500 transition-colors z-10">
                                        {tipoUsuario === 'funcionario' ? <User size={20} /> : <Mail size={20} />}
                                    </div>
                                    <input
                                        type={tipoUsuario === 'funcionario' ? "text" : "email"}
                                        required
                                        autoFocus
                                        className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border-2 border-slate-100 rounded-xl outline-none focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 transition-all font-medium text-slate-700 placeholder:text-slate-300"
                                        placeholder={tipoUsuario === 'funcionario' ? "Ej: Finanzas" : "usuario@dominio.cl"}
                                        value={credenciales.usuario}
                                        onChange={(e) => {
                                            const val = e.target.value;
                                            if (val.startsWith(' ')) return;

                                            if (/^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑüÜ\s@._-]*$/.test(val)) {
                                                setCredenciales({ ...credenciales, usuario: val });
                                            }
                                        }}
                                    />
                                </div>
                            </div>

                            <div className="group">
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 ml-1">Contraseña</label>
                                <div className="relative transform transition-all duration-200 group-focus-within:scale-[1.01]">
                                    <div className="absolute left-4 top-3.5 text-slate-400 group-focus-within:text-blue-500 transition-colors z-10">
                                        <Key size={20} />
                                    </div>
                                    <input
                                        type="password"
                                        required
                                        className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border-2 border-slate-100 rounded-xl outline-none focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 transition-all font-medium text-slate-700 placeholder:text-slate-300"
                                        placeholder="••••••••••••••••"
                                        value={credenciales.clave}
                                        onChange={(e) => {
                                            const val = e.target.value;
                                            if (val.startsWith(' ')) return;
                                            setCredenciales({ ...credenciales, clave: val });
                                        }}
                                    />
                                </div>
                            </div>

                            <div className="pt-2">
                                <button
                                    type="submit"
                                    disabled={cargando}
                                    className={`w-full py-4 rounded-xl font-bold text-white shadow-xl ${tema.btnShadow} transform transition-all duration-200 hover:-translate-y-1 active:scale-[0.98] bg-gradient-to-r ${tema.gradient} flex items-center justify-center gap-2`}
                                >
                                    {cargando ? <Loader2 size={20} className="animate-spin" /> : 'Iniciar Sesión'}
                                </button>
                            </div>

                        </form>
                    </div>

                    <div className="bg-slate-50 border-t border-slate-100 p-4 text-center">
                        <Link to="/" className="inline-flex items-center justify-center gap-2 text-sm text-slate-400 hover:text-slate-600 transition-colors font-medium group">
                            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                            Volver al Inicio
                        </Link>
                    </div>
                </div>

                <p className="text-center text-slate-500/40 text-xs mt-6 font-medium">
                    &copy; 2026 SLEP Llanquihue
                </p>

            </div>
        </div>
    );
};

export default Login;