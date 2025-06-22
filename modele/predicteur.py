import numpy as np
import json
import os

def charger_donnees_test():
    """Charge les données de test"""
    dossier_ml = os.path.join('donnees', 'ml-ready')
    chemin_test = os.path.join(dossier_ml, 'dataset_test_2025-06-22.json')
    
    with open(chemin_test, 'r') as f:
        return json.load(f)

def prediction_simple(sequence):
    """Prédiction basique basée sur les tendances"""
    derniers_points = sequence['sequenceEntree'][-6:]  # 6 dernières heures
    consommations = [p['consommation'] for p in derniers_points]
    
    # Moyenne pondérée (plus de poids aux heures récentes)
    poids = [0.1, 0.15, 0.2, 0.25, 0.3, 0.4]
    prediction = sum(c * p for c, p in zip(consommations, poids))
    
    # Ajustement selon l'heure et contexte
    derniere_heure = derniers_points[-1]['heure']
    if derniere_heure > 0.7:  # Heure de pointe (normalisé)
        prediction *= 1.2
    
    return prediction

def evaluer_predictions():
    """Évalue les prédictions sur les données de test"""
    print("🎯 Évaluation des prédictions...")
    print("=" * 40)
    
    donnees_test = charger_donnees_test()
    
    predictions = []
    vraies_valeurs = []
    erreurs = []
    
    for i, sequence in enumerate(donnees_test[:10]):  # 10 premiers tests
        vraie_valeur = sequence['cible']
        prediction = prediction_simple(sequence)
        erreur = abs(vraie_valeur - prediction)
        
        predictions.append(prediction)
        vraies_valeurs.append(vraie_valeur)
        erreurs.append(erreur)
        
        print(f"Test {i+1:2d}: Vraie={vraie_valeur:.4f} | Prédite={prediction:.4f} | Erreur={erreur:.4f}")
    
    # Métriques
    mae = np.mean(erreurs)
    mse = np.mean([e**2 for e in erreurs])
    rmse = np.sqrt(mse)
    
    print("\n📊 Métriques de performance:")
    print(f"   📈 MAE:  {mae:.4f}")
    print(f"   📐 MSE:  {mse:.4f}")
    print(f"   🎯 RMSE: {rmse:.4f}")
    
    # Précision en pourcentage
    precision_moyenne = (1 - mae) * 100
    print(f"   ✅ Précision moyenne: {precision_moyenne:.1f}%")
    
    return predictions, vraies_valeurs

if __name__ == "__main__":
    evaluer_predictions()