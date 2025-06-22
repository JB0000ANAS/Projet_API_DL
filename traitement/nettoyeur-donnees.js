 
const fs = require('fs').promises;
const path = require('path');

class NettoyeurDonnees {
  constructor() {
    this.dossierBrutes = path.join(__dirname, '..', 'donnees', 'brutes');
    this.dossierTraitees = path.join(__dirname, '..', 'donnees', 'traitees');
  }

  async nettoyerToutesDonnees() {
    console.log('🧹 Nettoyage des données...');
    console.log('=====================================');

    try {
      // Créer dossier traité
      await fs.mkdir(this.dossierTraitees, { recursive: true });

      const fichiers = await fs.readdir(this.dossierBrutes);
      const donneesNettoyees = {
        meteo: [],
        demographie: [],
        consommation: []
      };

      // Traiter chaque fichier
      for (const fichier of fichiers) {
        if (fichier.endsWith('.json')) {
          console.log(`🔧 Nettoyage ${fichier}...`);
          
          const cheminFichier = path.join(this.dossierBrutes, fichier);
          const contenu = await fs.readFile(cheminFichier, 'utf8');
          
          try {
            const donnees = JSON.parse(contenu);
            
            if (Array.isArray(donnees) && donnees.length > 0) {
              const donneesNettoyeesFichier = this.nettoyerFichier(donnees, fichier);
              
              // Classer par type
              if (fichier.includes('meteo')) {
                donneesNettoyees.meteo.push(...donneesNettoyeesFichier);
              } else if (fichier.includes('demographie')) {
                donneesNettoyees.demographie.push(...donneesNettoyeesFichier);
              } else if (fichier.includes('consommation')) {
                donneesNettoyees.consommation.push(...donneesNettoyeesFichier);
              }
              
              console.log(`   ✅ ${donneesNettoyeesFichier.length} entrées nettoyées`);
            } else {
              console.log(`   ⚠️  Fichier vide ou invalide, ignoré`);
            }
          } catch (erreur) {
            console.log(`   ❌ Erreur parsing ${fichier}: ${erreur.message}`);
          }
        }
      }

      // Dédoublonner et trier
      donneesNettoyees.meteo = this.dedoublonner(donneesNettoyees.meteo, 'ville');
      donneesNettoyees.demographie = this.dedoublonner(donneesNettoyees.demographie, 'idZone');
      donneesNettoyees.consommation = this.trierParDate(donneesNettoyees.consommation);

      // Sauvegarder données nettoyées
      await this.sauvegarderDonneesNettoyees(donneesNettoyees);
      
      // Afficher résumé
      this.afficherResume(donneesNettoyees);
      
      return donneesNettoyees;

    } catch (erreur) {
      console.error('❌ Erreur nettoyage:', erreur.message);
      throw erreur;
    }
  }

  nettoyerFichier(donnees, nomFichier) {
    return donnees
      .filter(element => this.estValide(element, nomFichier))
      .map(element => this.normaliserElement(element, nomFichier));
  }

  estValide(element, nomFichier) {
    // Vérifications de base
    if (!element || typeof element !== 'object') return false;
    
    if (nomFichier.includes('meteo')) {
      return element.temperature !== undefined && 
             element.temperature >= -50 && 
             element.temperature <= 60 &&
             element.humidite >= 0 && 
             element.humidite <= 100 &&
             element.ville;
    }
    
    if (nomFichier.includes('demographie')) {
      return element.idZone !== undefined &&
             element.population > 0 &&
             element.population < 10000000 &&
             element.densiteHabitants > 0;
    }
    
    if (nomFichier.includes('consommation')) {
      return element.idZone !== undefined &&
             element.consommationKwh >= 0 &&
             element.consommationKwh <= 10000 &&
             element.horodatage;
    }
    
    return true;
  }

