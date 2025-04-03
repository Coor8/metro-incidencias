const jwt = require('jsonwebtoken');
const User = require('../models/User');
require('dotenv').config();

const SECRET_KEY = process.env.SECRET_KEY;

const verifyAdmin = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        
        if (!authHeader) {
            return res.status(403).json({ message: "No se proporcionó un token" });
        }

        const token = authHeader.split(" ")[1];
        const decoded = jwt.verify(token, SECRET_KEY);

        // Obtener el rol del token decodificado
        const { rol } = decoded;

        if (rol === 'admin') {
            next(); // ✅ Si el usuario es admin, permite continuar
        } else {
            return res.status(403).json({ error: 'Acceso denegado. Requiere permisos de administrador.' });
        }
    } catch (error) {
        console.error('Error en la autenticación de administrador:', error.message);
        return res.status(401).json({ message: "Token inválido o expirado" });
    }
};

module.exports = verifyAdmin;
