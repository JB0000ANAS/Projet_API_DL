 
const express = require('express');
const axios = require('axios');
const router = express.Router();

// GET /meteo/:ville - Récupère données météo
router.get('/:ville', async (req, res) => {
  try {
    const { ville } = req.params;
    const cleAPI = process.env.OPENWEATHER_API_KEY;
    const urlBase = process.env.OPENWEATHER_BASE_URL;
    
    if (!cleAPI) {
      return res.status(500).json({ 
        erreur: 'Clé API OpenWeather manquante' 
      });
    }

    const reponse = await axios.get(`${urlBase}/weather`, {
      params: {
        q: ville,
        appid: cleAPI,
        units: 'metric',
        lang: 'fr'
      }
    });

    const donneesMeteo = {
      ville: reponse.data.name,
      temperature: reponse.data.main.temp,
      humidite: reponse.data.main.humidity,
      description: reponse.data.weather[0].description,
      timestamp: new Date().toISOString()
    };

    res.json(donneesMeteo);
  } catch (erreur) {
    console.error('Erreur API météo:', erreur.message);
    res.status(500).json({ 
      erreur: 'Impossible de récupérer les données météo' 
    });
  }
});

module.exports = router;