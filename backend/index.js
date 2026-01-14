require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const pool = require('./db');
const crypto = require('crypto');

const SECRET_KEY = process.env.JWT_SECRET || 'dev_secret_key_change_in_prod';
const PORT = process.env.PORT || 4000;

const app = express();

app.use(helmet());

// 2. CORS (Restringir orígenes en producción)
app.use(cors({
    origin: 'http://localhost:5173', // Frontend URL
    credentials: true, // Permitir cookies
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
}));

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 3000, // Aumentado significativamente para evitar bloqueos durante desarrollo
    message: 'Demasiadas peticiones desde esta IP, intenta de nuevo más tarde.'
});
app.use('/api/', limiter);

// Limitador específico para Login
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100, // Aumentado para facilitar pruebas
    message: 'Demasiados intentos de inicio de sesión.'
});

app.use(express.json());
app.use(cookieParser());

const verifyToken = (req, res, next) => {
    const token = req.cookies.access_token;
    if (!token) return res.status(401).json({ error: 'Acceso denegado. No hay token.' });

    try {
        const verified = jwt.verify(token, SECRET_KEY);
        req.user = verified;
        next();
    } catch (error) {
        res.status(400).json({ error: 'Token inválido' });
    }
};

app.get('/api/stats/bi', verifyToken, async (req, res) => {
    try {
        const [
            // TABLERO 1: FLOTA
            [desgasteVehiculos], // Top KM por vehículo
            [usoVehiculos],     // Cantidad asignaciones (Donut)

            // TABLERO 2: DEMANDA
            [tasaRechazo],      // Rechazadas vs Total
            [solicitudesUnidad],// Pareto por Unidad
            [motivosViaje],     // Distribución Motivos

            // TABLERO 3: GEO
            [comunasHeatmap],   // Comunas más visitadas
            [topLugares],       // Escuelas Top

            // TABLERO 4: OPERATIVO
            [tendenciaMensual], // Line chart anual
            [cargaChoferes]     // Viajes por chofer
        ] = await Promise.all([
            // T1.1 Desgaste (KM Estimados acumulados por vehículo, excluyendo NULL)
            pool.query(`
                SELECT CONCAT(v.vehi_modelo, ' - ', v.vehi_patente) as name, 
                       COALESCE(SUM(s.sol_kmestimado), 0) as value 
                FROM VEHICULO v
                LEFT JOIN SOLICITUDES s ON v.vehi_patente = s.sol_patentevehiculofk
                GROUP BY v.vehi_patente
                ORDER BY value DESC
                LIMIT 5
            `),
            // T1.2 Uso (Asignaciones)
            pool.query(`
                SELECT v.vehi_patente as name, COUNT(s.sol_id) as value
                FROM VEHICULO v
                LEFT JOIN SOLICITUDES s ON v.vehi_patente = s.sol_patentevehiculofk
                GROUP BY v.vehi_patente
            `),

            // T2.1 Tasa Rechazo
            pool.query(`
                SELECT 
                    COUNT(*) as total,
                    SUM(CASE WHEN sol_estado = 'RECHAZADA' THEN 1 ELSE 0 END) as rechazadas
                FROM SOLICITUDES
            `),
            // T2.2 Pareto Unidades
            pool.query(`
                SELECT sol_unidad as name, COUNT(*) as value
                FROM SOLICITUDES
                GROUP BY sol_unidad
                ORDER BY value DESC
            `),
            // T2.3 Motivos
            pool.query(`SELECT sol_motivo as name, COUNT(*) as value FROM SOLICITUDES GROUP BY sol_motivo`),

            // T3.1 Comunas Heatmap
            pool.query(`
                SELECT c.com_nombre as name, COUNT(*) as value
                FROM SOLICITUD_DESTINO sd
                JOIN LUGAR l ON sd.sde_lugarfk = l.lug_id
                JOIN COMUNA c ON l.lug_comunafk = c.com_id
                GROUP BY c.com_id
                ORDER BY value DESC
            `),
            // T3.2 Top Lugares
            pool.query(`
                SELECT l.lug_nombre as nombre, c.com_nombre as comuna, COUNT(*) as visitas
                FROM SOLICITUD_DESTINO sd
                JOIN LUGAR l ON sd.sde_lugarfk = l.lug_id
                JOIN COMUNA c ON l.lug_comunafk = c.com_id
                GROUP BY l.lug_id
                ORDER BY visitas DESC
                LIMIT 10
            `),

            // T4.1 Tendencia Mensual
            pool.query(`
                SELECT DATE_FORMAT(sol_fechasalida, '%Y-%m') as mes, COUNT(*) as cantidad
                FROM SOLICITUDES
                WHERE sol_fechasalida IS NOT NULL
                GROUP BY mes
                ORDER BY mes ASC
                LIMIT 12
            `),
            // T4.2 Carga Choferes
            pool.query(`
                SELECT c.cho_nombre as name, COUNT(s.sol_id) as viajes
                FROM CHOFER c
                LEFT JOIN SOLICITUDES s ON c.cho_correoinstitucional = s.sol_correochoferfk AND s.sol_estado = 'FINALIZADA'
                GROUP BY c.cho_correoinstitucional
                ORDER BY viajes DESC
            `)
        ]);

        res.json({
            fleet: { desgaste: desgasteVehiculos, uso: usoVehiculos },
            demand: {
                kpi_rechazo: tasaRechazo[0],
                unidades: solicitudesUnidad,
                motivos: motivosViaje
            },
            geo: { comunas: comunasHeatmap, lugares: topLugares },
            ops: { tendencia: tendenciaMensual, choferes: cargaChoferes }
        });

    } catch (error) {
        console.error("Error BI V2:", error);
        res.status(500).json({ error: 'Error calculando BI avanzado' });
    }
});

