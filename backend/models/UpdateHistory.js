const mongoose = require('mongoose');

const UpdateHistorySchema = new mongoose.Schema({
    recursoId: { type: mongoose.Schema.Types.ObjectId, required: true },
    tipoRecurso: { type: String, required: true },
    accion: { type: String, required: true },
    descripcion: { type: String, required: true },
    usuarioModificador: { type: String, required: true }, // 🔥 Cambiar a String para guardar el nombre del usuario
    fecha: { type: Date, default: Date.now }
});

module.exports = mongoose.model('UpdateHistory', UpdateHistorySchema);
