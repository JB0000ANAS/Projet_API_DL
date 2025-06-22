 
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());

// Servir les fichiers statiques du dashboard
app.use('/dashboard', express.static(path.join(__dirname, 'dashboard')));

// Route principale - redirection vers le dashboard
app.get('/', (req, res) => {
  res.redirect('/dashboard');
});

// Routes API simples pour le dashboard
app.get('/meteo/:ville', (req, res) => {
  const { ville } = req.params;
  
  // Simulation de données météo
  const donneesMeteo = {
    ville: ville,
    temperature: 15 + Math.random() * 20,
    humidite: 40 + Math.random() * 40,
    description: 'Données simulées',
    timestamp: new Date().toISOString()
  };
  
  res.json(donneesMeteo);
});

app.get('/demographie/:id', (req, res) => {
  const { id } = req.params;
  
  // Simulation de données démographiques
  const donneesDemographiques = {
    idZone: parseInt(id),
    nomZone: `Quartier Zone ${id}`,
    population: Math.floor(Math.random() * 50000) + 10000,
    densiteHabitants: Math.floor(Math.random() * 5000) + 1000,
    typeZone: ['residentiel', 'commercial', 'mixte'][Math.floor(Math.random() * 3)],
    timestamp: new Date().toISOString()
  };
  
  res.json(donneesDemographiques);
});

app.post('/consommation', (req, res) => {
  const donnees = req.body;
  
  res.json({
    message: 'Données de consommation reçues',
    donnee: {
      id: Date.now(),
      ...donnees,
      recu: new Date().toISOString()
    }
  });
});

// Démarrage du serveur
app.listen(PORT, () => {
  console.log(`🚀 Smart Energy Predictor démarré sur le port ${PORT}`);
  console.log(`📱 Dashboard disponible sur: http://localhost:${PORT}/dashboard`);
  console.log(`🌐 API disponible sur: http://localhost:${PORT}`);
});