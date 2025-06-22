 const fs = require('fs').promises;
const path = require('path');

class AnalyseurQualite {
  constructor() {
    this.dossierBrutes = path.join(__dirname, '..', 'donnees', 'brutes');
    this.dossierRapports = path.join(__dirname, '..', 'donnees', 'rapports');
  }

  async analyserToutesDonnees() {
    console.log('🔍 Analyse qualité des données collectées...');
    console.log('=====================================');

    try {
      // Créer le dossier rapports s'il n'existe pas
      await fs.mkdir(this.dossierRapports, { recursive: true });

      const fichiers = await fs.readdir(this.dossierBrutes);
      const rapportGlobal = {
        dateAnalyse: new Date().toISOString(),
        totalFichiers: fichiers.length,
        fichiersMeteo: [],
        fichiersDemographie: [],
        fichiersConsommation: [],
        problemes: [],
        statistiques: {}
      };

      for (const fichier of fichiers) {
        if (fichier.endsWith('.json')) {
          console.log(`📂 Analyse ${fichier}...`);
          
          const cheminFichier = path.join(this.dossierBrutes, fichier);
          const contenu = await fs.readFile(cheminFichier, 'utf8');
          const donnees = JSON.parse(contenu);
          
          const rapportFichier = await this.analyserFichier(fichier, donnees);
          
          // Classer par type
          if (fichier.includes('meteo')) {
            rapportGlobal.fichiersMeteo.push(rapportFichier);
          } else if (fichier.includes('demographie')) {
            rapportGlobal.fichiersDemographie.push(rapportFichier);
          } else if (fichier.includes('consommation')) {
            rapportGlobal.fichiersConsommation.push(rapportFichier);
          }
        }
      }

      // Générer statistiques globales
      rapportGlobal.statistiques = this.genererStatistiquesGlobales(rapportGlobal);
      
      // Sauvegarder le rapport
      await this.sauvegarderRapport(rapportGlobal);
      
      // Afficher résumé
      this.afficherResume(rapportGlobal);
      
      return rapportGlobal;
      
    } catch (erreur) {
      console.error('❌ Erreur analyse qualité:', erreur.message);
      throw erreur;
    }
  }

  async analyserFichier(nomFichier, donnees) {
    const rapport = {
      nomFichier,
      taille: Array.isArray(donnees) ? donnees.length : 1,
      type: this.determinerType(nomFichier),
      valeursManquantes: 0,
      doublons: 0,
      valeursAberrantes: 0,
      plageTemporelle: null,
      champs: {},
      qualiteGlobale: 'Bonne'
    };

    if (Array.isArray(donnees) && donnees.length > 0) {
      // Analyser les champs
      const premierElement = donnees[0];
      Object.keys(premierElement).forEach(champ => {
        rapport.champs[champ] = this.analyserChamp(donnees, champ);
      });

      // Analyser la plage temporelle
      if (donnees[0].horodatage) {
        const dates = donnees.map(d => new Date(d.horodatage)).sort();
        rapport.plageTemporelle = {
          debut: dates[0].toISOString(),
          fin: dates[dates.length - 1].toISOString(),
          duree: (dates[dates.length - 1] - dates[0]) / (1000 * 60 * 60) // heures
        };
      }

      // Détecter les problèmes spécifiques par type
      rapport.valeursManquantes = this.compterValeursManquantes(donnees);
      rapport.doublons = this.detecterDoublons(donnees);
      rapport.valeursAberrantes = this.detecterValeursAberrantes(donnees, rapport.type);
    }

    // Évaluer la qualité globale
    rapport.qualiteGlobale = this.evaluerQualiteGlobale(rapport);

    return rapport;
  }

  analyserChamp(donnees, nomChamp) {
    const valeurs = donnees.map(d => d[nomChamp]).filter(v => v !== null && v !== undefined);
    
    if (valeurs.length === 0) return { type: 'vide', statistiques: null };

    const premierType = typeof valeurs[0];
    
    if (premierType === 'number') {
      return {
        type: 'numerique',
        statistiques: {
          min: Math.min(...valeurs),
          max: Math.max(...valeurs),
          moyenne: valeurs.reduce((a, b) => a + b, 0) / valeurs.length,
          nombreValeurs: valeurs.length
        }
      };
    } else if (premierType === 'string') {
      return {
        type: 'texte',
        statistiques: {
          valeursUniques: new Set(valeurs).size,
          longueurMoyenne: valeurs.reduce((a, b) => a + b.length, 0) / valeurs.length,
          nombreValeurs: valeurs.length
        }
      };
    }

    return { type: premierType, statistiques: { nombreValeurs: valeurs.length } };
  }

  compterValeursManquantes(donnees) {
    let manquantes = 0;
    donnees.forEach(element => {
      Object.values(element).forEach(valeur => {
        if (valeur === null || valeur === undefined || valeur === '') {
          manquantes++;
        }
      });
    });
    return manquantes;
  }

