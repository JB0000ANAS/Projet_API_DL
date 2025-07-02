# Smart Energy Predictor ⚡  
*Prédiction énergétique urbaine avec APIs et Deep Learning*

## À propos du projet

Ce projet personnel a été développé dans le cadre de mon Master 1 MIASHS.  
L'objectif ? Créer un système capable de prédire la consommation énergétique urbaine en temps réel en combinant APIs et deep learning.

Pourquoi ce projet ? Parce que la gestion énergétique urbaine est un vrai défi, et qu'on peut apporter des solutions concrètes avec l'IA !

## 🎯 Objectifs

- **Prédire** la consommation énergétique urbaine avec du deep learning  
- **Intégrer** des données hétérogènes via des APIs que j'ai développées  
- **Visualiser** les prédictions en temps réel dans un dashboard interactif  
- **Appliquer** l'approche MIASHS : maths + informatique + sciences humaines

## 🌐 APIs et sources de données

### APIs externes utilisées

- **OpenWeatherMap** : Données météo (température, humidité) - 1000 appels/jour gratuit  
- **JSONPlaceholder** : Données démographiques simulées pour 10 zones urbaines  
- **Institut National** : Données de population et densité (quand disponibles)

### Mon API REST (Node.js/Express)

```javascript
GET  /meteo/:ville        → Récupère données météo  
GET  /demographie/:id     → Infos démographiques par zone  
POST /consommation        → Envoi nouvelles données  
GET  /ml-results          → Métriques du modèle (91% précision)  
GET  /dashboard           → Interface de visualisation

| Branche                   | Utilité                               |
| ------------------------- | ------------------------------------- |
| `main`                    | Production stable, déploiement        |
| `develop`                 | Intégration features, tests           |
| `feature/api-backend`     | APIs Express + collecteurs Node.js    |
| `feature/data-collection` | Scripts Python collecte/preprocessing |
| `feature/frontend-viz`    | Dashboard HTML/CSS/JS interactif      |
| `feature/ml-model`        | Modèles TensorFlow + architectures DL |
