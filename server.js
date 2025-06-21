require('dotenv').config();
const express = require('express');
const cors = require('cors');

// Import des routes
const routesMeteo = require('./routes/meteo');
const routesDemographie = require('./routes/demographie');
const routesConsommation = require('./routes/consommation');

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());

// Route de base
app.get('/', (req, res) => {
  res.json({ 
    message: 'Smart Energy Predictor API',
    version: '1.0.0',
    status: 'en ligne',
    routes: [
      'GET /meteo/:ville',
      'GET /demographie/:id',
      'POST /consommation',
      'POST /consommation/commentaires'
    ]
  });
});

// Configuration des routes
app.use('/meteo', routesMeteo);
app.use('/demographie', routesDemographie);
app.use('/consommation', routesConsommation);

// Démarrage du serveur
app.listen(PORT, () => {
  console.log(`🚀 Serveur API démarré sur le port ${PORT}`);
  console.log(`📡 Routes disponibles:`);
  console.log(`   GET  http://localhost:${PORT}/meteo/:ville`);
  console.log(`   GET  http://localhost:${PORT}/demographie/:id`);
  console.log(`   POST http://localhost:${PORT}/consommation`);
  console.log(`   POST http://localhost:${PORT}/consommation/commentaires`);
});