# Projet_API_DL
# Mon Projet : Comprendre les Vraies Préoccupations des Alternants

## 🎯 Le Problème que je Veux Résoudre

En tant qu'étudiant, je me suis rendu compte qu'on parle beaucoup de l'alternance, mais qu'on écoute peu ce que les alternants ont vraiment à dire. Leurs témoignages sont éparpillés sur internet, et personne ne prend le temps de les analyser sérieusement.

**Mon idée** : créer un système intelligent qui lit et comprend automatiquement les commentaires d'alternants pour identifier leurs principales préoccupations.

## 💡 Ce que je Veux Construire

Imaginez un outil qui peut lire des milliers de témoignages d'alternants et me dire automatiquement : "Cette semaine, 40% des alternants parlent de problèmes de rémunération, 25% se plaignent de leur tuteur, et 15% sont inquiets pour leur avenir professionnel."

C'est exactement ça que je veux créer ! Un classificateur intelligent qui identifie automatiquement le sujet principal de chaque commentaire.

## 🔍 Les 8 Sujets que je Veux Détecter

D'après mes recherches, les alternants parlent principalement de ces thèmes (mais le choix des thématiques n'est pas confirmé :

1. **💰 Salaire et Rémunération** - "Mon salaire est trop bas", "Heureusement que je suis bien payé"
2. **👨‍🏫 Mon Tuteur et l'Encadrement** - "Mon tuteur est génial", "Personne ne m'accompagne"  
3. **📚 Ce que j'Apprends** - "J'apprends plein de choses", "Les formations sont nulles"
4. **🏢 L'Ambiance au Travail** - "Super équipe", "Ambiance toxique"
5. **🚀 Mon Avenir Professionnel** - "Ils vont me garder", "Aucune perspective d'embauche"
6. **⚖️ Équilibre Vie Pro/Perso** - "Trop de travail", "Bon équilibre"
7. **💻 Outils et Technologies** - "Matériel moderne", "Logiciels obsolètes"
8. **🏆 Reconnaissance** - "Je me sens valorisé", "On ne reconnaît pas mon travail"

## 🛠️ Ma Stratégie Technique

### Ce que je vais collecter
- **Où** : Forums étudiants, Reddit, témoignages sur les sites d'emploi
- **Combien** : Au moins 1000 commentaires que je vais étiqueter moi-même
- **Qualité** : Des vrais témoignages de 50-300 mots, pas des phrases courtes

### Mon Intelligence Artificielle
- **Le cerveau** : CamemBERT (la version française de BERT)
- **La tâche** : Lire un commentaire et me dire "ça parle de rémunération" ou "ça parle d'ambiance"
- **L'objectif** : Être juste 3 fois sur 4 (75% de précision)

### Mon Interface
- **Des graphiques sexy** : Visualisations interactives pour voir les tendances
- **Du temps réel** : Taper un commentaire et voir immédiatement le thème détecté
- **De l'analyse** : "Cette semaine, les alternants en informatique se plaignent surtout de..."

## 📅 Mon Planning de Survie (3 semaines)

### **Semaine 1 : Chasse aux Données** (17-23 juin)
*"Ok, il me faut des vrais témoignages d'alternants"*
- Lundi-Mardi : Me connecter aux APIs, scraper intelligemment
- Mercredi-Jeudi : Coder mon API pour tout centraliser  
- Vendredi-Samedi : Créer ma base de données
- Dimanche : Commencer à étiqueter manuellement (le plus chiant mais nécessaire)

### **Semaine 2 : Entraîner mon IA** (24-30 juin) 
*"Maintenant, mon robot doit apprendre à lire"*
- Lundi-Mardi : Finir l'étiquetage, préparer les données proprement
- Mercredi-Jeudi : Fine-tuner CamemBERT sur mes 8 thèmes
- Vendredi-Samedi : Tester, optimiser, re-tester jusqu'à avoir du 75%+
- Dimanche : Valider que ça marche sur de nouveaux exemples

### **Semaine 3 : Rendre ça Beau** (1-6 juillet)
*"Il faut que ça impressionne le jury"*
- Lundi-Mardi : Créer des visualisations qui claquent avec D3.js
- Mercredi-Jeudi : Tout connecter ensemble (front + back + IA)
- Vendredi : Derniers tests, corriger les bugs
- **Samedi : DEADLINE !** Préparer ma présentation

## 🎯 Ce que j'Aurai à la Fin

1. **Un modèle IA fonctionnel** qui classe les commentaires d'alternants
2. **Une démo web** où on peut tester en temps réel
3. **Des insights concrets** : "Les alternants en 2024 se plaignent surtout de..."
4. **Un dataset unique** de 1000+ commentaires français étiquetés
5. **Une présentation qui tue** avec des vraies découvertes

## 😅 Mes Plus Grosses Galères Prévues

**Le cauchemar de l'étiquetage** : Lire et classer 1000 commentaires à la main... Je prévois Netflix en arrière-plan et beaucoup de café.

**Les classes déséquilibrées** : Si tout le monde parle de salaire et personne d'outils, mon IA va être biaisée. Solution : techniques de rééquilibrage et métriques adaptées.

**La course contre la montre** : 3 semaines c'est court ! Je mise tout sur la classification thématique, tant pis pour les fonctionnalités bonus.

**Les APIs capricieuses** : Si Reddit change ses conditions ou si une API plante, j'ai mon plan B avec les sources gouvernementales.

## 🚀 Mon Rêve Secret (si j'ai le temps)

- Analyser l'évolution dans le temps : "En 2024, on parle plus de télétravail qu'en 2020"
- Comparer par secteur : "Les alternants en tech vs ceux en commerce"
- Créer un "Baromètre de l'Alternance" mensuel
- Open-sourcer le tout pour aider d'autres étudiants

## 🔥 Pourquoi ça va Marcher

- **Besoin réel** : Personne n'analyse sérieusement les retours d'alternants
- **Données disponibles** : Plein de témoignages sur internet, il faut juste les organiser
- **Techno mature** : CamemBERT + Hugging Face, c'est du solide
- **Scope réaliste** : Une seule tâche bien faite plutôt que 4 tâches bâclées

---

*"Projet réalisé avec passion (et stress) dans le cadre de ma première année en Data Science"*  
**⏰ Deadline absolue : 6 juillet 2025** *(pas négociable !)*

*P.S. : Si vous lisez ça et que vous êtes alternant, vos témoignages m'intéressent ! 😉*
