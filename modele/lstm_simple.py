import numpy as np
import json
import os
from datetime import datetime

class ModeleEnergieLSTMSimple:
    """
    Version simplifiée du modèle pour développement sans TensorFlow
    """
    def __init__(self):
        self.statistiques = None
        self.poids_entraines = False
        
    def charger_donnees_ml(self, dossier_ml):
        """
        Charge les datasets ML préparés
        """
        print("📂 Chargement des datasets ML...")
        
        # Trouver les fichiers de datasets
        fichiers = os.listdir(dossier_ml)
        
        datasets = {}
        for fichier in fichiers:
            if fichier.startswith('dataset_'):
                type_dataset = fichier.split('_')[1]
                chemin = os.path.join(dossier_ml, fichier)
                
                with open(chemin, 'r') as f:
                    datasets[type_dataset] = json.load(f)
                    
                print(f"   ✅ {type_dataset}: {len(datasets[type_dataset])} séquences")
        
        # Charger les statistiques
        for fichier in fichiers:
            if fichier.startswith('statistiques_'):
                chemin = os.path.join(dossier_ml, fichier)
                with open(chemin, 'r') as f:
                    self.statistiques = json.load(f)
                print(f"   📊 Statistiques de normalisation chargées")
                break
        
        return datasets
    
    def analyser_donnees(self, datasets):
        """
        Analyse les datasets chargés
        """
        print("\n🔍 Analyse des datasets ML:")
        print("=" * 40)
        
        for nom, data in datasets.items():
            if isinstance(data, list) and len(data) > 0:
                print(f"\n📊 Dataset {nom.upper()}:")
                print(f"   📈 Nombre de séquences: {len(data)}")
                
                # Analyser une séquence exemple
                exemple = data[0]
                if 'sequenceEntree' in exemple:
                    print(f"   ⏰ Longueur séquence: {len(exemple['sequenceEntree'])} heures")
                    print(f"   🎯 Cible: {exemple['cible']:.4f}")
                    print(f"   🏘️ Zone: {exemple['idZone']}")
                    print(f"   👥 Population: {exemple['contexte']['population']:.4f}")
                
                # Statistiques sur les cibles
                cibles = [seq['cible'] for seq in data if 'cible' in seq]
                if cibles:
                    print(f"   📊 Cibles - Min: {min(cibles):.4f}, Max: {max(cibles):.4f}, Moyenne: {np.mean(cibles):.4f}")
        
        print("\n✅ Analyse terminée")
        return True
    
    def simulation_entrainement(self, datasets):
        """
        Simule un entraînement simple (démonstration)
        """
        print("\n🤖 Simulation d'entraînement du modèle...")
        print("=" * 40)
        
        if 'train' not in datasets:
            print("❌ Dataset d'entraînement manquant")
            return False
        
        donnees_train = datasets['train']
        donnees_val = datasets.get('validation', [])
        
        print(f"🎯 Entraînement sur {len(donnees_train)} séquences")
        print(f"✅ Validation sur {len(donnees_val)} séquences")
        
        # Simulation d'epochs d'entraînement
        for epoch in range(1, 6):  # 5 epochs simulés
            # Calcul de métriques simulées
            train_loss = 0.1 / epoch + np.random.normal(0, 0.01)
            val_loss = 0.12 / epoch + np.random.normal(0, 0.015)
            
            print(f"Epoch {epoch}/5 - train_loss: {train_loss:.4f} - val_loss: {val_loss:.4f}")
        
        self.poids_entraines = True
        print("\n✅ Simulation d'entraînement terminée!")
        return True
    
    def prediction_simple(self, datasets):
        """
        Fait des prédictions simples sur les données de test
        """
        if not self.poids_entraines:
            print("❌ Le modèle doit être 'entraîné' avant de faire des prédictions")
            return
        
        print("\n🎯 Prédictions sur les données de test...")
        print("=" * 40)
        
        donnees_test = datasets.get('test', [])
        if not donnees_test:
            print("❌ Aucune donnée de test disponible")
            return
        
        predictions = []
        vraies_valeurs = []
        
        # Prédictions simples (moyenne pondérée basée sur les dernières valeurs)
        for i, sequence in enumerate(donnees_test[:5]):  # 5 premiers exemples
            # Vraie valeur
            vraie_valeur = sequence['cible']
            vraies_valeurs.append(vraie_valeur)
            
            # Prédiction simple : moyenne des 3 dernières heures + facteur contextuel
            derniers_points = sequence['sequenceEntree'][-3:]
            moyenne_recente = np.mean([point['consommation'] for point in derniers_points])
            
            # Facteur basé sur l'heure et le contexte
            derniere_heure = derniers_points[-1]['heure']
            facteur_heure = 1.2 if derniere_heure * 23 >= 18 and derniere_heure * 23 <= 21 else 0.9
            
            prediction = moyenne_recente * facteur_heure + np.random.normal(0, 0.02)
            predictions.append(prediction)
            
            print(f"   Test {i+1}: Vraie={vraie_valeur:.4f}, Prédite={prediction:.4f}, "
                  f"Erreur={abs(vraie_valeur - prediction):.4f}")
        
        # Calcul des métriques
        mae = np.mean([abs(v - p) for v, p in zip(vraies_valeurs, predictions)])
        mse = np.mean([(v - p)**2 for v, p in zip(vraies_valeurs, predictions)])
        
        print(f"\n📊 Métriques de performance:")
        print(f"   📈 MAE (Mean Absolute Error): {mae:.4f}")
        print(f"   📐 MSE (Mean Squared Error): {mse:.4f}")
        print(f"   🎯 RMSE: {np.sqrt(mse):.4f}")
        
        return predictions, vraies_valeurs
    
    def demarrer_demonstration(self, dossier_ml):
        """
        Lance une démonstration complète du pipeline ML
        """
        print("🚀 DÉMONSTRATION DU PIPELINE MACHINE LEARNING")
        print("=" * 50)
        
        try:
            # 1. Charger les données
            datasets = self.charger_donnees_ml(dossier_ml)
            
            # 2. Analyser les données
            self.analyser_donnees(datasets)
            
            # 3. Simuler l'entraînement
            self.simulation_entrainement(datasets)
            
            # 4. Faire des prédictions
            self.prediction_simple(datasets)
            
            print(f"\n🎉 Démonstration terminée avec succès!")
            print("💡 Pour un vrai modèle LSTM, TensorFlow sera nécessaire")
            
        except Exception as e:
            print(f"❌ Erreur: {e}")

if __name__ == "__main__":
    # Lancer la démonstration
    modele = ModeleEnergieLSTMSimple()
    dossier_ml = os.path.join('donnees', 'ml-ready')
    modele.demarrer_demonstration(dossier_ml)