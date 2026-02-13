require('dotenv').config();

if (process.env.NODE_ENV === 'production') {
    const required = ['DB_HOST', 'DB_USER', 'DB_PASSWORD', 'DB_NAME', 'JWT_SECRET', 'ALLOWED_ORIGIN'];
    if (required.some(key => !process.env[key])) {
        console.error('Missing required environment variables');
        process.exit(1);
    }
}
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const path = require('path');
const cookieParser = require('cookie-parser');
const { limiter } = require('./src/middlewares/rateLimit');
const errorHandler = require('./src/middlewares/errorHandler');
const initScheduler = require('./scheduler');


const authRoutes = require('./src/routes/authRoutes');
const vehicleRoutes = require('./src/routes/vehicleRoutes');
const driverRoutes = require('./src/routes/driverRoutes');
const requestRoutes = require('./src/routes/requestRoutes');
const statsRoutes = require('./src/routes/statsRoutes');
const referenceRoutes = require('./src/routes/referenceRoutes');

const PORT = process.env.PORT || 4000;
const app = express();


app.use(helmet());
app.use(compression());
app.use(cors({
    origin: process.env.ALLOWED_ORIGIN,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
}));

app.use(express.json());
app.use(cookieParser());

app.use((req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
        console.log(`${req.method} ${req.originalUrl} ${res.statusCode} - ${Date.now() - start}ms`);
    });
    next();
});

app.use('/api/', limiter);


app.use('/api/auth', authRoutes);
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/drivers', driverRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api', referenceRoutes);

if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, '../frontend/dist')));
    app.get('*', (req, res) => res.sendFile(path.join(__dirname, '../frontend/dist', 'index.html')));
}

app.use(errorHandler);


initScheduler();


app.listen(PORT, () => {
    console.log(`Servidor corriendo en puerto ${PORT}`);
    console.log(`Entorno: ${process.env.NODE_ENV || 'development'}`);
});