// Gestión de Vehículos
app.get('/api/vehicles', verifyToken, async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM VEHICULO');
        res.json(rows);
    } catch (error) {
        console.error("Error fetching vehicles:", error);
        res.status(500).json({ error: 'Error al obtener vehículos' });
    }
});

// Crear Vehículo
app.post('/api/vehicles', verifyToken, async (req, res) => {
    const { vehi_patente, vehi_marca, vehi_modelo, vehi_capacidad, vehi_estado } = req.body;
    try {
        await pool.query(
            'INSERT INTO VEHICULO (vehi_patente, vehi_marca, vehi_modelo, vehi_capacidad, vehi_estado) VALUES (?, ?, ?, ?, ?)',
            [vehi_patente, vehi_marca, vehi_modelo, vehi_capacidad, vehi_estado]
        );
        res.json({ message: 'Vehículo creado exitosamente' });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ error: 'La patente ya está registrada.' });
        }
        console.error("Error creating vehicle:", error);
        res.status(500).json({ error: 'Error al crear vehículo' });
    }
});

// Editar Vehículo
app.put('/api/vehicles/:patente', verifyToken, async (req, res) => {
    const { patente } = req.params;
    const { vehi_marca, vehi_modelo, vehi_capacidad, vehi_estado } = req.body;
    try {
        await pool.query(
            'UPDATE VEHICULO SET vehi_marca=?, vehi_modelo=?, vehi_capacidad=?, vehi_estado=? WHERE vehi_patente=?',
            [vehi_marca, vehi_modelo, vehi_capacidad, vehi_estado, patente]
        );
        res.json({ message: 'Vehículo actualizado' });
    } catch (error) {
        console.error("Error updating vehicle:", error);
        res.status(500).json({ error: 'Error al actualizar vehículo' });
    }
});

// Eliminar Vehículo
app.delete('/api/vehicles/:patente', verifyToken, async (req, res) => {
    const { patente } = req.params;
    try {
        await pool.query('DELETE FROM VEHICULO WHERE vehi_patente=?', [patente]);
        res.json({ message: 'Vehículo eliminado' });
    } catch (error) {
        // Manejar error de integridad referencial (FK)
        if (error.code === 'ER_ROW_IS_REFERENCED_2') {
            return res.status(400).json({ error: 'No se puede eliminar: El vehículo tiene solicitudes asociadas.' });
        }
        console.error("Error deleting vehicle:", error);
        res.status(500).json({ error: 'Error al eliminar vehículo' });
    }
});

