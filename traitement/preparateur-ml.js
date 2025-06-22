 
const fs = require('fs').promises;
const path = require('path');

class PreparateurML {
  constructor() {
    this.dossierTraitees = path.join(__dirname, '..', 'donnees', 'traitees');
    this.dossierML = path.join(__dirname, '..', 'donnees', 'ml-ready');
  }

  async preparerDonneesML() {
    console.log('🤖 Préparation des données pour le machine learning...');
    console.log('=====================================');

    try {
      // Créer dossier ML
      await fs.mkdir(this.dossierML, { recursive: true });

      // Charger les données nettoyées
      const donneesConsolidees = await this.chargerDonneesConsolidees();
      
      // Créer des séquences temporelles pour LSTM
      const sequencesTemporelles = await this.creerSequencesTemporelles(donneesConsolidees);
      
      // Normaliser les données numériques
      const donneesNormalisees = this.normaliserDonnees(sequencesTemporelles);
      
      // Diviser en train/validation/test
      const datasets = this.diviserDonnees(donneesNormalisees);
      
      // Sauvegarder les datasets ML
      await this.sauvegarderDatasetsML(datasets);
      
      // Créer les métadonnées pour le modèle
      await this.creerMetadonnees(datasets, donneesConsolidees);
      
      this.afficherResume(datasets);
      
      return datasets;

    } catch (erreur) {
      console.error('❌ Erreur préparation ML:', erreur.message);
      throw erreur;
    }
  }

  async chargerDonneesConsolidees() {
    console.log('📂 Chargement des données consolidées...');
    
    const fichiers = await fs.readdir(this.dossierTraitees);
    const fichierConsolide = fichiers.find(f => f.startsWith('donnees_consolidees_'));
    
    if (!fichierConsolide) {
      throw new Error('Fichier consolidé non trouvé. Lancez d\'abord le nettoyage.');
    }
    
    const cheminFichier = path.join(this.dossierTraitees, fichierConsolide);
    const contenu = await fs.readFile(cheminFichier, 'utf8');
    const donnees = JSON.parse(contenu);
    
    console.log(`   ✅ ${donnees.meteo.length + donnees.demographie.length + donnees.consommation.length} points chargés`);
    
    return donnees;
  }

  async creerSequencesTemporelles(donnees) {
    console.log('⏰ Création des séquences temporelles...');
    
    const sequences = [];
    const longueurSequence = 24; // 24 heures pour prédire la suivante
    
    // Grouper la consommation par zone
    const consommationParZone = {};
    donnees.consommation.forEach(point => {
      if (!consommationParZone[point.idZone]) {
        consommationParZone[point.idZone] = [];
      }
      consommationParZone[point.idZone].push(point);
    });
    
    // Créer des séquences pour chaque zone
    for (const [idZone, pointsConsommation] of Object.entries(consommationParZone)) {
      // Trier par date
      pointsConsommation.sort((a, b) => new Date(a.horodatage) - new Date(b.horodatage));
      
      // Obtenir les données contextuelles pour cette zone
      const donneesZone = this.obtenirDonneesZone(parseInt(idZone), donnees);
      
      // Créer des séquences glissantes
      for (let i = 0; i <= pointsConsommation.length - longueurSequence - 1; i++) {
        const sequence = {
          idZone: parseInt(idZone),
          sequenceEntree: [],
          cible: null,
          contexte: donneesZone
        };
        
        // Séquence d'entrée (24 heures)
        for (let j = 0; j < longueurSequence; j++) {
          const point = pointsConsommation[i + j];
          const date = new Date(point.horodatage);
          
          sequence.sequenceEntree.push({
            consommation: point.consommationKwh,
            heure: date.getHours(),
            jourSemaine: date.getDay(),
            mois: date.getMonth() + 1,
            estWeekend: date.getDay() === 0 || date.getDay() === 6,
            estHeurePointe: date.getHours() >= 18 && date.getHours() <= 21
          });
        }
        
        // Valeur cible (heure suivante)
        if (i + longueurSequence < pointsConsommation.length) {
          sequence.cible = pointsConsommation[i + longueurSequence].consommationKwh;
          sequences.push(sequence);
        }
      }
    }
    
    console.log(`   ✅ ${sequences.length} séquences temporelles créées`);
    return sequences;
  }

