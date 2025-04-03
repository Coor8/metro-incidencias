const express = require('express');
const router = express.Router();
const Incident = require('../models/Incident');
const UpdateHistory = require('../models/UpdateHistory'); // ✅ Importar el modelo de historial
const User = require('../models/User'); // ✅ Importar el modelo de usuario
const verifyToken = require('../middleware/verifyToken'); 
const verifyAdmin = require('../middleware/verifyAdmin'); 

// Crear una nueva incidencia (Cualquier usuario autenticado puede hacerlo)
router.post('/', verifyToken, async (req, res) => {
    try {
        const newIncident = new Incident(req.body);
        await newIncident.save();

        // ✅ Obtener el nombre del usuario que realiza la acción
        const user = await User.findById(req.userId).select('nombre');

        // ✅ Registrar en el historial
        const nuevoHistorial = new UpdateHistory({
            recursoId: newIncident._id,
            tipoRecurso: 'Incidencia',
            accion: 'Creación',
            descripcion: `Nueva incidencia creada con tipo: ${req.body.tipo}.`,
            usuarioModificador: user ? user.nombre : 'Usuario desconocido', // ✅ Guardar el nombre del usuario
            fecha: new Date()
        });
        await nuevoHistorial.save();

        res.status(201).json({ message: 'Incidencia registrada correctamente' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Obtener todas las incidencias (Disponible para cualquier usuario autenticado)
router.get('/', verifyToken, async (req, res) => {
    try {
        const { fechaInicio, fechaFin } = req.query;
        let query = {};

        if (fechaInicio && fechaFin) {
            query.fecha = { 
                $gte: new Date(fechaInicio), 
                $lte: new Date(fechaFin)
            };
        }

        const incidents = await Incident.find(query);
        res.json(incidents);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Editar una incidencia (Solo admins pueden editar)
router.put('/:id', verifyToken, verifyAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const updatedIncident = await Incident.findByIdAndUpdate(id, req.body, { new: true });

        if (!updatedIncident) {
            return res.status(404).json({ error: 'Incidencia no encontrada' });
        }

        // ✅ Obtener el nombre del usuario que realiza la acción
        const user = await User.findById(req.userId).select('nombre');

        // ✅ Registrar en el historial
        const nuevoHistorial = new UpdateHistory({
            recursoId: updatedIncident._id,
            tipoRecurso: 'Incidencia',
            accion: 'Edición',
            descripcion: `Incidencia con ID ${id} fue actualizada.`,
            usuarioModificador: user ? user.nombre : 'Usuario desconocido',
            fecha: new Date()
        });
        await nuevoHistorial.save();

        res.json(updatedIncident);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Eliminar una incidencia (Solo admins pueden eliminar)
router.delete('/:id', verifyToken, verifyAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const incidenteEliminado = await Incident.findByIdAndDelete(id);

        if (!incidenteEliminado) {
            return res.status(404).json({ error: 'Incidencia no encontrada' });
        }

        // ✅ Obtener el nombre del usuario que realiza la acción
        const user = await User.findById(req.userId).select('nombre');

        // ✅ Registrar en el historial
        const nuevoHistorial = new UpdateHistory({
            recursoId: incidenteEliminado._id,
            tipoRecurso: 'Incidencia',
            accion: 'Eliminación',
            descripcion: `Incidencia con ID ${id} fue eliminada.`,
            usuarioModificador: user ? user.nombre : 'Usuario desconocido',
            fecha: new Date()
        });
        await nuevoHistorial.save();

        res.json({ message: 'Incidencia eliminada correctamente' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
