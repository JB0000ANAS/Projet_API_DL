# Projet_API_DL ***Smart Energy Predictor***

##  Objectifs
- Prédire la consommation énergétique urbaine avec du deep learning
- Créer une API pour collecter et distribuer les données
- Visualiser les prédictions en temps réel

##  APIs gratuites utilisées
- **OpenWeatherMap** : Données météo (1000 calls/jour gratuit)
- **JSONPlaceholder** : Données démographiques simulées
- **Alpha Vantage** : Prix énergétiques (500 calls/jour gratuit)
- **Nominatim** : Géolocalisation (illimité)



### **API (Node.js)**
```
GET /weather/:city     → Récupère météo
GET /demographics/:id  → Données population
POST /consumption      → Envoie nouvelles données
POST /feedback        → Retours utilisateur
```

### **Deep Learning (Python)**
- **Modèle** : LSTM hybride pour séries temporelles
- **Input** : Météo + démographie + consommation passée
- **Output** : Prédiction consommation 24h
- **Loss** : MSE + pénalité pics de consommation

### **Visualisation (JavaScript)**
- Dashboard temps réel
- Graphiques prédictions vs réalité
- Cartes de consommation par quartier
- Alertes d'optimisation

##  Architecture GitHub
```
- main : Branche stable de production
- develop : Intégration et tests
- feature/api-backend : Développement API REST
- feature/data-collection : Intégration APIs externes
- feature/frontend-viz : Dashboard et visualisations
- feature/ml-model : Modèles deep learning
```
##  Livrable
Système complet fonctionnel d'ici le 06/07/2025