app.get('/api/stats/summary', verifyToken, async (req, res) => {
    try {
        const [pendingReqs] = await pool.query("SELECT COUNT(*) as count FROM SOLICITUDES WHERE sol_estado = 'PENDIENTE'");
        const [vehiclesRoute] = await pool.query("SELECT COUNT(*) as count FROM VEHICULO WHERE vehi_estado = 'EN RUTA'");
        const [activeDrivers] = await pool.query("SELECT COUNT(*) as count FROM CHOFER WHERE cho_activo = 1");

        // Próximos viajes (Aprobados, próximos 3 días)
        const [upcomingTrips] = await pool.query(`
            SELECT sol_unidad, sol_fechasalida, sol_motivo 
            FROM SOLICITUDES 
            WHERE sol_estado = 'APROBADA' 
            AND sol_fechasalida BETWEEN NOW() AND DATE_ADD(NOW(), INTERVAL 3 DAY)
            ORDER BY sol_fechasalida ASC
            LIMIT 5
        `);

        // Estado de la flota para gráfico
        const [fleetStatus] = await pool.query("SELECT vehi_estado as name, COUNT(*) as value FROM VEHICULO GROUP BY vehi_estado");

        // Km recorridos (Mes Actual)
        const [kmStats] = await pool.query(`
            SELECT COALESCE(SUM(sol_kmestimado), 0) as totalKm 
            FROM SOLICITUDES 
            WHERE sol_estado = 'FINALIZADA' 
            AND sol_fechasalida >= DATE_FORMAT(NOW(), '%Y-%m-01')
            AND sol_fechasalida <= LAST_DAY(NOW())
        `);

        // Pasajeros del Mes Actual
        const [passengerStats] = await pool.query(`
            SELECT COUNT(*) as totalPassengers
            FROM PASAJEROS p
            JOIN SOLICITUDES s ON p.pas_idsolicitudfk = s.sol_id
            WHERE s.sol_estado = 'FINALIZADA'
            AND s.sol_fechasalida >= DATE_FORMAT(NOW(), '%Y-%m-01')
            AND s.sol_fechasalida <= LAST_DAY(NOW())
        `);

        // Unidades con más salidas (Finalizadas) - Top 5
        const [topUnits] = await pool.query(`
            SELECT sol_unidad, COUNT(*) as trips
            FROM SOLICITUDES
            WHERE sol_estado = 'FINALIZADA'
            GROUP BY sol_unidad
            ORDER BY trips DESC
            LIMIT 5
        `);

        res.json({
            pendingRequests: pendingReqs[0].count,
            vehiclesInRoute: vehiclesRoute[0].count,
            activeDrivers: activeDrivers[0].count,
            kmMonth: kmStats[0].totalKm,
            passengersMonth: passengerStats[0].totalPassengers,
            topUnits,
            upcomingTrips,
            fleetStatus
        });
    } catch (error) {
        console.error("Error fetching summary stats:", error);
        res.status(500).json({ error: 'Error al obtener estadísticas generales' });
    }
});

// --- CHOFERES CRUD ---

// Obtener Choferes
app.get('/api/drivers', verifyToken, async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM CHOFER');
        res.json(rows);
    } catch (error) {
        console.error("Error fetching drivers:", error);
        res.status(500).json({ error: 'Error al obtener choferes' });
    }
});

// Crear Chofer
app.post('/api/drivers', verifyToken, async (req, res) => {
    const { cho_correoinstitucional, cho_nombre, cho_activo } = req.body;
    try {
        await pool.query(
            'INSERT INTO CHOFER (cho_correoinstitucional, cho_nombre, cho_activo) VALUES (?, ?, ?)',
            [cho_correoinstitucional, cho_nombre, cho_activo ? 1 : 0]
        );
        res.json({ message: 'Chofer creado exitosamente' });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ error: 'El correo institucional ya está registrado.' });
        }
        console.error("Error creating driver:", error);
        res.status(500).json({ error: 'Error al crear chofer' });
    }
});

// Editar Chofer
app.put('/api/drivers/:email', verifyToken, async (req, res) => {
    const { email } = req.params;
    const { cho_nombre, cho_activo } = req.body;
    try {
        await pool.query(
            'UPDATE CHOFER SET cho_nombre=?, cho_activo=? WHERE cho_correoinstitucional=?',
            [cho_nombre, cho_activo, email]
        );
        res.json({ message: 'Chofer actualizado' });
    } catch (error) {
        console.error("Error updating driver:", error);
        res.status(500).json({ error: 'Error al actualizar chofer' });
    }
});

