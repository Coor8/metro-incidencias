const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const authRoutes = require('./routes/auth');
const incidentRoutes = require('./routes/incidents');
const userRoutes = require('./routes/users');  // ✅ Nueva ruta para gestionar usuarios
const updateHistoryRoutes = require('./routes/history'); // ✅ Nueva ruta para el historial de actualizaciones

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => console.log('✅ MongoDB conectado')).catch(err => console.error(err));

// ✅ Rutas del backend
app.use('/api/auth', authRoutes);
app.use('/api/incidents', incidentRoutes);
app.use('/api/users', userRoutes);  
app.use('/api/history', updateHistoryRoutes); // ✅ Nueva ruta para historial

// ✅ Endpoint de Health Check para Render
app.get('/health', (req, res) => {
    res.status(200).send("Server is healthy!");
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`🚀 Servidor corriendo en puerto ${PORT}`));
