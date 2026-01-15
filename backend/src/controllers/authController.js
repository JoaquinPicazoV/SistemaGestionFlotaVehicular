const pool = require('../../db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Usar variable de entorno obligatoria para seguridad
const CLAVE_SECRETA = process.env.JWT_SECRET;

exports.login = async (req, res) => {
    const { email, password } = req.body;

    if (!CLAVE_SECRETA) {
        console.error('CRITICAL: JWT_SECRET no está definido en variables de entorno');
        return res.status(500).json({ error: 'Error de configuración del servidor' });
    }

    try {
        let usuario = null;
        let rol = '';
        let passwordBaseDatos = '';
        let idUsuario = '';
        let nombreUsuario = '';

        // Buscar en tabla Administrador
        const [administradores] = await pool.query('SELECT * FROM ADMINISTRADOR WHERE adm_correo = ?', [email]);

        if (administradores.length > 0) {
            usuario = administradores[0];
            rol = 'admin';
            passwordBaseDatos = usuario.adm_password;
            idUsuario = usuario.adm_id;
            nombreUsuario = usuario.adm_correo;
        } else {
            // Buscar en tabla Funcionario
            const [funcionarios] = await pool.query('SELECT * FROM USUARIO WHERE usu_unidad = ?', [email]);

            if (funcionarios.length > 0) {
                usuario = funcionarios[0];
                rol = 'funcionario';
                passwordBaseDatos = usuario.usu_password;
                idUsuario = usuario.usu_id;
                nombreUsuario = usuario.usu_unidad;
            }
        }

        if (!usuario) {
            // Protección contra timing attacks
            await bcrypt.compare('dummy', '$2a$10$dummyhashdummyhashdummyhashdummyhashdummyhashdummyhash');
            return res.status(401).json({ error: 'Credenciales inválidas' });
        }

        // Verificar contraseña
        const claveValida = await bcrypt.compare(password, passwordBaseDatos);
        if (!claveValida) {
            return res.status(401).json({ error: 'Credenciales inválidas' });
        }

        // Generar JWT
        const token = jwt.sign(
            { id: idUsuario, role: rol, name: nombreUsuario },
            CLAVE_SECRETA,
            { expiresIn: '8h' }
        );

        // Establecer Cookie HTTP-Only
        res.cookie('access_token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 8 * 60 * 60 * 1000
        });

        res.json({
            message: 'Login exitoso',
            user: { name: nombreUsuario, role: rol }
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};

exports.logout = (req, res) => {
    res.clearCookie('access_token');
    res.json({ message: 'Sesión cerrada' });
};

exports.checkAuth = (req, res) => {
    res.json({ user: req.user });
};

exports.createAdmin = async (req, res) => {
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