// Eliminar Chofer
app.delete('/api/drivers/:email', verifyToken, async (req, res) => {
    const { email } = req.params;
    try {
        await pool.query('DELETE FROM CHOFER WHERE cho_correoinstitucional=?', [email]);
        res.json({ message: 'Chofer eliminado' });
    } catch (error) {
        if (error.code === 'ER_ROW_IS_REFERENCED_2') {
            return res.status(400).json({ error: 'No se puede eliminar: El chofer tiene viajes asociados.' });
        }
        console.error("Error deleting driver:", error);
        res.status(500).json({ error: 'Error al eliminar chofer' });
    }
});

// --- SOLICITUDES ---

// Obtener Solicitudes Pendientes
app.get('/api/requests/pending', verifyToken, async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT * FROM SOLICITUDES 
            WHERE sol_estado = 'PENDIENTE' 
            ORDER BY sol_fechasalida ASC
        `);
        res.json(rows);
    } catch (error) {
        console.error("Error fetching pending requests:", error);
        res.status(500).json({ error: 'Error al obtener solicitudes pendientes' });
    }
});

// Aprobar Solicitud
app.put('/api/requests/:id/approve', verifyToken, async (req, res) => {
    const { id } = req.params;
    const { sol_patentevehiculofk, sol_correochoferfk, sol_kmestimado } = req.body;

    try {
        await pool.query(
            `UPDATE SOLICITUDES 
             SET sol_estado = 'APROBADA', sol_patentevehiculofk = ?, sol_correochoferfk = ?, sol_idadminfk = ?, sol_kmestimado = ?
             WHERE sol_id = ?`,
            [sol_patentevehiculofk, sol_correochoferfk, req.user.id, sol_kmestimado, id]
        );
        res.json({ message: 'Solicitud aprobada correctamente' });
    } catch (error) {
        console.error("Error approving request:", error);
        res.status(500).json({ error: 'Error al aprobar solicitud' });
    }
});

// Rechazar Solicitud
app.put('/api/requests/:id/reject', verifyToken, async (req, res) => {
    const { id } = req.params;
    const { sol_observacionrechazo } = req.body;

    try {
        await pool.query(
            `UPDATE SOLICITUDES 
             SET sol_estado = 'RECHAZADA', sol_observacionrechazo = ?, sol_idadminfk = ?
             WHERE sol_id = ?`,
            [sol_observacionrechazo, req.user.id, id]
        );
        res.json({ message: 'Solicitud rechazada correctamente' });
    } catch (error) {
        console.error("Error rejecting request:", error);
        res.status(500).json({ error: 'Error al rechazar solicitud' });
    }
});

// Obtener Solicitudes Procesadas (Aprobadas o Finalizadas)
app.get('/api/requests/processed', verifyToken, async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT * FROM SOLICITUDES 
            WHERE sol_estado IN ('APROBADA', 'FINALIZADA', 'RECHAZADA') 
            ORDER BY sol_fechasalida DESC
        `);
        res.json(rows);
    } catch (error) {
        console.error("Error fetching processed requests:", error);
        res.status(500).json({ error: 'Error al obtener solicitudes procesadas' });
    }
});

// Obtener detalles de una solicitud (Pasajeros y Destinos)
app.get('/api/requests/:id/details', verifyToken, async (req, res) => {
    const { id } = req.params;
    try {
        const [pasajeros] = await pool.query(`
            SELECT p.*, tp.tip_nombre 
            FROM PASAJEROS p
            LEFT JOIN TIPO_PASAJERO tp ON p.pas_idtipofk = tp.tip_id
            WHERE p.pas_idsolicitudfk = ?
        `, [id]);

        const [destinos] = await pool.query(`
            SELECT l.lug_nombre, c.com_nombre 
            FROM SOLICITUD_DESTINO sd
            JOIN LUGAR l ON sd.sde_lugarfk = l.lug_id
            JOIN COMUNA c ON l.lug_comunafk = c.com_id
            WHERE sd.sde_solicitudfk = ?
        `, [id]);

        res.json({ pasajeros, destinos });
    } catch (error) {
        console.error("Error fetching request details:", error);
        res.status(500).json({ error: 'Error al obtener detalles' });
    }
});

// --- NUEVOS ENDPOINTS PARA UNIDADES (SOLICITUDES) ---

