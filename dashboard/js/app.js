 
/**
 * Application principale Smart Energy Predictor Dashboard
 */
class SmartEnergyDashboard {
    constructor() {
        this.api = window.smartEnergyAPI;
        this.donnees = null;
        this.predictions = null;
        this.graphiquePredictions = null;
        this.intervalleActualisation = null;
        this.zonesActives = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
        
        this.init();
    }

    /**
     * Initialisation de l'application
     */
    async init() {
        console.log('🚀 Initialisation Smart Energy Dashboard...');
        
        try {
            await this.chargerDonneesInitiales();
            this.configurerGraphiques();
            this.demarrerActualisationAutomatique();
            
            // Animation d'entrée
            document.querySelectorAll('section').forEach((section, index) => {
                setTimeout(() => {
                    section.classList.add('fade-in-up');
                }, index * 200);
            });
            
            console.log('✅ Dashboard initialisé avec succès');
            this.ajouterLog('✅ Dashboard initialisé avec succès', 'success');
        } catch (error) {
            console.error('❌ Erreur initialisation:', error);
            this.ajouterLog(`❌ Erreur initialisation: ${error.message}`, 'error');
        }
    }

    /**
     * Charge les données initiales
     */
    async chargerDonneesInitiales() {
        this.ajouterLog('📊 Chargement des données initiales...', 'info');
        
        try {
            // Charger les données de base
            this.donnees = await this.api.collecterToutesDonnees(this.zonesActives);
            
            // Générer les prédictions
            this.predictions = await this.api.genererPredictions(this.zonesActives);
            
            // Mettre à jour l'interface
            this.mettreAJourMetriques();
            this.mettreAJourZones();
            this.mettreAJourAlertes();
            
            this.ajouterLog(`✅ ${this.donnees.meteo.length + this.donnees.demographie.length + this.donnees.consommation.length} points de données chargés`, 'success');
        } catch (error) {
            this.ajouterLog(`❌ Erreur chargement: ${error.message}`, 'error');
            throw error;
        }
    }

    /**
     * Met à jour les métriques en temps réel
     */
    mettreAJourMetriques() {
        if (!this.donnees) return;
        
        const metriques = this.api.calculerMetriques(this.donnees);
        
        // Mise à jour avec animations
        this.animerValeurMetrique('temp-moyenne', `${metriques.temperatureMoyenne}°C`);
        this.animerValeurMetrique('conso-actuelle', `${metriques.consommationMoyenne} kWh`);
        this.animerValeurMetrique('precision-modele', `${metriques.precisionModele}%`);
        this.animerValeurMetrique('zones-total', `${metriques.zonesActives}`);
    }

    /**
     * Anime la mise à jour d'une métrique
     */
    animerValeurMetrique(elementId, nouvelleValeur) {
        const element = document.getElementById(elementId);
        if (!element) return;
        
        element.classList.add('pulse');
        setTimeout(() => {
            element.textContent = nouvelleValeur;
            element.classList.remove('pulse');
        }, 300);
    }

