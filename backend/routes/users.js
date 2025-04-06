const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const UpdateHistory = require('../models/UpdateHistory'); // ✅ Importar el modelo de historial
const verifyToken = require('../middleware/verifyToken');
const verifyAdmin = require('../middleware/verifyAdmin');

// ✅ Obtener todos los usuarios (Solo accesible por un admin)
router.get('/', verifyToken, verifyAdmin, async (req, res) => {
    try {
        const usuarios = await User.find();
        res.json(usuarios);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener usuarios' });
    }
});

// ✅ Eliminar un usuario (Solo accesible por un admin)
router.delete('/:id', verifyToken, verifyAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const usuario = await User.findByIdAndDelete(id);

        if (!usuario) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        // ✅ Obtener el nombre del administrador que realiza la acción
        const admin = await User.findById(req.userId).select('nombre');

        // ✅ Registrar en el historial
        const nuevoHistorial = new UpdateHistory({
            recursoId: usuario._id,
            tipoRecurso: 'Usuario',
            accion: 'Eliminación',
            descripcion: `Usuario ${usuario.nombre} eliminado.`,
            usuarioModificador: admin ? admin.nombre : 'Admin desconocido',
            fecha: new Date()
        });
        await nuevoHistorial.save();

        res.json({ message: 'Usuario eliminado correctamente' });
    } catch (error) {
        res.status(500).json({ error: 'Error al eliminar usuario' });
    }
});

// ✅ Editar un usuario (Solo accesible por un admin)
router.put('/:id', verifyToken, verifyAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre, correo, rol } = req.body;

        const usuarioActualizado = await User.findByIdAndUpdate(id, { nombre, correo, rol }, { new: true });

        if (!usuarioActualizado) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        // ✅ Obtener el nombre del administrador que realiza la acción
        const admin = await User.findById(req.userId).select('nombre');

        // ✅ Registrar en el historial
        const nuevoHistorial = new UpdateHistory({
            recursoId: usuarioActualizado._id,
            tipoRecurso: 'Usuario',
            accion: 'Edición',
            descripcion: `Usuario ${nombre} editado.`,
            usuarioModificador: admin ? admin.nombre : 'Admin desconocido',
            fecha: new Date()
        });
        await nuevoHistorial.save();

        res.json(usuarioActualizado);
    } catch (error) {
        res.status(500).json({ error: 'Error al actualizar usuario' });
    }
});

// ✅ Crear un nuevo usuario (Solo accesible por un admin)
router.post('/register', verifyToken, verifyAdmin, async (req, res) => {
    try {
        const { nombre, correo, contraseña, rol } = req.body;

        // 🔒 Encriptar la contraseña antes de guardarla
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(contraseña, salt);

        const nuevoUsuario = new User({ nombre, correo, contraseña: hashedPassword, rol });
        await nuevoUsuario.save();

        const admin = await User.findById(req.userId).select('nombre');

        const nuevoHistorial = new UpdateHistory({
            recursoId: nuevoUsuario._id,
            tipoRecurso: 'Usuario',
            accion: 'Creación',
            descripcion: `Usuario ${nombre} creado con rol ${rol}.`,
            usuarioModificador: admin ? admin.nombre : 'Admin desconocido',
            fecha: new Date()
        });
        await nuevoHistorial.save();

        res.status(201).json({ message: 'Usuario creado correctamente' });
    } catch (error) {
        res.status(500).json({ error: 'Error al crear usuario' });
    }
});


// ✅ Obtener el historial de actualizaciones
router.get('/history', verifyToken, verifyAdmin, async (req, res) => {
    try {
        const historial = await UpdateHistory.find().sort({ fecha: -1 });
        res.json(historial);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener el historial de actualizaciones' });
    }
});

module.exports = router;
