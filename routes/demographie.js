 
const express = require('express');
const axios = require('axios');
const router = express.Router();

// GET /demographie/:id - Récupère données démographiques simulées
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const urlBase = process.env.JSONPLACEHOLDER_BASE_URL;
    
    // Récupération utilisateur simulé
    const reponseUtilisateur = await axios.get(`${urlBase}/users/${id}`);
    
    // Simulation de données démographiques urbaines
    const donneesDemographiques = {
      idZone: id,
      nomZone: `Quartier ${reponseUtilisateur.data.name}`,
      population: Math.floor(Math.random() * 50000) + 10000,
      densiteHabitants: Math.floor(Math.random() * 5000) + 1000,
      nombreLogements: Math.floor(Math.random() * 20000) + 5000,
      typeZone: ['residentiel', 'commercial', 'mixte'][Math.floor(Math.random() * 3)],
      coordonnees: {
        latitude: parseFloat(reponseUtilisateur.data.address.geo.lat),
        longitude: parseFloat(reponseUtilisateur.data.address.geo.lng)
      },
      timestamp: new Date().toISOString()
    };

    res.json(donneesDemographiques);
  } catch (erreur) {
    console.error('Erreur API démographie:', erreur.message);
    res.status(500).json({ 
      erreur: 'Impossible de récupérer les données démographiques' 
    });
  }
});

module.exports = router;