    /**
     * Configure les graphiques Chart.js
     */
    configurerGraphiques() {
        const ctx = document.getElementById('predictionChart').getContext('2d');
        
        this.graphiquePredictions = new Chart(ctx, {
            type: 'line',
            data: {
                labels: Array.from({length: 24}, (_, i) => `${i}h`),
                datasets: []
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: 'Prédictions de Consommation (24h)',
                        color: '#f8fafc',
                        font: { size: 16, weight: 'bold' }
                    },
                    legend: {
                        labels: { color: '#cbd5e1' }
                    }
                },
                scales: {
                    x: {
                        ticks: { color: '#cbd5e1' },
                        grid: { color: '#475569' }
                    },
                    y: {
                        ticks: { color: '#cbd5e1' },
                        grid: { color: '#475569' },
                        title: {
                            display: true,
                            text: 'Consommation (kWh)',
                            color: '#cbd5e1'
                        }
                    }
                },
                interaction: {
                    intersect: false,
                    mode: 'index'
                }
            }
        });
        
        this.mettreAJourGraphique();
    }

    /**
     * Met à jour le graphique des prédictions
     */
    mettreAJourGraphique() {
        if (!this.graphiquePredictions || !this.predictions) return;
        
        const datasets = [];
        const couleurs = [
            '#2563eb', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6',
            '#06b6d4', '#84cc16', '#f97316', '#ec4899', '#6366f1'
        ];
        
        // Prendre 5 zones pour la lisibilité
        this.predictions.slice(0, 5).forEach((prediction, index) => {
            const couleur = couleurs[index % couleurs.length];
            
            datasets.push({
                label: `Zone ${prediction.idZone}`,
                data: prediction.predictions24h.map(p => p.consommationPredite),
                borderColor: couleur,
                backgroundColor: couleur + '20',
                fill: false,
                tension: 0.4,
                pointRadius: 3,
                pointHoverRadius: 6
            });
        });
        
        this.graphiquePredictions.data.datasets = datasets;
        this.graphiquePredictions.update('active');
    }

    /**
     * Met à jour l'affichage des zones
     */
    mettreAJourZones() {
        const container = document.getElementById('zones-container');
        if (!container || !this.donnees || !this.predictions) return;
        
        container.innerHTML = '';
        
        this.zonesActives.forEach(idZone => {
            const demo = this.donnees.demographie.find(d => d.idZone === idZone);
            const conso = this.donnees.consommation.find(c => c.idZone === idZone);
            const pred = this.predictions.find(p => p.idZone === idZone);
            
            if (demo && conso && pred) {
                const zoneCard = this.creerCarteZone(demo, conso, pred);
                container.appendChild(zoneCard);
            }
        });
    }

    /**
     * Crée une carte de zone
     */
    creerCarteZone(demo, conso, pred) {
        const div = document.createElement('div');
        div.className = 'zone-card fade-in-up';
        
        // Déterminer le statut basé sur la consommation
        let statusClass = 'status-normal';
        let statusText = 'Normal';
        if (conso.consommationKwh > 1800) {
            statusClass = 'status-critical';
            statusText = 'Critique';
        } else if (conso.consommationKwh > 1400) {
            statusClass = 'status-high';
            statusText = 'Élevé';
        }
        
        // Prédiction pour la prochaine heure
        const prochaineHeure = pred.predictions24h[0];
        const tendance = prochaineHeure.consommationPredite > conso.consommationKwh ? '📈' : '📉';
        
        div.innerHTML = `
            <div class="zone-header">
                <div class="zone-name">🏘️ ${demo.nomZone}</div>
                <div class="zone-status ${statusClass}">${statusText}</div>
            </div>
            <div class="zone-metrics">
                <div class="zone-metric">
                    <div class="zone-metric-label">Consommation Actuelle</div>
                    <div class="zone-metric-value">${conso.consommationKwh} kWh</div>
                </div>
                <div class="zone-metric">
                    <div class="zone-metric-label">Prédiction +1h ${tendance}</div>
                    <div class="zone-metric-value">${prochaineHeure.consommationPredite} kWh</div>
                </div>
                <div class="zone-metric">
                    <div class="zone-metric-label">Population</div>
                    <div class="zone-metric-value">${demo.population.toLocaleString()}</div>
                </div>
                <div class="zone-metric">
                    <div class="zone-metric-label">Type de Zone</div>
                    <div class="zone-metric-value">${demo.typeZone}</div>
                </div>
            </div>
        `;
        
        return div;
    }

    /**
     * Met à jour les alertes
     */
    mettreAJourAlertes() {
        const container = document.getElementById('alerts-container');
        if (!container || !this.donnees) return;
        
        const alertes = this.api.genererAlertes(this.donnees);
        container.innerHTML = '';
        
        if (alertes.length === 0) {
            container.innerHTML = `
                <div class="alert alert-success">
                    <div class="alert-icon">✅</div>
                    <div>
                        <strong>Système Optimal</strong><br>
                        Aucune alerte active - Toutes les zones fonctionnent normalement
                    </div>
                </div>
            `;
        } else {
            alertes.forEach(alerte => {
                const alerteDiv = document.createElement('div');
                alerteDiv.className = `alert alert-${alerte.type} fade-in-up`;
                alerteDiv.innerHTML = `
                    <div class="alert-icon">${alerte.icone}</div>
                    <div>
                        <strong>${alerte.titre}</strong><br>
                        ${alerte.message}
                    </div>
                `;
                container.appendChild(alerteDiv);
            });
        }
    }

    /**
     * Démarre l'actualisation automatique
     */
    demarrerActualisationAutomatique() {
        // Actualisation toutes les 2 minutes
        this.intervalleActualisation = setInterval(() => {
            this.actualiserDonnees();
        }, 2 * 60 * 1000);
        
        console.log('🔄 Actualisation automatique démarrée (2 min)');
    }

    /**
     * Actualise les données
     */
    async actualiserDonnees() {
        try {
            this.ajouterLog('🔄 Actualisation des données...', 'info');
            
            // Actualiser seulement la consommation pour plus de fluidité
            for (const zone of this.zonesActives) {
                const nouvelleConso = this.api.simulerConsommation(zone);
                const index = this.donnees.consommation.findIndex(c => c.idZone === zone);
                if (index !== -1) {
                    this.donnees.consommation[index] = nouvelleConso;
                }
            }
            
            // Régénérer les prédictions
            this.predictions = await this.api.genererPredictions(this.zonesActives);
            
            // Mettre à jour l'interface
            this.mettreAJourMetriques();
            this.mettreAJourZones();
            this.mettreAJourGraphique();
            this.mettreAJourAlertes();
            
            this.ajouterLog('✅ Données actualisées', 'success');
        } catch (error) {
            this.ajouterLog(`❌ Erreur actualisation: ${error.message}`, 'error');
        }
    }

    /**
     * Ajoute une ligne au log
     */
    ajouterLog(message, type = 'info') {
        const logContainer = document.getElementById('data-log');
        if (!logContainer) return;
        
        const timestamp = new Date().toLocaleTimeString();
        const p = document.createElement('p');
        p.className = `log-${type}`;
        p.textContent = `[${timestamp}] ${message}`;
        
        logContainer.appendChild(p);
        logContainer.scrollTop = logContainer.scrollHeight;
        
        // Garder seulement les 50 dernières lignes
        while (logContainer.children.length > 50) {
            logContainer.removeChild(logContainer.firstChild);
        }
    }

    /**
     * Nettoie les ressources
     */
    destroy() {
        if (this.intervalleActualisation) {
            clearInterval(this.intervalleActualisation);
        }
        if (this.graphiquePredictions) {
            this.graphiquePredictions.destroy();
        }
    }
}

