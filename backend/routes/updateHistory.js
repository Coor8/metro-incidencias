const express = require('express');
const router = express.Router();
const UpdateHistory = require('../models/UpdateHistory');
const verifyToken = require('../middleware/verifyToken');
const verifyAdmin = require('../middleware/verifyAdmin'); // Asegurar que solo admins puedan registrar cambios

// Obtener historial completo o filtrado por recurso
router.get('/', verifyToken, async (req, res) => {
    try {
        const { recursoId, tipoRecurso } = req.query;
        let query = {};

        if (recursoId) query.recursoId = recursoId;
        if (tipoRecurso) query.tipoRecurso = tipoRecurso;

        const historial = await UpdateHistory.find(query).sort({ fecha: -1 });
        res.json(historial);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener el historial' });
    }
});

// Registrar una nueva actualización en el historial
router.post('/', verifyToken, verifyAdmin, async (req, res) => {
    try {
        const { recursoId, tipoRecurso, accion, descripcion, usuarioModificador } = req.body;

        const nuevoHistorial = new UpdateHistory({
            recursoId,
            tipoRecurso,
            accion,
            descripcion,
            usuarioModificador
        });

        await nuevoHistorial.save();
        res.status(201).json({ message: 'Historial registrado correctamente' });
    } catch (error) {
        res.status(500).json({ message: 'Error al registrar el historial' });
    }
});


module.exports = router;

