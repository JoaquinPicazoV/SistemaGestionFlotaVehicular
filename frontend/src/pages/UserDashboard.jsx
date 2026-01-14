import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

// Componentes
import UserNavBar from '../components/UserNavBar';
import UserRequestList from '../components/UserRequestList';
import UserRequestForm from '../components/UserRequestForm';

const UserDashboard = ({ usuario, cerrarSesion }) => {
    const navigate = useNavigate();
    const [pestanaActiva, setPestanaActiva] = useState('lista'); // 'lista' | 'crear'
    const [solicitudes, setSolicitudes] = useState([]);
    const [cargando, setCargando] = useState(true);

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

    useEffect(() => {
        obtenerSolicitudes();
    }, []);

    const obtenerSolicitudes = async () => {
        setCargando(true);
        try {
            const res = await axios.get(`${API_URL}/requests/my`, { withCredentials: true });
            setSolicitudes(res.data);
        } catch (error) {
            console.error(error);
        } finally {
            setCargando(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#F1F5F9] font-sans selection:bg-indigo-500 selection:text-white pb-12">

            <UserNavBar
                usuario={usuario}
                cerrarSesion={cerrarSesion}
                pestanaActiva={pestanaActiva}
                setPestanaActiva={setPestanaActiva}
            />
            {/* Nota: UserNavBar espera props en inglés por ahora, las refactorizaré después si es necesario,
                pero 'activeTab' es prop del componente UserNavBar. Debo chequear UserNavBar. */}

            <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
                {pestanaActiva === 'lista' && (
                    <UserRequestList
                        solicitudes={solicitudes}
                        obtenerSolicitudes={obtenerSolicitudes}
                        cargando={cargando}
                        nuevaSolicitud={() => setPestanaActiva('crear')}
                    />
                )}

                {pestanaActiva === 'crear' && (
                    <UserRequestForm
                        alCancelar={() => setPestanaActiva('lista')}
                        alCompletar={() => {
                            setPestanaActiva('lista');
                            obtenerSolicitudes();
                        }}
                    />
                )}
            </main>
        </div>
    );
};

export default UserDashboard;