/**
 * Fonctions globales pour les boutons
 */
async function collecterDonnees() {
    const app = window.dashboardApp;
    if (!app) return;
    
    try {
        app.ajouterLog('🚀 Collecte manuelle démarrée...', 'info');
        await app.chargerDonneesInitiales();
    } catch (error) {
        app.ajouterLog(`❌ Erreur collecte: ${error.message}`, 'error');
    }
}

async function actualiserPredictions() {
    const app = window.dashboardApp;
    if (!app) return;
    
    try {
        app.ajouterLog('🔮 Actualisation des prédictions...', 'info');
        app.predictions = await app.api.genererPredictions(app.zonesActives);
        app.mettreAJourGraphique();
        app.mettreAJourZones();
        app.ajouterLog('✅ Prédictions actualisées', 'success');
    } catch (error) {
        app.ajouterLog(`❌ Erreur prédictions: ${error.message}`, 'error');
    }
}

function exporterDonnees() {
    const app = window.dashboardApp;
    if (!app || !app.donnees) {
        console.error('Aucune donnée à exporter');
        return;
    }
    
    try {
        const exportData = {
            donnees: app.donnees,
            predictions: app.predictions,
            metriques: app.api.calculerMetriques(app.donnees),
            timestamp: new Date().toISOString()
        };
        
        const blob = new Blob([JSON.stringify(exportData, null, 2)], 
            { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `smart_energy_data_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        app.ajouterLog('💾 Données exportées avec succès', 'success');
    } catch (error) {
        app.ajouterLog(`❌ Erreur export: ${error.message}`, 'error');
    }
}

/**
 * Initialisation au chargement de la page
 */
document.addEventListener('DOMContentLoaded', () => {
    console.log('🌟 Smart Energy Predictor Dashboard - Initialisation...');
    window.dashboardApp = new SmartEnergyDashboard();
});

/**
 * Nettoyage avant fermeture
 */
window.addEventListener('beforeunload', () => {
    if (window.dashboardApp) {
        window.dashboardApp.destroy();
    }
});