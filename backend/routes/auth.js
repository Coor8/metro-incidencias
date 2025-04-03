const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const router = express.Router();
const verifyToken = require('../middleware/verifyToken'); // Middleware de autenticación
const verifyAdmin = require('../middleware/verifyAdmin'); // Middleware para validar admin

require('dotenv').config(); // Para cargar variables de entorno desde .env

const SECRET_KEY = process.env.SECRET_KEY;
const REFRESH_SECRET_KEY = process.env.REFRESH_SECRET_KEY; 
const refreshTokens = []; // Array temporal para almacenar tokens de actualización

// REGISTRO DE USUARIO
router.post('/register', verifyToken, verifyAdmin, async (req, res) => { // 🔒 Solo Admin puede registrar usuarios
    try {
        const { nombre, correo, contraseña, rol } = req.body;

        if (!nombre || !correo || !contraseña) {
            return res.status(400).json({ message: 'Faltan datos' });
        }

        const usuarioExistente = await User.findOne({ correo });
        if (usuarioExistente) {
            return res.status(400).json({ message: 'El correo ya está registrado!!' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(contraseña, salt);

        const newUser = new User({ nombre, correo, contraseña: hashedPassword, rol: rol || 'usuario' });
        await newUser.save();

        res.status(201).json({ message: 'Usuario registrado correctamente' });
    } catch (error) {
        console.error('Error en register:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// LOGIN DE USUARIO
router.post('/login', async (req, res) => {
    try {
        const { correo, contraseña } = req.body;

        if (!correo || !contraseña) {
            return res.status(400).json({ message: 'Faltan datos' });
        }

        const usuario = await User.findOne({ correo });
        if (!usuario) {
            return res.status(400).json({ message: 'Usuario no encontrado' });
        }

        const isMatch = await bcrypt.compare(contraseña, usuario.contraseña);
        if (!isMatch) {
            return res.status(400).json({ message: 'Contraseña incorrecta' });
        }

        const token = jwt.sign(
            { id: usuario._id, rol: usuario.rol },
            SECRET_KEY,
            { expiresIn: '1h' }
        );

        const refreshToken = jwt.sign(
            { id: usuario._id, rol: usuario.rol },
            REFRESH_SECRET_KEY,
            { expiresIn: '7d' }
        );

        refreshTokens.push(refreshToken);

        res.json({
            token,
            refreshToken,
            usuario: {
                id: usuario._id,
                nombre: usuario.nombre,
                correo: usuario.correo,
                rol: usuario.rol
            }
        });
    } catch (error) {
        console.error('Error en login:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// RENOVAR TOKEN
router.post('/token', (req, res) => {
    const { refreshToken } = req.body;

    if (!refreshToken || !refreshTokens.includes(refreshToken)) {
        return res.status(403).json({ message: 'Refresh Token no válido' });
    }

    jwt.verify(refreshToken, REFRESH_SECRET_KEY, (err, usuario) => {
        if (err) return res.status(403).json({ message: 'Token inválido o expirado' });

        const newToken = jwt.sign(
            { id: usuario.id, rol: usuario.rol },
            SECRET_KEY,
            { expiresIn: '1h' }
        );

        res.json({ token: newToken });
    });
});

// CERRAR SESIÓN
router.post('/logout', (req, res) => {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.status(400).json({ message: 'No se proporcionó un Refresh Token' });

    const index = refreshTokens.indexOf(refreshToken);
    if (index > -1) {
        refreshTokens.splice(index, 1);
    }

    res.status(200).json({ message: 'Sesión cerrada exitosamente' });
});

// 🔥 NUEVOS ENDPOINTS PARA EL PANEL DE ADMINISTRACIÓN

// Obtener todos los usuarios (solo admin)
router.get('/users', verifyToken, verifyAdmin, async (req, res) => {
    try {
        const usuarios = await User.find();
        res.json(usuarios);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener los usuarios' });
    }
});

// Editar un usuario (solo admin)
router.put('/users/:id', verifyToken, verifyAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre, correo, rol } = req.body;

        const updatedUser = await User.findByIdAndUpdate(id, { nombre, correo, rol }, { new: true });
        res.json(updatedUser);
    } catch (error) {
        res.status(500).json({ error: 'Error al editar usuario' });
    }
});

// Eliminar un usuario (solo admin)
router.delete('/users/:id', verifyToken, verifyAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        await User.findByIdAndDelete(id);
        res.json({ message: 'Usuario eliminado correctamente' });
    } catch (error) {
        res.status(500).json({ error: 'Error al eliminar usuario' });
    }
});

module.exports = router;
