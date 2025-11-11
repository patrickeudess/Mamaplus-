/**
 * Gestion des alertes prioritaires - Version simplifiée
 * Fonctionne avec localStorage (sans serveur backend)
 */

// Clé pour le stockage local (même clé que app-professionnel-simple.js)
const STORAGE_KEY = 'mama_patientes_data';

// Données par défaut (mêmes que dans app-professionnel-simple.js)
const DEFAULT_PATIENTES = [
  {
    id: 1,
    prenom: "Awa",
    nom: "Koffi",
    age: 28,
    ville: "Bamako",
    distance_centre: 2.3,
    risque: "moyen",
    derniere_venue: "2024-03-15",
    prochaine_cpn: "2024-04-20",
    telephone: "+22370000001"
  },
  {
    id: 2,
    prenom: "Mariam",
    nom: "Kouadio",
    age: 19,
    ville: "Bamako",
    distance_centre: 5.1,
    risque: "élevé",
    derniere_venue: "2024-03-10",
    prochaine_cpn: "2024-04-18",
    telephone: "+22370000002"
  },
  {
    id: 3,
    prenom: "Fatou",
    nom: "Diallo",
    age: 32,
    ville: "Sikasso",
    distance_centre: 1.8,
    risque: "faible",
    derniere_venue: "2024-03-20",
    prochaine_cpn: "2024-04-19",
    telephone: "+22370000003"
  }
];

// Fonction pour récupérer les patientes
function getPatientes() {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {
      console.error("Erreur lors de la lecture des patientes:", e);
      return DEFAULT_PATIENTES;
    }
  }
  // Si aucune donnée, initialiser avec les données par défaut
  localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_PATIENTES));
  return DEFAULT_PATIENTES;
}

// Fonction pour calculer les alertes prioritaires
function calculatePriorityAlerts() {
  const patientes = getPatientes();
  const alerts = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  patientes.forEach(patiente => {
    // Alerte 1: Risque élevé
    if (patiente.risque === "élevé") {
      alerts.push({
        type: "risque_eleve",
        priority: "high",
        patiente: patiente,
        message: `Risque élevé - ${patiente.prenom} ${patiente.nom}`,
        description: `Patiente à risque élevé nécessitant un suivi renforcé`,
        action: "Suivi urgent requis"
      });
    }
    
    // Alerte 2: CPN manquée ou en retard
    if (patiente.prochaine_cpn) {
      try {
        const cpnDate = new Date(patiente.prochaine_cpn);
        if (!isNaN(cpnDate.getTime())) {
          cpnDate.setHours(0, 0, 0, 0);
          const daysDiff = Math.floor((today - cpnDate) / (1000 * 60 * 60 * 24));
          
          if (daysDiff > 0) {
            alerts.push({
              type: "cpn_retard",
              priority: daysDiff > 7 ? "high" : "medium",
              patiente: patiente,
              message: `CPN en retard - ${patiente.prenom} ${patiente.nom}`,
              description: `CPN prévue il y a ${daysDiff} jour(s) - Non réalisée`,
              action: "Contacter la patiente"
            });
          } else if (daysDiff === 0) {
            alerts.push({
              type: "cpn_aujourdhui",
              priority: "medium",
              patiente: patiente,
              message: `CPN aujourd'hui - ${patiente.prenom} ${patiente.nom}`,
              description: `Consultation prénatale prévue aujourd'hui`,
              action: "Vérifier la présence"
            });
          }
        }
      } catch (e) {
        console.warn("Erreur lors du traitement de la date CPN:", e);
      }
    }
    
    // Alerte 3: Pas de consultation depuis longtemps
    if (patiente.derniere_venue) {
      try {
        const lastVisit = new Date(patiente.derniere_venue);
        if (!isNaN(lastVisit.getTime())) {
          lastVisit.setHours(0, 0, 0, 0);
          const daysSinceVisit = Math.floor((today - lastVisit) / (1000 * 60 * 60 * 24));
          
          if (daysSinceVisit > 30) {
            alerts.push({
              type: "pas_de_visite",
              priority: daysSinceVisit > 60 ? "high" : "medium",
              patiente: patiente,
              message: `Pas de visite depuis ${daysSinceVisit} jours - ${patiente.prenom} ${patiente.nom}`,
              description: `Dernière consultation il y a ${daysSinceVisit} jour(s)`,
              action: "Rappel urgent"
            });
          }
        }
      } catch (e) {
        console.warn("Erreur lors du traitement de la date de dernière venue:", e);
      }
    } else {
      // Jamais venue
      alerts.push({
        type: "jamais_venue",
        priority: "high",
        patiente: patiente,
        message: `Jamais venue - ${patiente.prenom} ${patiente.nom}`,
        description: `Aucune consultation enregistrée`,
        action: "Premier contact urgent"
      });
    }
    
    // Alerte 4: Distance importante + risque
    if (patiente.distance_centre > 10 && (patiente.risque === "élevé" || patiente.risque === "moyen")) {
      alerts.push({
        type: "distance_risque",
        priority: "medium",
        patiente: patiente,
        message: `Distance importante (${patiente.distance_centre} km) - ${patiente.prenom} ${patiente.nom}`,
        description: `Patiente à ${patiente.distance_centre} km du centre avec risque ${patiente.risque}`,
        action: "Suivi renforcé"
      });
    }
    
    // Alerte 5: Âge à risque
    if (patiente.age < 18 || patiente.age > 35) {
      alerts.push({
        type: "age_risque",
        priority: patiente.age < 18 ? "high" : "medium",
        patiente: patiente,
        message: `Âge à risque (${patiente.age} ans) - ${patiente.prenom} ${patiente.nom}`,
        description: `Patiente ${patiente.age < 18 ? 'mineure' : 'de plus de 35 ans'} nécessitant un suivi particulier`,
        action: "Suivi adapté requis"
      });
    }
  });
  
  // Trier par priorité (high en premier)
  alerts.sort((a, b) => {
    if (a.priority !== b.priority) {
      return a.priority === "high" ? -1 : 1;
    }
    return 0;
  });
  
  return alerts;
}