  obtenirDonneesZone(idZone, donnees) {
    // Données démographiques de la zone
    const demo = donnees.demographie.find(d => d.idZone === idZone) || {};
    
    // Données météo moyennes (simplification)
    const meteoMoyenne = this.calculerMeteoMoyenne(donnees.meteo);
    
    return {
      population: demo.population || 30000,
      densiteHabitants: demo.densiteHabitants || 3000,
      typeZone: demo.typeZone || 'residentiel',
      temperatureMoyenne: meteoMoyenne.temperature,
      humiditeMoyenne: meteoMoyenne.humidite
    };
  }

  calculerMeteoMoyenne(donneesMeteo) {
    if (donneesMeteo.length === 0) {
      return { temperature: 20, humidite: 60 };
    }
    
    const tempMoyenne = donneesMeteo.reduce((acc, d) => acc + d.temperature, 0) / donneesMeteo.length;
    const humMoyenne = donneesMeteo.reduce((acc, d) => acc + d.humidite, 0) / donneesMeteo.length;
    
    return {
      temperature: Math.round(tempMoyenne * 100) / 100,
      humidite: Math.round(humMoyenne)
    };
  }

  normaliserDonnees(sequences) {
    console.log('📊 Normalisation des données...');
    
    // Calculer les statistiques pour la normalisation
    const stats = this.calculerStatistiques(sequences);
    
    // Normaliser chaque séquence
    const sequencesNormalisees = sequences.map(seq => {
      const seqNormalisee = { ...seq };
      
      // Normaliser la séquence d'entrée
      seqNormalisee.sequenceEntree = seq.sequenceEntree.map(point => ({
        consommation: this.normaliser(point.consommation, stats.consommation),
        heure: point.heure / 23, // Normaliser entre 0 et 1
        jourSemaine: point.jourSemaine / 6,
        mois: (point.mois - 1) / 11,
        estWeekend: point.estWeekend ? 1 : 0,
        estHeurePointe: point.estHeurePointe ? 1 : 0
      }));
      
      // Normaliser la cible
      seqNormalisee.cible = this.normaliser(seq.cible, stats.consommation);
      
      // Normaliser le contexte
      seqNormalisee.contexte = {
        population: this.normaliser(seq.contexte.population, stats.population),
        densiteHabitants: this.normaliser(seq.contexte.densiteHabitants, stats.densiteHabitants),
        typeZone: this.encoderTypeZone(seq.contexte.typeZone),
        temperatureMoyenne: this.normaliser(seq.contexte.temperatureMoyenne, stats.temperature),
        humiditeMoyenne: this.normaliser(seq.contexte.humiditeMoyenne, stats.humidite)
      };
      
      return seqNormalisee;
    });
    
    console.log(`   ✅ ${sequencesNormalisees.length} séquences normalisées`);
    
    return {
      sequences: sequencesNormalisees,
      statistiques: stats
    };
  }

  calculerStatistiques(sequences) {
    const consommations = [];
    const populations = [];
    const densites = [];
    const temperatures = [];
    const humidites = [];
    
    sequences.forEach(seq => {
      seq.sequenceEntree.forEach(point => consommations.push(point.consommation));
      consommations.push(seq.cible);
      populations.push(seq.contexte.population);
      densites.push(seq.contexte.densiteHabitants);
      temperatures.push(seq.contexte.temperatureMoyenne);
      humidites.push(seq.contexte.humiditeMoyenne);
    });
    
    return {
      consommation: this.calculerMinMax(consommations),
      population: this.calculerMinMax(populations),
      densiteHabitants: this.calculerMinMax(densites),
      temperature: this.calculerMinMax(temperatures),
      humidite: this.calculerMinMax(humidites)
    };
  }

  calculerMinMax(valeurs) {
    return {
      min: Math.min(...valeurs),
      max: Math.max(...valeurs),
      moyenne: valeurs.reduce((a, b) => a + b, 0) / valeurs.length
    };
  }

  normaliser(valeur, stats) {
    if (stats.max === stats.min) return 0.5;
    return (valeur - stats.min) / (stats.max - stats.min);
  }

  encoderTypeZone(type) {
    const mapping = {
      'residentiel': [1, 0, 0, 0],
      'commercial': [0, 1, 0, 0],
      'mixte': [0, 0, 1, 0],
      'industriel': [0, 0, 0, 1]
    };
    return mapping[type] || mapping['residentiel'];
  }

