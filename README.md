# Smart Energy Predictor ⚡
*Prédiction énergétique urbaine avec APIs et Deep Learning*

## 🎯 À propos

Projet personnel Master 1 MIASHS combinant APIs et deep learning pour prédire la consommation énergétique urbaine en temps réel. Performance : **91% de précision**.

## 🚀 Démarrage rapide

```bash
# Cloner et installer
git clone https://github.com/username/smart-energy-predictor
cd smart-energy-predictor
npm install && pip install -r requirements.txt

# Lancer le système
npm start                    # API Express (port 3000)
python ml_server.py         # Modèle ML (port 5000)
# Dashboard : http://localhost:3000/dashboard
🧠 Architecture Deep Learning
Modèle hybride : CNN multi-échelles + BiLSTM + Attention (8 têtes)
python# Utilisation
model = build_smart_energy_predictor()
prediction = model.predict([sequence_24h, context_zone])
Entrées :

Séquence 24h × 8 features (consommation, heure, météo...)
Contexte 11 features (population, densité, type zone...)

Performance : 91% précision | 89.5% pics | <100ms inférence
🌐 API REST
javascriptGET  /meteo/:ville        # Données météo OpenWeatherMap
GET  /demographie/:id     # Info zones urbaines (JSONPlaceholder)
POST /consommation        # Nouvelles données IoT
GET  /ml-results          # Métriques modèle (91%)
GET  /dashboard           # Interface temps réel
📊 Dashboard

Métriques temps réel : Température, consommation, précision
Graphiques 24h : Prédictions vs réalité (5 zones)
Analyse zones : 9 quartiers avec alertes critiques
Collecte live : Logs automatisés avec horodatage

🔧 Organisation Git
BrancheUtilitémainProduction stable, déploiementdevelopIntégration features, testsfeature/api-backendAPIs Express + collecteurs Node.jsfeature/data-collectionScripts Python collecte/preprocessingfeature/frontend-vizDashboard HTML/CSS/JS interactiffeature/ml-modelModèles TensorFlow + architectures DL
🛠️ Stack Technique
Backend : Node.js, Express, Axios
ML : Python, TensorFlow, NumPy, Pandas
Frontend : HTML5, CSS3, JavaScript, Charts.js
DevOps : Git/GitHub (6 branches), VS Code, Postman
📈 Innovations

✅ Loss composite 5 composants (MSE + pics + tendances + cyclique + stabilité)
✅ CNN multi-échelles (3h/7h/15h patterns)
✅ Attention spécialisée énergie (8 têtes)
✅ Workflow Git professionnel (branches spécialisées)
✅ Architecture modulaire (APIs + ML + Viz)