// Fonction pour obtenir l'icône selon le type d'alerte
function getAlertIcon(type) {
  const icons = {
    "risque_eleve": "🔴",
    "cpn_retard": "⏰",
    "cpn_aujourdhui": "📅",
    "pas_de_visite": "📞",
    "jamais_venue": "🚨",
    "distance_risque": "📍",
    "age_risque": "👤"
  };
  return icons[type] || "⚠️";
}

// Fonction pour obtenir la couleur selon la priorité
function getPriorityColor(priority) {
  return priority === "high" ? "#dc2626" : "#f59e0b";
}

// Fonction pour afficher les alertes
function renderPriorityAlerts() {
  const container = document.querySelector("#alertes-prioritaires-content");
  if (!container) return;
  
  const alerts = calculatePriorityAlerts();
  
  if (alerts.length === 0) {
    container.innerHTML = `
      <div style="text-align: center; padding: 2rem; color: #6b7280;">
        <span style="font-size: 3rem; display: block; margin-bottom: 1rem;">✅</span>
        <p style="font-size: 1.125rem; font-weight: 600; margin-bottom: 0.5rem;">Aucune alerte prioritaire</p>
        <p style="font-size: 0.875rem;">Toutes les patientes sont suivies correctement.</p>
      </div>
    `;
    return;
  }
  
  // Séparer les alertes par priorité
  const highPriority = alerts.filter(a => a.priority === "high");
  const mediumPriority = alerts.filter(a => a.priority === "medium");
  
  let html = "";
  
  // Alertes haute priorité
  if (highPriority.length > 0) {
    html += `
      <div style="margin-bottom: 1.5rem;">
        <h3 style="color: #dc2626; font-size: 1rem; font-weight: 600; margin-bottom: 1rem; display: flex; align-items: center; gap: 0.5rem;">
          <span>🔴</span> Haute priorité (${highPriority.length})
        </h3>
        <div style="display: grid; gap: 1rem;">
          ${highPriority.map(alert => `
            <div style="background: #fef2f2; border-left: 4px solid #dc2626; padding: 1rem; border-radius: 0.5rem;">
              <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 0.5rem;">
                <div style="flex: 1;">
                  <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.25rem;">
                    <span style="font-size: 1.25rem;">${getAlertIcon(alert.type)}</span>
                    <strong style="color: #dc2626; font-size: 1rem;">${alert.message}</strong>
                  </div>
                  <p style="color: #6b7280; font-size: 0.875rem; margin-bottom: 0.25rem;">${alert.description}</p>
                  <p style="color: #991b1b; font-size: 0.875rem; font-weight: 600;">${alert.action}</p>
                </div>
                <div style="display: flex; gap: 0.5rem;">
                  ${alert.patiente.telephone ? `
                    <button onclick="handleCall('${alert.patiente.telephone}')" style="padding: 0.5rem 1rem; background: #dc2626; color: white; border: none; border-radius: 0.375rem; cursor: pointer; font-size: 0.875rem;" title="Appeler">
                      📞
                    </button>
                  ` : ''}
                  <a href="mes-patientes.html" style="padding: 0.5rem 1rem; background: #6b7280; color: white; border: none; border-radius: 0.375rem; cursor: pointer; font-size: 0.875rem; text-decoration: none; display: inline-block;" title="Voir la liste">
                    👁️
                  </a>
                </div>
              </div>
            </div>
          `).join("")}
        </div>
      </div>
    `;
  }
  
  // Alertes priorité moyenne
  if (mediumPriority.length > 0) {
    html += `
      <div>
        <h3 style="color: #f59e0b; font-size: 1rem; font-weight: 600; margin-bottom: 1rem; display: flex; align-items: center; gap: 0.5rem;">
          <span>🟠</span> Priorité moyenne (${mediumPriority.length})
        </h3>
        <div style="display: grid; gap: 1rem;">
          ${mediumPriority.map(alert => `
            <div style="background: #fffbeb; border-left: 4px solid #f59e0b; padding: 1rem; border-radius: 0.5rem;">
              <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 0.5rem;">
                <div style="flex: 1;">
                  <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.25rem;">
                    <span style="font-size: 1.25rem;">${getAlertIcon(alert.type)}</span>
                    <strong style="color: #f59e0b; font-size: 1rem;">${alert.message}</strong>
                  </div>
                  <p style="color: #6b7280; font-size: 0.875rem; margin-bottom: 0.25rem;">${alert.description}</p>
                  <p style="color: #92400e; font-size: 0.875rem; font-weight: 600;">${alert.action}</p>
                </div>
                <div style="display: flex; gap: 0.5rem;">
                  ${alert.patiente.telephone ? `
                    <button onclick="handleCall('${alert.patiente.telephone}')" style="padding: 0.5rem 1rem; background: #f59e0b; color: white; border: none; border-radius: 0.375rem; cursor: pointer; font-size: 0.875rem;" title="Appeler">
                      📞
                    </button>
                  ` : ''}
                  <a href="mes-patientes.html" style="padding: 0.5rem 1rem; background: #6b7280; color: white; border: none; border-radius: 0.375rem; cursor: pointer; font-size: 0.875rem; text-decoration: none; display: inline-block;" title="Voir la liste">
                    👁️
                  </a>
                </div>
              </div>
            </div>
          `).join("")}
        </div>
      </div>
    `;
  }
  
  container.innerHTML = html;
}

// Fonction pour appeler une patiente
window.handleCall = function(telephone) {
  if (!telephone || telephone.trim() === "") {
    alert("Numéro de téléphone non disponible pour cette patiente.");
    return;
  }
  const cleanPhone = telephone.trim().replace(/\s+/g, "");
  if (!/^\+?[0-9]{8,15}$/.test(cleanPhone)) {
    alert(`Numéro de téléphone invalide: ${telephone}`);
    return;
  }
  window.location.href = `tel:${cleanPhone}`;
};

// Initialisation au chargement de la page
document.addEventListener("DOMContentLoaded", () => {
  // Afficher les alertes
  renderPriorityAlerts();
  
  // Rafraîchir les alertes toutes les 30 secondes
  setInterval(() => {
    renderPriorityAlerts();
  }, 30000);
  
  console.log("✅ Alertes prioritaires chargées");
});

