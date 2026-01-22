import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import API_URL from '../config/api';

import UserNavBar from '../components/user/UserNavBar';
import UserRequestList from '../components/user/UserRequestList';
import UserRequestForm from '../components/user/UserRequestForm';
import AdminCalendar from '../components/admin/AdminCalendar';

const UserDashboard = ({ usuario, cerrarSesion }) => {

    const [pestanaActiva, setPestanaActiva] = useState('lista');
    const [solicitudes, setSolicitudes] = useState([]);
    const [cargando, setCargando] = useState(true);



    const obtenerSolicitudes = useCallback(async () => {
        setCargando(true);
        try {
            const res = await axios.get(`${API_URL}/requests/my`, { withCredentials: true });
            setSolicitudes(res.data);
        } catch (error) {
            console.error(error);
        } finally {
            setCargando(false);
        }
    }, [API_URL]);

    useEffect(() => {
        obtenerSolicitudes();
    }, [obtenerSolicitudes]);

    return (
        <div className="min-h-screen bg-[#F1F5F9] font-sans selection:bg-indigo-500 selection:text-white pb-12">

            <UserNavBar
                usuario={usuario}
                cerrarSesion={cerrarSesion}
                pestanaActiva={pestanaActiva}
                setPestanaActiva={setPestanaActiva}
            />

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

                {pestanaActiva === 'calendario' && (
                    <AdminCalendar />
                )}
            </main>
        </div>
    );
};

export default UserDashboard;