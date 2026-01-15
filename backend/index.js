require('dotenv').config();

// Validación de entorno crítico en producción
if (process.env.NODE_ENV === 'production') {
    const requiredEnv = ['DB_HOST', 'DB_USER', 'DB_PASSWORD', 'DB_NAME', 'JWT_SECRET', 'ALLOWED_ORIGIN'];
    const missingEnv = requiredEnv.filter(key => !process.env[key]);
    if (missingEnv.length > 0) {
        console.error('❌ Error Crítico: Faltan variables de entorno requeridas:', missingEnv.join(', '));
        process.exit(1);
    }
}
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const { limiter } = require('./src/middlewares/rateLimit');
const initScheduler = require('./scheduler');

// Rutas
const authRoutes = require('./src/routes/authRoutes');
const vehicleRoutes = require('./src/routes/vehicleRoutes');
const driverRoutes = require('./src/routes/driverRoutes');
const requestRoutes = require('./src/routes/requestRoutes');
const statsRoutes = require('./src/routes/statsRoutes');
const referenceRoutes = require('./src/routes/referenceRoutes');

const PORT = process.env.PORT || 4000;
const app = express();

// Middlewares de seguridad y configuración
app.use(helmet());
app.use(cors({
    origin: process.env.ALLOWED_ORIGIN || 'http://localhost:5173',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
}));

app.use(express.json());
app.use(cookieParser());

// Limitador de peticiones global
app.use('/api/', limiter);

// Definición de rutas
app.use('/api/auth', authRoutes);
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/drivers', driverRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api', referenceRoutes);

// Inicializar tareas programadas
initScheduler();

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});