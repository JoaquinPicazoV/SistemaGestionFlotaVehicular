const pool = require('../../db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const SECRET_KEY = process.env.JWT_SECRET || 'dev_secret_key_change_in_prod';

exports.login = async (req, res) => {
    const { email, password } = req.body;

    try {
        let user = null;
        let role = '';
        let dbPassword = '';
        let userId = '';
        let userName = '';

        // Buscar en tabla Administrador
        const [admins] = await pool.query('SELECT * FROM ADMINISTRADOR WHERE adm_correo = ?', [email]);

        if (admins.length > 0) {
            user = admins[0];
            role = 'admin';
            dbPassword = user.adm_password;
            userId = user.adm_id;
            userName = user.adm_correo;
        } else {
            // Buscar en tabla Funcionario
            const [funcionarios] = await pool.query('SELECT * FROM USUARIO WHERE usu_unidad = ?', [email]);

            if (funcionarios.length > 0) {
                user = funcionarios[0];
                role = 'funcionario';
                dbPassword = user.usu_password;
                userId = user.usu_id;
                userName = user.usu_unidad;
            }
        }

        if (!user) {
            // Protección contra timing attacks
            await bcrypt.compare('dummy', '$2a$10$dummyhashdummyhashdummyhashdummyhashdummyhashdummyhash');
            return res.status(401).json({ error: 'Credenciales inválidas' });
        }

        // Verificar contraseña
        const validPassword = await bcrypt.compare(password, dbPassword);
        if (!validPassword) {
            return res.status(401).json({ error: 'Credenciales inválidas' });
        }

        // Generar JWT
        const token = jwt.sign(
            { id: userId, role: role, name: userName },
            SECRET_KEY,
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
            user: { name: userName, role: role }
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
        const adminEmail = process.env.ADMIN_INIT_EMAIL;
        const adminPassword = process.env.ADMIN_INIT_PASSWORD;

        if (!adminEmail || !adminPassword) {
            return res.status(500).json({ error: 'Configuración incompleta: ADMIN_INIT_EMAIL y ADMIN_INIT_PASSWORD son requeridos en .env' });
        }

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
};