  normaliserElement(element, nomFichier) {
    const elementNormalise = { ...element };
    
    if (nomFichier.includes('meteo')) {
      // Arrondir les valeurs numériques
      elementNormalise.temperature = Math.round(elementNormalise.temperature * 100) / 100;
      elementNormalise.humidite = Math.round(elementNormalise.humidite);
      
      // Standardiser le format de date
      if (elementNormalise.horodatage) {
        elementNormalise.horodatage = new Date(elementNormalise.horodatage).toISOString();
      }
      
      // Nettoyer la ville (première lettre majuscule)
      if (elementNormalise.ville) {
        elementNormalise.ville = elementNormalise.ville.charAt(0).toUpperCase() + 
                                elementNormalise.ville.slice(1).toLowerCase();
      }
    }
    
    if (nomFichier.includes('demographie')) {
      // Arrondir les populations
      elementNormalise.population = Math.round(elementNormalise.population);
      elementNormalise.densiteHabitants = Math.round(elementNormalise.densiteHabitants);
      elementNormalise.nombreLogements = Math.round(elementNormalise.nombreLogements);
      
      // Standardiser les coordonnées
      if (elementNormalise.coordonnees) {
        elementNormalise.coordonnees.latitude = Math.round(elementNormalise.coordonnees.latitude * 1000000) / 1000000;
        elementNormalise.coordonnees.longitude = Math.round(elementNormalise.coordonnees.longitude * 1000000) / 1000000;
      }
    }
    
    if (nomFichier.includes('consommation')) {
      // Arrondir la consommation
      elementNormalise.consommationKwh = Math.round(elementNormalise.consommationKwh * 100) / 100;
      
      // Standardiser la date
      elementNormalise.horodatage = new Date(elementNormalise.horodatage).toISOString();
      
      // Convertir idZone en nombre
      elementNormalise.idZone = parseInt(elementNormalise.idZone);
    }
    
    return elementNormalise;
  }

  dedoublonner(donnees, cleUnique) {
    const vues = new Set();
    return donnees.filter(element => {
      const cle = element[cleUnique];
      if (vues.has(cle)) {
        return false;
      }
      vues.add(cle);
      return true;
    });
  }

  trierParDate(donnees) {
    return donnees.sort((a, b) => {
      if (a.horodatage && b.horodatage) {
        return new Date(a.horodatage) - new Date(b.horodatage);
      }
      return 0;
    });
  }

  async sauvegarderDonneesNettoyees(donnees) {
    const horodatage = new Date().toISOString().split('T')[0];
    
    // Sauvegarder chaque type séparément
    for (const [type, data] of Object.entries(donnees)) {
      if (data.length > 0) {
        const nomFichier = `${type}_nettoye_${horodatage}.json`;
        const cheminFichier = path.join(this.dossierTraitees, nomFichier);
        
        await fs.writeFile(cheminFichier, JSON.stringify(data, null, 2));
        console.log(`💾 Sauvegardé: ${nomFichier} (${data.length} entrées)`);
      }
    }
    
    // Sauvegarder également un fichier consolidé
    const fichierConsolide = `donnees_consolidees_${horodatage}.json`;
    const cheminConsolide = path.join(this.dossierTraitees, fichierConsolide);
    
    await fs.writeFile(cheminConsolide, JSON.stringify(donnees, null, 2));
    console.log(`📦 Fichier consolidé: ${fichierConsolide}`);
  }

  afficherResume(donnees) {
    console.log('=====================================');
    console.log('📊 RÉSUMÉ DU NETTOYAGE');
    console.log('=====================================');
    console.log(`🌤️  Données météo: ${donnees.meteo.length} villes`);
    console.log(`👥 Données démographiques: ${donnees.demographie.length} zones`);
    console.log(`⚡ Données consommation: ${donnees.consommation.length} points`);
    console.log(`📈 Total points nettoyés: ${donnees.meteo.length + donnees.demographie.length + donnees.consommation.length}`);
    console.log('✅ Données prêtes pour le machine learning');
    console.log('=====================================');
  }
}

module.exports = NettoyeurDonnees;

// Si le script est exécuté directement
if (require.main === module) {
  const nettoyeur = new NettoyeurDonnees();
  nettoyeur.nettoyerToutesDonnees()
    .then(() => console.log('Nettoyage terminé'))
    .catch(erreur => console.error('Erreur:', erreur));
}