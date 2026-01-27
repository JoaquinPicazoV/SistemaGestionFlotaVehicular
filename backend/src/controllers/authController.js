const pool = require('../../db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const CLAVE_SECRETA = process.env.JWT_SECRET;

exports.iniciarSesion = async (req, res) => {
    let { usuario, clave } = req.body;

    if (usuario) usuario = usuario.trim();
    if (clave) clave = clave.trim();

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

        const [administradores] = await pool.query('SELECT * FROM ADMINISTRADOR WHERE adm_correo = ?', [usuario]);

        if (administradores.length > 0) {
            entidadUsuario = administradores[0];
            rol = 'admin';
            passwordBaseDatos = entidadUsuario.adm_password;
            idUsuario = entidadUsuario.adm_id;
            nombreUsuario = entidadUsuario.adm_correo;
        } else {
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
            await bcrypt.compare(clave || 'dummy', '$2a$10$abcdefghijabcdefghijabcdefghijabcdefghijabcdefghijXY');
            return res.status(401).json({ error: 'Credenciales inválidas' });
        }

        const claveValida = await bcrypt.compare(clave, passwordBaseDatos);
        if (!claveValida) {
            return res.status(401).json({ error: 'Credenciales inválidas' });
        }

        const token = jwt.sign(
            { id: idUsuario, rol: rol, nombre: nombreUsuario },
            CLAVE_SECRETA,
            { expiresIn: '8h' }
        );

        res.cookie('access_token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 8 * 60 * 60 * 1000
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

