const jwt = require('jsonwebtoken');
require('dotenv').config();

const SECRET_KEY = process.env.SECRET_KEY;

const verifyToken = (req, res, next) => {
    const token = req.headers['authorization'];

    if (!token) {
        return res.status(403).json({ error: 'Token no proporcionado' });
    }

    const bearerToken = token.split(' ')[1]; // Asegúrate de que se está enviando como 'Bearer <TOKEN>'

    jwt.verify(bearerToken, SECRET_KEY, (err, decoded) => {
        if (err) {
            return res.status(401).json({ error: 'Token inválido o expirado' });
        }

        // ✅ Asegúrate de que el token contiene el id y el rol
        if (!decoded.id || !decoded.rol) {
            return res.status(400).json({ error: 'Token inválido, falta información requerida.' });
        }

        req.userId = decoded.id;
        req.userRole = decoded.rol; // ✅ Esto es importante para validar el rol después

        next();
    });
};

module.exports = verifyToken;