// Crear Solicitud
app.post('/api/requests', verifyToken, async (req, res) => {
    const conn = await pool.getConnection(); // Usar transacción
    try {
        await conn.beginTransaction();

        const {
            sol_fechasalida, // Expected full datetime string
            sol_fechallegada, // Expected full datetime string
            sol_motivo,
            sol_itinerario,
            sol_tipo, // 'PEDAGOGICA' | 'COMETIDO'
            sol_requierechofer, // Boolean
            pasajeros, // Array [{ nombre: 'Juan', tipo: 1 }]
            destinos,   // Array [{ comuna_id: 1, lugar_nombre: 'Escuela X', lugar_id: null }]
            sol_nombresolicitante
        } = req.body;

        const sol_id = crypto.randomUUID();

        // 1. Insertar Solicitud
        await conn.query(`
            INSERT INTO SOLICITUDES (
                sol_id, sol_nombresolicitante, sol_fechasalida, sol_fechallegada, sol_estado,
                sol_unidad, sol_motivo, sol_itinerario, sol_tipo, sol_requierechofer, 
                sol_idusuariofk
            ) VALUES (?, ?, ?, ?, 'PENDIENTE', ?, ?, ?, ?, ?, ?)
        `, [
            sol_id,
            sol_nombresolicitante || req.user.name,
            sol_fechasalida,
            sol_fechallegada,
            req.user.name, // sol_unidad
            sol_motivo,
            sol_itinerario,
            sol_tipo,
            sol_requierechofer ? 1 : 0,
            req.user.role === 'funcionario' ? req.user.id : null
        ]);

        // 2. Insertar Pasajeros
        if (pasajeros && pasajeros.length > 0) {
            const passengerValues = pasajeros.map(p => [p.nombre, sol_id, p.tipo || 1]);
            // Bulk insert much faster/cleaner
            await conn.query(
                `INSERT INTO PASAJEROS (pas_nombre, pas_idsolicitudfk, pas_idtipofk) VALUES ?`,
                [passengerValues]
            );
        }

        // 3. Insertar Destinos (Manejo de Lugares)
        if (destinos && destinos.length > 0) {
            for (const d of destinos) {
                let lugarId = d.lugar_id;

                // Si no viene ID, intentar buscar o crear por nombre + comuna
                if (!lugarId && d.lugar_nombre && d.comuna_id) {
                    const [existing] = await conn.query(
                        'SELECT lug_id FROM LUGAR WHERE lug_nombre = ? AND lug_comunafk = ?',
                        [d.lugar_nombre, d.comuna_id]
                    );

                    if (existing.length > 0) {
                        lugarId = existing[0].lug_id;
                    } else {
                        const [resLugar] = await conn.query(
                            'INSERT INTO LUGAR (lug_nombre, lug_comunafk) VALUES (?, ?)',
                            [d.lugar_nombre, d.comuna_id]
                        );
                        lugarId = resLugar.insertId;
                    }
                }

                if (lugarId) {
                    await conn.query(
                        'INSERT INTO SOLICITUD_DESTINO (sde_solicitudfk, sde_lugarfk) VALUES (?, ?)',
                        [sol_id, lugarId]
                    );
                }
            }
        }

        await conn.commit();
        res.json({ message: 'Solicitud creada exitosamente', id: sol_id });

    } catch (error) {
        await conn.rollback();
        console.error("Error creating request:", error);
        res.status(500).json({ error: 'Error al crear la solicitud: ' + error.message });
    } finally {
        conn.release();
    }
});

// Obtener Mis Solicitudes
app.get('/api/requests/my', verifyToken, async (req, res) => {
    try {
        let query = "SELECT * FROM SOLICITUDES WHERE 1=1";
        const params = [];

        if (req.user.role === 'funcionario') {
            // Filtrar estrictamente por ID de usuario O por Nombre de Unidad (para compatibilidad)
            query += " AND (sol_idusuariofk = ? AND sol_unidad = ?)";
            params.push(req.user.id);
            params.push(req.user.name);
        } else {
            // Si es admin logueado, mostrar todos o filtro especifico? 
            // Para "Mis Solicitudes" asumimos las que creó él (idadminfk).
            query += " AND sol_idadminfk = ?";
            params.push(req.user.id);
        }

        query += " ORDER BY sol_fechasalida DESC";

        const [rows] = await pool.query(query, params);
        res.json(rows);
    } catch (error) {
        console.error("Error fetching my requests:", error);
        res.status(500).json({ error: 'Error al obtener mis solicitudes' });
    }
});

