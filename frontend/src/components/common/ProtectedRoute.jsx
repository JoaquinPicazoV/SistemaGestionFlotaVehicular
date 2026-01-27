import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import LoadingScreen from './LoadingScreen';

const ProtectedRoute = ({ children }) => {
    const { usuario, cargando } = useAuth();

    if (cargando) {
        return <LoadingScreen mensaje="Cargando acceso..." />;
    }

    if (!usuario) {
        return <Navigate to="/login" replace />;
    }

    return children;
};

export default ProtectedRoute;
