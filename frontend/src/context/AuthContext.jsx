import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';
import API_URL from '../config/api';
import LoadingScreen from '../components/common/LoadingScreen';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [usuario, setUsuario] = useState(null);
    const [cargando, setCargando] = useState(true);

    const verificarSesion = async () => {
        try {
            const response = await axios.get(`${API_URL}/auth/check`, { withCredentials: true });
            setUsuario(response.data.usuario);
        } catch (error) {
            setUsuario(null);
        } finally {
            setCargando(false);
        }
    };

    const cerrarSesion = async () => {
        try {
            await axios.post(`${API_URL}/auth/logout`, {}, { withCredentials: true });
            setUsuario(null);
        } catch (error) {
            console.error("Error al cerrar sesión", error);
        }
    };

    useEffect(() => {
        verificarSesion();
    }, []);

    const login = (userData) => {
        setUsuario(userData);
    };

    return (
        <AuthContext.Provider value={{ usuario, cargando, cerrarSesion, login, verificarSesion }}>
            {!cargando ? children : <LoadingScreen mensaje="Verificando sesión..." />}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