  detecterDoublons(donnees) {
    const signatures = new Set();
    let doublons = 0;
    
    donnees.forEach(element => {
      const signature = JSON.stringify(element);
      if (signatures.has(signature)) {
        doublons++;
      } else {
        signatures.add(signature);
      }
    });
    
    return doublons;
  }

  detecterValeursAberrantes(donnees, type) {
    let aberrantes = 0;
    
    if (type === 'meteo') {
      donnees.forEach(d => {
        if (d.temperature < -50 || d.temperature > 60) aberrantes++;
        if (d.humidite < 0 || d.humidite > 100) aberrantes++;
      });
    } else if (type === 'consommation') {
      donnees.forEach(d => {
        if (d.consommationKwh < 0 || d.consommationKwh > 10000) aberrantes++;
      });
    } else if (type === 'demographie') {
      donnees.forEach(d => {
        if (d.population < 0 || d.population > 10000000) aberrantes++;
      });
    }
    
    return aberrantes;
  }

  determinerType(nomFichier) {
    if (nomFichier.includes('meteo')) return 'meteo';
    if (nomFichier.includes('demographie')) return 'demographie';
    if (nomFichier.includes('consommation')) return 'consommation';
    return 'inconnu';
  }

  evaluerQualiteGlobale(rapport) {
    let score = 100;
    
    if (rapport.valeursManquantes > 0) score -= 10;
    if (rapport.doublons > 0) score -= 15;
    if (rapport.valeursAberrantes > 0) score -= 20;
    if (rapport.taille < 10) score -= 25;
    
    if (score >= 90) return 'Excellente';
    if (score >= 70) return 'Bonne';
    if (score >= 50) return 'Moyenne';
    return 'Problématique';
  }

  genererStatistiquesGlobales(rapport) {
    return {
      totalPoints: rapport.fichiersMeteo.reduce((acc, f) => acc + f.taille, 0) +
                  rapport.fichiersDemographie.reduce((acc, f) => acc + f.taille, 0) +
                  rapport.fichiersConsommation.reduce((acc, f) => acc + f.taille, 0),
      qualiteMoyenne: this.calculerQualiteMoyenne(rapport),
      problemesMajeurs: this.identifierProblemesMajeurs(rapport)
    };
  }

  calculerQualiteMoyenne(rapport) {
    const tousRapports = [...rapport.fichiersMeteo, ...rapport.fichiersDemographie, ...rapport.fichiersConsommation];
    const scores = tousRapports.map(r => {
      switch(r.qualiteGlobale) {
        case 'Excellente': return 95;
        case 'Bonne': return 80;
        case 'Moyenne': return 60;
        default: return 30;
      }
    });
    
    return scores.reduce((a, b) => a + b, 0) / scores.length;
  }

  identifierProblemesMajeurs(rapport) {
    const problemes = [];
    const tousRapports = [...rapport.fichiersMeteo, ...rapport.fichiersDemographie, ...rapport.fichiersConsommation];
    
    tousRapports.forEach(r => {
      if (r.valeursAberrantes > 0) problemes.push(`${r.nomFichier}: ${r.valeursAberrantes} valeurs aberrantes`);
      if (r.doublons > 0) problemes.push(`${r.nomFichier}: ${r.doublons} doublons détectés`);
      if (r.taille === 0) problemes.push(`${r.nomFichier}: fichier vide`);
    });
    
    return problemes;
  }

  async sauvegarderRapport(rapport) {
    const nomFichier = `rapport_qualite_${new Date().toISOString().split('T')[0]}_${Date.now()}.json`;
    const cheminFichier = path.join(this.dossierRapports, nomFichier);
    
    await fs.writeFile(cheminFichier, JSON.stringify(rapport, null, 2));
    console.log(`📋 Rapport sauvegardé: ${nomFichier}`);
  }

  afficherResume(rapport) {
    console.log('=====================================');
    console.log('📊 RÉSUMÉ DE L\'ANALYSE QUALITÉ');
    console.log('=====================================');
    console.log(`📁 Fichiers analysés: ${rapport.totalFichiers}`);
    console.log(`📈 Points de données: ${rapport.statistiques.totalPoints}`);
    console.log(`⭐ Qualité moyenne: ${rapport.statistiques.qualiteMoyenne.toFixed(1)}/100`);
    
    if (rapport.statistiques.problemesMajeurs.length > 0) {
      console.log('⚠️  Problèmes détectés:');
      rapport.statistiques.problemesMajeurs.forEach(probleme => {
        console.log(`   - ${probleme}`);
      });
    } else {
      console.log('✅ Aucun problème majeur détecté');
    }
    
    console.log('=====================================');
  }
}

module.exports = AnalyseurQualite;

// Si le script est exécuté directement
if (require.main === module) {
  const analyseur = new AnalyseurQualite();
  analyseur.analyserToutesDonnees()
    .then(() => console.log('Analyse terminée'))
    .catch(erreur => console.error('Erreur:', erreur));
}