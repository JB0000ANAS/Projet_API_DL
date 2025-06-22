 
const axios = require('axios');
const fs = require('fs').promises;
const path = require('path');
require('dotenv').config();

class CollecteurMeteo {
  constructor() {
    this.cleAPI = process.env.OPENWEATHER_API_KEY;
    this.urlBase = process.env.OPENWEATHER_BASE_URL;
    this.villes = ['Paris', 'Lyon', 'Marseille', 'Toulouse', 'Nice'];
    this.dossierDonnees = path.join(__dirname, '..', 'donnees', 'brutes');
  }

  async collecterDonneesMeteo() {
    console.log('🌤️  Début collecte données météo...');
    const horodatage = new Date().toISOString();
    const donneesCollectees = [];

    for (const ville of this.villes) {
      try {
        console.log(`   📡 Collecte météo pour ${ville}...`);
        
        const reponse = await axios.get(`${this.urlBase}/weather`, {
          params: {
            q: ville,
            appid: this.cleAPI,
            units: 'metric',
            lang: 'fr'
          }
        });

        const donneesMeteo = {
          ville: reponse.data.name,
          temperature: reponse.data.main.temp,
          humidite: reponse.data.main.humidity,
          pression: reponse.data.main.pressure,
          vitesseVent: reponse.data.wind?.speed || 0,
          nebulosite: reponse.data.clouds.all,
          description: reponse.data.weather[0].description,
          horodatage: horodatage,
          coordonnees: {
            lat: reponse.data.coord.lat,
            lon: reponse.data.coord.lon
          }
        };

        donneesCollectees.push(donneesMeteo);
        console.log(`   ✅ ${ville}: ${donneesMeteo.temperature}°C`);
        
        // Pause entre requêtes pour respecter les limites de l'API
        await new Promise(resolve => setTimeout(resolve, 100));
        
      } catch (erreur) {
        console.error(`   ❌ Erreur collecte ${ville}:`, erreur.message);
      }
    }

    // Sauvegarde des données
    await this.sauvegarderDonnees(donneesCollectees, 'meteo');
    console.log(`✅ Collecte météo terminée: ${donneesCollectees.length} villes`);
    
    return donneesCollectees;
  }

  async sauvegarderDonnees(donnees, type) {
    try {
      const nomFichier = `${type}_${new Date().toISOString().split('T')[0]}_${Date.now()}.json`;
      const cheminFichier = path.join(this.dossierDonnees, nomFichier);
      
      await fs.writeFile(cheminFichier, JSON.stringify(donnees, null, 2));
      console.log(`💾 Données sauvegardées: ${nomFichier}`);
    } catch (erreur) {
      console.error('❌ Erreur sauvegarde:', erreur.message);
    }
  }
}

module.exports = CollecteurMeteo;