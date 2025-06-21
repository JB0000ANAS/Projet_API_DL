 
const express = require('express');
const router = express.Router();

// Stockage temporaire en mémoire (en production, utiliser une base de données)
let donneesConsommation = [];
let commentairesUtilisateurs = [];

// POST /consommation - Envoie nouvelles données de consommation
router.post('/', (req, res) => {
  try {
    const { 
      idZone, 
      consommationKwh, 
      horodatage, 
      typeEnergie = 'electrique' 
    } = req.body;

    // Validation des données
    if (!idZone || !consommationKwh || !horodatage) {
      return res.status(400).json({ 
        erreur: 'idZone, consommationKwh et horodatage sont requis' 
      });
    }

    const nouvelleDonnee = {
      id: Date.now(),
      idZone,
      consommationKwh: parseFloat(consommationKwh),
      typeEnergie,
      horodatage: new Date(horodatage).toISOString(),
      recu: new Date().toISOString()
    };

    donneesConsommation.push(nouvelleDonnee);

    res.status(201).json({
      message: 'Données de consommation enregistrées',
      donnee: nouvelleDonnee
    });
  } catch (erreur) {
    console.error('Erreur enregistrement consommation:', erreur.message);
    res.status(500).json({ 
      erreur: 'Impossible d\'enregistrer les données' 
    });
  }
});

// POST /consommation/commentaires - Retours utilisateur
router.post('/commentaires', (req, res) => {
  try {
    const { idUtilisateur, commentaire, note } = req.body;

    if (!idUtilisateur || !commentaire) {
      return res.status(400).json({ 
        erreur: 'idUtilisateur et commentaire sont requis' 
      });
    }

    const nouveauCommentaire = {
      id: Date.now(),
      idUtilisateur,
      commentaire,
      note: note || null,
      timestamp: new Date().toISOString()
    };

    commentairesUtilisateurs.push(nouveauCommentaire);

    res.status(201).json({
      message: 'Commentaire enregistré',
      commentaire: nouveauCommentaire
    });
  } catch (erreur) {
    console.error('Erreur enregistrement commentaire:', erreur.message);
    res.status(500).json({ 
      erreur: 'Impossible d\'enregistrer le commentaire' 
    });
  }
});

module.exports = router;