// Endpoint Login (sin cambios)
app.post('/api/auth/login', loginLimiter, async (req, res) => {
    const { email, password } = req.body; // email puede ser 'correo' (admin) o 'unidad' (usuario)

    try {
        let user = null;
        let role = '';
        let dbPassword = '';
        let userId = '';
        let userName = '';

        // 1. Intentar buscar en tabla ADMINISTRADOR (por correo)
        const [admins] = await pool.query('SELECT * FROM ADMINISTRADOR WHERE adm_correo = ?', [email]);

        if (admins.length > 0) {
            user = admins[0];
            role = 'admin';
            dbPassword = user.adm_password;
            userId = user.adm_id;
            userName = user.adm_correo; // Admin usa correo como nombre
        } else {
            // 2. Si no es admin, buscar en tabla USUARIO (por unidad)
            // Nota: En el frontend el campo se llama 'identifier', aquí llega como 'email'
            const [funcionarios] = await pool.query('SELECT * FROM USUARIO WHERE usu_unidad = ?', [email]);

            if (funcionarios.length > 0) {
                user = funcionarios[0];
                role = 'funcionario';
                dbPassword = user.usu_password;
                userId = user.usu_id;
                userName = user.usu_unidad;
            }
        }

        // Si no se encontró en ninguna tabla
        if (!user) {
            // Protección contra Time-Based Attacks
            await bcrypt.compare('dummy', '$2a$10$dummyhashdummyhashdummyhashdummyhashdummyhashdummyhash');
            return res.status(401).json({ error: 'Credenciales inválidas' });
        }

        // Verificar contraseña (BCRYPT)
        const validPassword = await bcrypt.compare(password, dbPassword);
        if (!validPassword) {
            return res.status(401).json({ error: 'Credenciales inválidas' });
        }

        // Crear Token JWT
        const token = jwt.sign(
            { id: userId, role: role, name: userName },
            SECRET_KEY,
            { expiresIn: '8h' }
        );

        // Enviar Cookie HttpOnly
        res.cookie('access_token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 8 * 60 * 60 * 1000
        });

        res.json({
            message: 'Login exitoso',
            user: { name: userName, role: role }
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// Logout
app.post('/api/auth/logout', (req, res) => {
    res.clearCookie('access_token');
    res.json({ message: 'Sesión cerrada' });
});

// Verificar Sesión
app.get('/api/auth/check', verifyToken, (req, res) => {
    res.json({ user: req.user });
});

// --- RUTA SETUP (Crear Admin por defecto si no existe) ---
app.get('/api/setup/create-admin', async (req, res) => {
    try {
        const adminEmail = process.env.ADMIN_INIT_EMAIL;
        const adminPassword = process.env.ADMIN_INIT_PASSWORD;

        if (!adminEmail || !adminPassword) {
            return res.status(500).json({ error: 'Configuración incompleta: ADMIN_INIT_EMAIL y ADMIN_INIT_PASSWORD son requeridos en .env' });
        }

        // Verificar tabla ADMINISTRADOR
        const [admins] = await pool.query("SELECT * FROM ADMINISTRADOR WHERE adm_correo = ?", [adminEmail]);

        if (admins.length === 0) {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(adminPassword, salt);

            await pool.query(
                "INSERT INTO ADMINISTRADOR (adm_correo, adm_password) VALUES (?, ?)",
                [adminEmail, hashedPassword]
            );
            return res.json({ message: `Admin creado: ${adminEmail}` });
        }

        res.json({ message: 'El admin ya existe.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error creando admin: ' + error.message });
    }
});


// --- RUTAS DE NEGOCIO ---
app.get('/api/comunas', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM COMUNA');
        res.json(rows);
    } catch (error) { // Error handling genérico
        console.error(error);
        res.status(500).json({ error: 'Error al obtener datos' });
    }
});

app.get('/api/passenger-types', verifyToken, async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM TIPO_PASAJERO');
        res.json(rows);
    } catch (error) {
        console.error("Error fetching passenger types:", error);
        res.status(500).json({ error: 'Error al obtener tipos de pasajero' });
    }
});

app.listen(PORT, () => {
    console.log(`🚀 Servidor Seguro corriendo en http://localhost:${PORT}`);
});