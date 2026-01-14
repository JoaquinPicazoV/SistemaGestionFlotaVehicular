import React from 'react';

const LoadingScreen = ({ mensaje = "Cargando..." }) => {
    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-slate-200 border-t-blue-600"></div>
                <p className="text-slate-500 font-medium animate-pulse">{mensaje}</p>
            </div>
        </div>
    );
};

export default LoadingScreen;