  diviserDonnees(donneesNormalisees) {
    console.log('✂️  Division des données train/validation/test...');
    
    const sequences = donneesNormalisees.sequences;
    const totalSeq = sequences.length;
    
    // Mélanger les séquences
    const sequencesMelangees = [...sequences].sort(() => Math.random() - 0.5);
    
    // Diviser : 70% train, 15% validation, 15% test
    const indexTrain = Math.floor(totalSeq * 0.7);
    const indexVal = Math.floor(totalSeq * 0.85);
    
    const datasets = {
      train: sequencesMelangees.slice(0, indexTrain),
      validation: sequencesMelangees.slice(indexTrain, indexVal),
      test: sequencesMelangees.slice(indexVal),
      statistiques: donneesNormalisees.statistiques
    };
    
    console.log(`   ✅ Train: ${datasets.train.length}, Validation: ${datasets.validation.length}, Test: ${datasets.test.length}`);
    
    return datasets;
  }

  async sauvegarderDatasetsML(datasets) {
    console.log('💾 Sauvegarde des datasets ML...');
    
    const horodatage = new Date().toISOString().split('T')[0];
    
    // Sauvegarder chaque dataset
    for (const [nom, data] of Object.entries(datasets)) {
      if (nom !== 'statistiques') {
        const nomFichier = `dataset_${nom}_${horodatage}.json`;
        const cheminFichier = path.join(this.dossierML, nomFichier);
        
        await fs.writeFile(cheminFichier, JSON.stringify(data, null, 2));
        console.log(`   📁 ${nomFichier} (${data.length} séquences)`);
      }
    }
    
    // Sauvegarder les statistiques
    const fichierStats = `statistiques_normalisation_${horodatage}.json`;
    const cheminStats = path.join(this.dossierML, fichierStats);
    await fs.writeFile(cheminStats, JSON.stringify(datasets.statistiques, null, 2));
    console.log(`   📊 ${fichierStats}`);
  }

  async creerMetadonnees(datasets, donneesOriginales) {
    const metadonnees = {
      dateCreation: new Date().toISOString(),
      tailleDatasets: {
        train: datasets.train.length,
        validation: datasets.validation.length,
        test: datasets.test.length,
        total: datasets.train.length + datasets.validation.length + datasets.test.length
      },
      donneesOriginales: {
        meteo: donneesOriginales.meteo.length,
        demographie: donneesOriginales.demographie.length,
        consommation: donneesOriginales.consommation.length
      },
      configurationLSTM: {
        longueurSequence: 24,
        nombreFeatures: 6, // consommation + 5 features temporelles
        nombreFeaturesContexte: 7, // population + densité + typeZone(4) + météo(2)
        sortie: 1 // prédiction consommation suivante
      },
      description: "Datasets prêts pour entraînement LSTM de prédiction de consommation énergétique"
    };
    
    const fichierMeta = `metadonnees_${new Date().toISOString().split('T')[0]}.json`;
    const cheminMeta = path.join(this.dossierML, fichierMeta);
    await fs.writeFile(cheminMeta, JSON.stringify(metadonnees, null, 2));
    console.log(`   📋 Métadonnées: ${fichierMeta}`);
  }

  afficherResume(datasets) {
    console.log('=====================================');
    console.log('🤖 RÉSUMÉ PRÉPARATION ML');
    console.log('=====================================');
    console.log(`🎯 Séquences d'entraînement: ${datasets.train.length}`);
    console.log(`✅ Séquences de validation: ${datasets.validation.length}`);
    console.log(`🧪 Séquences de test: ${datasets.test.length}`);
    console.log(`📊 Total séquences LSTM: ${datasets.train.length + datasets.validation.length + datasets.test.length}`);
    console.log('🔧 Données normalisées et prêtes pour TensorFlow');
    console.log('⚡ Prêt pour l\'entraînement du modèle LSTM !');
    console.log('=====================================');
  }
}

module.exports = PreparateurML;

// Si le script est exécuté directement
if (require.main === module) {
  const preparateur = new PreparateurML();
  preparateur.preparerDonneesML()
    .then(() => console.log('Préparation ML terminée'))
    .catch(erreur => console.error('Erreur:', erreur));
}