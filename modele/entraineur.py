 
import numpy as np
import json
import os
from datetime import datetime

def charger_donnees_ml():
    """Charge les datasets ML préparés"""
    print("📂 Chargement des datasets ML...")
    
    dossier_ml = os.path.join('donnees', 'ml-ready')
    if not os.path.exists(dossier_ml):
        print("❌ Dossier ml-ready non trouvé")
        return None
    
    fichiers = os.listdir(dossier_ml)
    datasets = {}
    
    for fichier in fichiers:
        if fichier.startswith('dataset_'):
            type_dataset = fichier.split('_')[1]
            chemin = os.path.join(dossier_ml, fichier)
            
            with open(chemin, 'r') as f:
                datasets[type_dataset] = json.load(f)
                
            print(f"   ✅ {type_dataset}: {len(datasets[type_dataset])} séquences")
    
    return datasets

def analyser_donnees(datasets):
    """Analyse les datasets"""
    print("\n🔍 Analyse des datasets:")
    print("=" * 40)
    
    for nom, data in datasets.items():
        if isinstance(data, list) and len(data) > 0:
            print(f"\n📊 Dataset {nom.upper()}:")
            print(f"   📈 Séquences: {len(data)}")
            
            exemple = data[0]
            if 'sequenceEntree' in exemple:
                print(f"   ⏰ Longueur: {len(exemple['sequenceEntree'])} heures")
                print(f"   🎯 Cible: {exemple['cible']:.4f}")
            
            cibles = [seq['cible'] for seq in data if 'cible' in seq]
            if cibles:
                print(f"   📊 Min: {min(cibles):.4f}, Max: {max(cibles):.4f}")

def main():
    print("🚀 DÉMONSTRATION PIPELINE ML")
    print("=" * 40)
    
    datasets = charger_donnees_ml()
    if datasets:
        analyser_donnees(datasets)
        print("\n✅ Pipeline ML validé !")
    else:
        print("❌ Échec chargement des données")

if __name__ == "__main__":
    main()