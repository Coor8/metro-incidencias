const mongoose = require('mongoose');

const IncidentSchema = new mongoose.Schema({
    numeroReporte: { type: String, required: true, unique: true }, // Número de Reporte ÚNICO
    tipo: { type: String, required: true },
    descripcion: { type: String, required: true },
    linea: { type: String, required: true },
    estacion: { type: String, required: true },
    fecha: { type: Date, default: Date.now },
    estado: { type: String, enum: ['Pendiente', 'En revisión', 'Resuelto'], default: 'Pendiente' }
});

module.exports = mongoose.model('Incident', IncidentSchema);
