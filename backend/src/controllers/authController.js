const pool = require('../../db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Usar variable de entorno obligatoria para seguridad
const CLAVE_SECRETA = process.env.JWT_SECRET;

exports.iniciarSesion = async (req, res) => {
    // Recibimos "usuario" (puede ser correo o unidad) y "clave"
    const { usuario, clave } = req.body;

    if (!CLAVE_SECRETA) {
        console.error('CRITICAL: JWT_SECRET no está definido en variables de entorno');
        return res.status(500).json({ error: 'Error de configuración del servidor' });
    }

    try {
        let entidadUsuario = null;
        let rol = '';
        let passwordBaseDatos = '';
        let idUsuario = '';
        let nombreUsuario = '';

        // 1. Buscar en tabla Administrador (usuario se trata como correo)
        const [administradores] = await pool.query('SELECT * FROM ADMINISTRADOR WHERE adm_correo = ?', [usuario]);

        if (administradores.length > 0) {
            entidadUsuario = administradores[0];
            rol = 'admin';
            passwordBaseDatos = entidadUsuario.adm_password;
            idUsuario = entidadUsuario.adm_id;
            nombreUsuario = entidadUsuario.adm_correo;
        } else {
            // 2. Buscar en tabla Funcionario (usuario se trata como unidad)
            const [funcionarios] = await pool.query('SELECT * FROM USUARIO WHERE usu_unidad = ?', [usuario]);

            if (funcionarios.length > 0) {
                entidadUsuario = funcionarios[0];
                rol = 'funcionario';
                passwordBaseDatos = entidadUsuario.usu_password;
                idUsuario = entidadUsuario.usu_id;
                nombreUsuario = entidadUsuario.usu_unidad;
            }
        }

        if (!entidadUsuario) {
            // Protección contra ataques de tiempo (Timing Attacks)
            await bcrypt.compare('dummy', '$2a$10$dummyhashdummyhashdummyhashdummyhashdummyhashdummyhash');
            return res.status(401).json({ error: 'Credenciales inválidas' });
        }

        // Verificar contraseña
        const claveValida = await bcrypt.compare(clave, passwordBaseDatos);
        if (!claveValida) {
            return res.status(401).json({ error: 'Credenciales inválidas' });
        }

        // Generar Token JWT
        const token = jwt.sign(
            { id: idUsuario, rol: rol, nombre: nombreUsuario },
            CLAVE_SECRETA,
            { expiresIn: '8h' }
        );

        // Establecer Cookie HTTP-Only (Seguridad Máxima)
        res.cookie('access_token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 8 * 60 * 60 * 1000 // 8 Horas
        });

        res.json({
            message: 'Inicio de sesión exitoso',
            usuario: { nombre: nombreUsuario, rol: rol }
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};

exports.cerrarSesion = (req, res) => {
    res.clearCookie('access_token');
    res.json({ message: 'Sesión cerrada' });
};

exports.verificarSesion = (req, res) => {
    res.json({ usuario: req.usuario });
};

exports.crearAdministrador = async (req, res) => {
    try {
        const emailAdmin = process.env.ADMIN_INIT_EMAIL;
        const passwordAdmin = process.env.ADMIN_INIT_PASSWORD;

        if (!emailAdmin || !passwordAdmin) {
            return res.status(500).json({ error: 'Configuración incompleta: ADMIN_INIT_EMAIL y ADMIN_INIT_PASSWORD son requeridos en .env' });
        }

        const [admins] = await pool.query("SELECT * FROM ADMINISTRADOR WHERE adm_correo = ?", [emailAdmin]);

        if (admins.length === 0) {
            const salt = await bcrypt.genSalt(10);
            const passwordHashed = await bcrypt.hash(passwordAdmin, salt);

            await pool.query(
                "INSERT INTO ADMINISTRADOR (adm_correo, adm_password) VALUES (?, ?)",
                [emailAdmin, passwordHashed]
            );
            return res.json({ message: `Admin creado: ${emailAdmin}` });
        }

        res.json({ message: 'El admin ya existe.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error creando admin: ' + error.message });
    }
};

