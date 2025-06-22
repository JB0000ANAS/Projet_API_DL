 
const CollecteurMeteo = require('./collecteur-meteo');
const axios = require('axios');
const fs = require('fs').promises;
const path = require('path');
require('dotenv').config();

class CollecteurPrincipal {
  constructor() {
    this.collecteurMeteo = new CollecteurMeteo();
    this.dossierDonnees = path.join(__dirname, '..', 'donnees', 'brutes');
    this.intervalleCollecte = 30 * 60 * 1000; // 30 minutes
  }

  async collecterDonneesDemographiques() {
    console.log('👥 Début collecte données démographiques...');
    const donneesCollectees = [];

    // Collecte pour 10 zones urbaines simulées
    for (let i = 1; i <= 10; i++) {
      try {
        const reponse = await axios.get(`${process.env.JSONPLACEHOLDER_BASE_URL}/users/${i}`);
        
        const donneesDemographiques = {
          idZone: i,
          nomZone: `Quartier ${reponse.data.name}`,
          population: Math.floor(Math.random() * 50000) + 10000,
          densiteHabitants: Math.floor(Math.random() * 5000) + 1000,
          nombreLogements: Math.floor(Math.random() * 20000) + 5000,
          typeZone: ['residentiel', 'commercial', 'mixte', 'industriel'][Math.floor(Math.random() * 4)],
          coordonnees: {
            latitude: parseFloat(reponse.data.address.geo.lat),
            longitude: parseFloat(reponse.data.address.geo.lng)
          },
          horodatage: new Date().toISOString()
        };

        donneesCollectees.push(donneesDemographiques);
        console.log(`   ✅ Zone ${i}: ${donneesDemographiques.population} habitants`);
        
        await new Promise(resolve => setTimeout(resolve, 50));
        
      } catch (erreur) {
        console.error(`   ❌ Erreur zone ${i}:`, erreur.message);
      }
    }

    await this.sauvegarderDonnees(donneesCollectees, 'demographie');
    console.log(`✅ Collecte démographique terminée: ${donneesCollectees.length} zones`);
    
    return donneesCollectees;
  }

  async simulerConsommationEnergetique() {
    console.log('⚡ Génération données consommation énergétique...');
    const donneesConsommation = [];
    const heureActuelle = new Date();

    // Simulation pour 10 zones sur 24h (par tranche de 1h)
    for (let zone = 1; zone <= 10; zone++) {
      for (let heure = 0; heure < 24; heure++) {
        const horodatage = new Date(heureActuelle);
        horodatage.setHours(heure, 0, 0, 0);

        // Simulation réaliste basée sur l'heure et le type de zone
        const facteurHeure = this.obtenirFacteurConsommation(heure);
        const consommationBase = Math.random() * 1000 + 500; // Entre 500 et 1500 kWh
        const consommation = consommationBase * facteurHeure;

        const donneesConsommation_element = {
          idZone: zone,
          consommationKwh: Math.round(consommation * 100) / 100,
          typeEnergie: 'electrique',
          horodatage: horodatage.toISOString(),
          facteurs: {
            heurePointe: heure >= 18 && heure <= 21,
            weekend: horodatage.getDay() === 0 || horodatage.getDay() === 6,
            saison: this.obtenirSaison(horodatage)
          }
        };

        donneesConsommation.push(donneesConsommation_element);
      }
    }

    await this.sauvegarderDonnees(donneesConsommation, 'consommation');
    console.log(`✅ Simulation consommation terminée: ${donneesConsommation.length} points de données`);
    
    return donneesConsommation;
  }

  obtenirFacteurConsommation(heure) {
    // Facteurs réalistes de consommation selon l'heure
    const facteurs = {
      0: 0.6, 1: 0.5, 2: 0.5, 3: 0.5, 4: 0.5, 5: 0.6,
      6: 0.8, 7: 1.0, 8: 1.2, 9: 1.0, 10: 0.9, 11: 0.9,
      12: 1.1, 13: 1.0, 14: 0.9, 15: 0.9, 16: 1.0, 17: 1.2,
      18: 1.5, 19: 1.6, 20: 1.4, 21: 1.2, 22: 1.0, 23: 0.8
    };
    return facteurs[heure] || 1.0;
  }

  obtenirSaison(date) {
    const mois = date.getMonth() + 1;
    if (mois >= 3 && mois <= 5) return 'printemps';
    if (mois >= 6 && mois <= 8) return 'ete';
    if (mois >= 9 && mois <= 11) return 'automne';
    return 'hiver';
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

  async lancerCollecteComplete() {
    console.log('🚀 Lancement collecte complète de données...');
    console.log('=====================================');
    
    try {
      // Collecte de toutes les données
      const donneesMeteo = await this.collecteurMeteo.collecterDonneesMeteo();
      const donneesDemographiques = await this.collecterDonneesDemographiques();
      const donneesConsommation = await this.simulerConsommationEnergetique();
      
      console.log('=====================================');
      console.log('✅ Collecte complète terminée !');
      console.log(`📊 Total: ${donneesMeteo.length + donneesDemographiques.length + donneesConsommation.length} points de données`);
      
      return {
        meteo: donneesMeteo,
        demographie: donneesDemographiques,
        consommation: donneesConsommation
      };
      
    } catch (erreur) {
      console.error('❌ Erreur collecte complète:', erreur.message);
      throw erreur;
    }
  }

  demarrerCollecteAutomatique() {
    console.log(`🔄 Collecte automatique démarrée (intervalle: ${this.intervalleCollecte / 1000 / 60} minutes)`);
    
    // Première collecte immédiate
    this.lancerCollecteComplete();
    
    // Collectes suivantes à intervalle régulier
    setInterval(() => {
      this.lancerCollecteComplete();
    }, this.intervalleCollecte);
  }
}

module.exports = CollecteurPrincipal;

// Si le script est exécuté directement
if (require.main === module) {
  const collecteur = new CollecteurPrincipal();
  collecteur.lancerCollecteComplete()
    .then(() => console.log('Script terminé'))
    .catch(erreur => console.error('Erreur:', erreur));
}