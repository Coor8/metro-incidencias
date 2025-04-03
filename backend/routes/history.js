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

module.exports = router;
