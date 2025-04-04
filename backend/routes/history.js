// backend/routes/history.js
const express = require('express');
const router = express.Router();
const UpdateHistory = require('../models/UpdateHistory');
const verifyToken = require('../middleware/verifyToken');
const verifyAdmin = require('../middleware/verifyAdmin');

// Obtener todo el historial (Solo accesible por un admin)
router.get('/', verifyToken, verifyAdmin, async (req, res) => {
    try {
        const historial = await UpdateHistory.find().sort({ fecha: -1 }); // Ordena por fecha descendente
        res.json(historial);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener el historial de actualizaciones.' });
    }
});


// 🚀 NUEVA RUTA: Limpiar registros viejos del historial
router.delete('/clean', verifyToken, verifyAdmin, async (req, res) => {
    try {
        const { months = 0, days = 0 } = req.query; 
        const limitDate = new Date();

        if (months > 0) limitDate.setMonth(limitDate.getMonth() - months);
        if (days > 0) limitDate.setDate(limitDate.getDate() - days);

        const result = await UpdateHistory.deleteMany({ fecha: { $lt: limitDate } });

        res.status(200).json({ message: `Se eliminaron ${result.deletedCount} registros antiguos.` });
    } catch (error) {
        res.status(500).json({ message: 'Error al limpiar el historial.', error });
    }
});


module.exports = router;

