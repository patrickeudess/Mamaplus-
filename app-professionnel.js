const API_BASE = "http://localhost:8000/api";

let authToken = localStorage.getItem("mama_token") || "";
let currentUser = null;
let patientesCache = [];
let cpnCache = [];
let risksMapCache = {};
let statsCache = null;
let dossiersMapCache = {};

const userInfo = document.querySelector("#user-info");
const userName = document.querySelector("#user-name");
const logoutButton = document.querySelector("#logout-button");
const statsSection = document.querySelector("#stats");
const statsContent = document.querySelector("#stats-content");
// Sélectionner les éléments DOM - utiliser des fonctions pour éviter les erreurs si les éléments n'existent pas
const patientTableBody = document.querySelector("#patient-table tbody");
const dossierContent = document.querySelector("#dossier-content");
const consultationForm = document.querySelector("#consultation-form");
const consultationSelect = document.querySelector("#consultation-patiente");
const consultationMessage = document.querySelector("#consultation-message");
const reminderForm = document.querySelector("#reminder-form");
const reminderSelect = document.querySelector("#reminder-cpn");
const reminderMessage = document.querySelector("#reminder-message");
const riskFilter = document.querySelector("#risk-filter");
const locationFilter = document.querySelector("#location-filter");
const weekFilter = document.querySelector("#week-filter");
const cpnStatusFilter = document.querySelector("#cpn-status-filter");
const ageFilter = document.querySelector("#age-filter");
const distanceFilter = document.querySelector("#distance-filter");
const lastVisitFilter = document.querySelector("#last-visit-filter");
const resetFiltersBtn = document.querySelector("#reset-filters-btn");
const exportBtn = document.querySelector("#export-btn");
const alertsContent = document.querySelector("#alerts-content");
const performanceContent = document.querySelector("#performance-content");
const mapClusters = document.querySelector("#map-clusters");
const addPatienteBtn = document.querySelector("#add-patiente-btn");
const addPatienteModal = document.querySelector("#add-patiente-modal");
const closeModalBtn = document.querySelector("#close-modal-btn");
const cancelPatienteBtn = document.querySelector("#cancel-patiente-btn");
const addPatienteForm = document.querySelector("#add-patiente-form");
const patienteMessage = document.querySelector("#patiente-message");
const professionalProfileFormCard = document.querySelector("#professional-profile-form-card");
const professionalProfileForm = document.querySelector("#professional-profile-form");
const professionalProfileMessage = document.querySelector("#professional-profile-message");

const defaultHeaders = () => {
  const headers = { "Content-Type": "application/json" };
  if (authToken) {
    headers["Authorization"] = `Bearer ${authToken}`;
  }
  return headers;
};

async function fetchJSON(path, options = {}) {
  // Mode démonstration : utiliser des données mockées si le serveur n'est pas accessible
  const USE_MOCK = window.USE_MOCK_DATA === true; // Désactivé par défaut - utiliser l'API réelle
  
  try {
  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: { ...defaultHeaders(), ...(options.headers || {}) },
      mode: "cors",
  });
    
  if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
  }
    
  if (response.status === 204) {
    return null;
  }
    
    return await response.json();
  } catch (error) {
    // Mode mock désactivé par défaut - propager l'erreur pour forcer l'utilisation de l'API réelle
    // Si le mode mock est activé manuellement (window.USE_MOCK_DATA = true), alors utiliser les données mockées
    if (USE_MOCK && (error instanceof TypeError || error.message.includes("fetch") || error.message.includes("HTTP"))) {
      console.warn(`[Mode démonstration] Utilisation de données mockées pour ${path} - Veuillez démarrer le serveur backend`);
      try {
        return await getMockData(path, options);
      } catch (mockError) {
        // Si même le mock échoue, propager l'erreur originale
        console.error(`Erreur API ${path}:`, error);
        throw error;
      }
    }
    
    // Sinon, propager l'erreur
    console.error(`Erreur API ${path}:`, error);
    throw error;
  }
}

// Fonction pour obtenir des données mockées (DÉSACTIVÉE - Utilisation de l'API réelle uniquement)
async function getMockData(path, options = {}) {
  // Cette fonction ne devrait plus être utilisée car USE_MOCK est désactivé par défaut
  // Elle est conservée uniquement pour compatibilité en cas d'activation manuelle du mode mock
  console.warn("⚠️ Mode mock activé manuellement - Utilisation de données fictives");
  throw new Error("Mode démonstration désactivé. Veuillez démarrer le serveur backend pour utiliser l'API réelle.");
}

function handleLogout() {
  authToken = "";
  localStorage.removeItem("mama_token");
  currentUser = null;
  // Ne pas rediriger en mode développement
  // window.location.href = "index.html";
  if (userInfo) {
    userInfo.classList.add("hidden");
  }
}

async function fetchCurrentUser() {
  // Mode sans authentification - désactivé
  // currentUser = await fetchJSON("/auth/me");
  // // Vérifier que c'est un professionnel
  // if (currentUser.role !== "professionnel" && currentUser.role !== "admin") {
  //   handleLogout();
  //   throw new Error("Accès réservé aux professionnels de santé");
  // }
  // userName.textContent = `${currentUser.prenom || ""} ${currentUser.nom || ""}`.trim() || currentUser.telephone;
  // userInfo.classList.remove("hidden");
  
  // Mode développement
  if (userInfo) {
  userInfo.classList.remove("hidden");
    if (userName) {
      userName.textContent = "Mode Développement";
    }
  }
}

function calculateAttendanceRate(patientes) {
  let totalCpn = 0;
  let completedCpn = 0;
  patientes.forEach(p => {
    totalCpn += p.cpn_total || 0;
    completedCpn += p.cpn_completes || 0;
  });
  return totalCpn > 0 ? Math.round((completedCpn / totalCpn) * 100) : 0;
}

function calculateAlertRate(patientes, risksMap) {
  let highRiskNotAttended = 0;
  let highRiskTotal = 0;
  patientes.forEach(p => {
    const risk = risksMap[p.id];
    if (risk && risk.available && risk.risk_level === "élevé") {
      highRiskTotal++;
      const lastCpn = p.prochaine_cpn;
      if (!lastCpn || new Date(lastCpn.date_rdv) < new Date()) {
        highRiskNotAttended++;
      }
    }
  });
  return highRiskTotal > 0 ? Math.round((highRiskNotAttended / highRiskTotal) * 100) : 0;
}

function renderStats(stats, riskStats = null, patientes = [], risksMap = {}) {
  const attendanceRate = calculateAttendanceRate(patientes);
  const alertRate = calculateAlertRate(patientes, risksMap);
  
  let riskStatsHTML = "";
  if (riskStats) {
    const total = (riskStats.eleve || 0) + (riskStats.moyen || 0) + (riskStats.faible || 0);
    riskStatsHTML = `
      <div class="risk-stats-section">
        <h3>Répartition par catégorie de risque</h3>
        <div class="risk-stats-grid">
          <div class="risk-stat-item risk-high-stat">
            <span class="stat-value">${riskStats.eleve || 0}</span>
            <span class="stat-label">🔴 Risque élevé</span>
            ${total > 0 ? `<span class="stat-percentage">${Math.round((riskStats.eleve / total) * 100)}%</span>` : ""}
          </div>
          <div class="risk-stat-item risk-medium-stat">
            <span class="stat-value">${riskStats.moyen || 0}</span>
            <span class="stat-label">🟠 Risque modéré</span>
            ${total > 0 ? `<span class="stat-percentage">${Math.round((riskStats.moyen / total) * 100)}%</span>` : ""}
          </div>
          <div class="risk-stat-item risk-low-stat">
            <span class="stat-value">${riskStats.faible || 0}</span>
            <span class="stat-label">🟢 Risque faible</span>
            ${total > 0 ? `<span class="stat-percentage">${Math.round((riskStats.faible / total) * 100)}%</span>` : ""}
          </div>
        </div>
      </div>
    `;
  }
  
  const statsHTML = `
    <div class="stats-grid">
      <div class="stat-card">
        <span class="stat-value">${stats.total_patientes}</span>
        <span class="stat-label">Patientes suivies</span>
      </div>
      <div class="stat-card">
        <span class="stat-value">${stats.cpn_planifiees}</span>
        <span class="stat-label">CPN planifiées</span>
      </div>
      <div class="stat-card">
        <span class="stat-value">${stats.cpn_aujourd_hui}</span>
        <span class="stat-label">CPN du jour</span>
      </div>
      <div class="stat-card">
        <span class="stat-value">${attendanceRate}%</span>
        <span class="stat-label">Taux de venue CPN</span>
      </div>
      <div class="stat-card">
        <span class="stat-value">${alertRate}%</span>
        <span class="stat-label">Taux d'alerte</span>
        <small>Patientes à risque élevé non venues</small>
      </div>
      <div class="stat-card">
        <span class="stat-value">${stats.consultations_ce_mois}</span>
        <span class="stat-label">Consultations ce mois</span>
      </div>
    </div>
    ${riskStatsHTML}
  `;
  
  // Afficher dans statsContent si disponible, sinon dans statsSection
  if (statsContent) {
    statsContent.innerHTML = statsHTML;
  } else if (statsSection) {
    statsSection.innerHTML = `<h2>Tableau de bord analytique</h2>${statsHTML}`;
  }
}

function calculatePregnancyWeek(dateDernieresRegles, dateAccouchementPrevue) {
  if (dateAccouchementPrevue) {
    const today = new Date();
    const dueDate = new Date(dateAccouchementPrevue);
    const diffTime = dueDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const weeks = Math.floor((280 - diffDays) / 7);
    return Math.max(0, Math.min(42, weeks));
  } else if (dateDernieresRegles) {
    const today = new Date();
    const lastPeriod = new Date(dateDernieresRegles);
    const diffTime = today - lastPeriod;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const weeks = Math.floor(diffDays / 7);
    return Math.max(0, Math.min(42, weeks));
  }
  return null;
}

function getLastVisit(patiente, dossier) {
  if (!dossier || !dossier.consultations || dossier.consultations.length === 0) {
    return "–";
  }
  const lastConsultation = dossier.consultations
    .sort((a, b) => new Date(b.date_consultation) - new Date(a.date_consultation))[0];
  return new Date(lastConsultation.date_consultation).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit"
  });
}

function renderPatientes(patientes, risksMap = {}, filterRisk = "all", filterLocation = "all", filterWeek = "all", filterCpnStatus = "all", filterAge = "all", filterDistance = "all", filterLastVisit = "all", dossiersMap = {}) {
  // Vérifier que l'élément existe avant de l'utiliser
  const tableBody = document.querySelector("#patient-table tbody") || patientTableBody;
  if (!tableBody) {
    console.warn("Table body not found, cannot render patientes");
    return { eleve: 0, moyen: 0, faible: 0 };
  }
  
  tableBody.innerHTML = "";
  
  // Sauvegarder les risques pour le filtre
  risksMapCache = risksMap;
  
  // Calculer les statistiques de risque sur TOUTES les patientes (pas seulement filtrées)
  const riskStats = { eleve: 0, moyen: 0, faible: 0 };
      patientes.forEach((patiente) => {
    const risk = risksMap[patiente.id];
    if (risk && risk.available) {
      const riskLevel = risk.risk_level;
      if (riskLevel === "élevé") riskStats.eleve++;
      else if (riskLevel === "moyen") riskStats.moyen++;
      else if (riskLevel === "faible") riskStats.faible++;
    }
  });
  
  // Trier les patientes par ID décroissant pour que les nouvelles apparaissent en premier
  // Les patientes avec les IDs les plus élevés (les plus récentes) apparaissent en premier
  const sortedPatientes = [...patientes].sort((a, b) => {
    const idA = a.id || 0;
    const idB = b.id || 0;
    // Trier par ID décroissant (les plus récentes en premier)
    return idB - idA;
  });
  
  console.log(`📊 Tri des patientes: ${sortedPatientes.length} patientes triées par ID décroissant`);
  
  // Filtrer les patientes
  let filteredPatientes = sortedPatientes.filter((patiente) => {
    // Filtre par risque
    if (filterRisk !== "all") {
      const risk = risksMap[patiente.id];
      if (!risk || !risk.available || risk.risk_level !== filterRisk) return false;
    }
    
    // Filtre par localité
    if (filterLocation !== "all" && patiente.ville !== filterLocation) return false;
    
    // Filtre par semaine de grossesse
    if (filterWeek !== "all") {
      const semaine = calculatePregnancyWeek(patiente.date_dernieres_regles, patiente.date_accouchement_prevue);
      if (semaine === null) return false;
      const [min, max] = filterWeek.split("-").map(Number);
      if (semaine < min || semaine > max) return false;
    }
    
    // Filtre par statut CPN
    if (filterCpnStatus !== "all") {
      if (!patiente.prochaine_cpn || patiente.prochaine_cpn.statut !== filterCpnStatus) {
        return false;
      }
    }
    
    // Filtre par âge
    if (filterAge !== "all") {
      const age = patiente.age || 0;
      if (filterAge === "41+") {
        if (age < 41) return false;
      } else {
        const [min, max] = filterAge.split("-").map(Number);
        if (age < min || age > max) return false;
      }
    }
    
    // Filtre par distance
    if (filterDistance !== "all") {
      const distance = patiente.distance_centre || 0;
      if (filterDistance === "10+") {
        if (distance < 10) return false;
      } else {
        const [min, max] = filterDistance.split("-").map(Number);
        if (distance < min || distance >= max) return false;
      }
    }
    
    // Filtre par dernière venue
    if (filterLastVisit !== "all") {
      const dossier = dossiersMap[patiente.id];
      const derniereVenue = getLastVisit(patiente, dossier);
      
      if (filterLastVisit === "never") {
        if (derniereVenue !== "Jamais") return false;
      } else {
        // Vérifier si la dernière venue correspond à la période
        const now = new Date();
        now.setHours(0, 0, 0, 0);
        
        let lastVisitDate = null;
        if (dossier && dossier.consultations && dossier.consultations.length > 0) {
          const sortedConsultations = dossier.consultations
            .filter(c => c.date_consultation)
            .sort((a, b) => new Date(b.date_consultation) - new Date(a.date_consultation));
          if (sortedConsultations.length > 0) {
            lastVisitDate = new Date(sortedConsultations[0].date_consultation);
            lastVisitDate.setHours(0, 0, 0, 0);
          }
        }
        
        if (!lastVisitDate) {
          if (filterLastVisit !== "never") return false;
        } else {
          const daysDiff = Math.floor((now - lastVisitDate) / (1000 * 60 * 60 * 24));
          
          if (filterLastVisit === "today" && daysDiff !== 0) return false;
          if (filterLastVisit === "week" && daysDiff > 7) return false;
          if (filterLastVisit === "month" && daysDiff > 30) return false;
          if (filterLastVisit === "3months" && daysDiff > 90) return false;
        }
      }
    }
    
    return true;
  });
  
  filteredPatientes.forEach((patiente) => {
        const row = document.createElement("tr");
        const prochaine = patiente.prochaine_cpn
      ? new Date(patiente.prochaine_cpn.date_rdv).toLocaleDateString("fr-FR", {
          day: "2-digit",
          month: "2-digit"
        })
          : "–";
    
    // Distance
    const distance = patiente.distance_centre ? `${patiente.distance_centre.toFixed(1)} km` : "–";
    
    // Dernière venue
    const dossier = dossiersMap[patiente.id];
    const derniereVenue = getLastVisit(patiente, dossier);
    
    // Afficher le risque avec score
        const risk = risksMap[patiente.id];
        let riskBadge = "–";
    let riskRowClass = "";
        if (risk && risk.available) {
      const riskLevel = risk.risk_level;
      const riskClass = riskLevel === "élevé" ? "risk-badge-high" : 
                       riskLevel === "moyen" ? "risk-badge-medium" : "risk-badge-low";
      const riskPercentage = Math.round(risk.risk_score * 100);
      const riskEmoji = riskLevel === "élevé" ? "🔴" : riskLevel === "moyen" ? "🟠" : "🟢";
      
      // Ajouter une classe pour mettre en évidence les risques élevés
      if (riskLevel === "élevé") {
        riskRowClass = "risk-row-high";
      }
      
      riskBadge = `
        <div class="risk-cell">
          <span class="risk-badge ${riskClass}">${riskEmoji} ${riskLevel} (${riskPercentage}%)</span>
        </div>
      `;
    }

    // Récupérer le téléphone depuis le dossier ou directement depuis la patiente
    let telephone = "";
    if (dossier && dossier.patiente && dossier.patiente.user) {
      telephone = dossier.patiente.user.telephone || "";
    } else if (patiente.user && patiente.user.telephone) {
      telephone = patiente.user.telephone;
    } else if (patiente.telephone) {
      telephone = patiente.telephone;
    }
    
    // Échapper le téléphone pour l'utilisation dans onclick
    const telephoneEscaped = telephone.replace(/'/g, "\\'");
    
    // Actions
    const actionsHTML = `
      <div class="action-buttons">
        <button class="action-btn call-btn" onclick="event.stopPropagation(); handleCall('${telephoneEscaped}')" title="Appeler" ${!telephone ? 'disabled' : ''}>
          📞
        </button>
        <button class="action-btn edit-btn" onclick="event.stopPropagation(); handleEditPatiente(${patiente.id})" title="Modifier">
          ✏️
        </button>
        <button class="action-btn reminder-btn" onclick="event.stopPropagation(); handleQuickReminder(${patiente.id})" title="Rappel SMS">
          ✅
        </button>
        <button class="action-btn view-btn" onclick="event.stopPropagation(); loadDossier(${patiente.id})" title="Voir dossier">
          👁️
        </button>
        <button class="action-btn delete-btn" onclick="event.stopPropagation(); handleDeletePatiente(${patiente.id}, ${JSON.stringify(((patiente.prenom || '') + ' ' + (patiente.nom || '')).trim() || 'cette patiente')})" title="Supprimer">
          🗑️
        </button>
      </div>
    `;

    row.className = riskRowClass;
        row.innerHTML = `
          <td>${patiente.prenom || ""} ${patiente.nom || ""}</td>
          <td>${patiente.age}</td>
      <td>${distance}</td>
      <td>${riskBadge}</td>
      <td>${derniereVenue}</td>
          <td>${prochaine}</td>
      <td>${actionsHTML}</td>
        `;
        row.addEventListener("click", () => {
          loadDossier(patiente.id);
          // Afficher aussi les prédictions si la section est ouverte
          const predictionSection = document.getElementById("prediction-section");
          if (predictionSection && !predictionSection.classList.contains("hidden")) {
            displayPrediction(patiente, risk);
          }
        });
        tableBody.appendChild(row);
    });

  // Mettre à jour le select de consultation seulement s'il existe
  if (consultationSelect) {
  consultationSelect.innerHTML = patientes
    .map((patiente) => `<option value="${patiente.id}">${patiente.prenom || ""} ${patiente.nom || ""}</option>`)
    .join("");
  }
  
  return riskStats;
}

function renderReminders(cpnList) {
  // Vérifier que reminderSelect existe avant de l'utiliser
  if (!reminderSelect) {
    return;
  }
  
  reminderSelect.innerHTML = cpnList
    .map((cpn) => {
      const label = `${cpn.patiente.nom || ""} ${cpn.patiente.prenom || ""} – CPN ${cpn.numero_cpn} (${new Date(
        cpn.date_rdv
      ).toLocaleString()})`;
      return `<option value="${cpn.id}">${label}</option>`;
    })
    .join("");
}

function renderDossier(dossier) {
  // Vérifier que dossierContent existe avant de l'utiliser
  if (!dossierContent) {
    console.warn("dossierContent not found, cannot render dossier");
    return;
  }
  
  // Gérer la nouvelle structure avec PatienteWithUserResponse
  // dossier.patiente est maintenant un PatienteWithUserResponse qui contient {patiente: {...}, user: {...}}
  const patienteData = dossier.patiente && dossier.patiente.patiente ? dossier.patiente.patiente : (dossier.patiente || {});
  
  const consultations = dossier.consultations
    .map(
      (c) => `
        <li>
          <strong>${new Date(c.date_consultation).toLocaleString()} :</strong>
          Poids ${c.poids || "–"} kg, TA ${c.tension_arterielle_systolique || "–"}/${
        c.tension_arterielle_diastolique || "–"
      }
          <br/>${c.notes || ""}
        </li>
      `
    )
    .join("") || "<li>Aucune consultation enregistrée.</li>";

  const vaccinations = dossier.vaccinations
    .map(
      (v) => `
        <li>${v.type_vaccin} – ${new Date(v.date_vaccination).toLocaleDateString()} (${v.site_injection || ""})</li>
      `
    )
    .join("") || "<li>Aucune vaccination enregistrée.</li>";

  const cpnList = dossier.cpn
    .map(
      (cpn) => `
        <li>CPN ${cpn.numero_cpn} – ${new Date(cpn.date_rdv).toLocaleString()} (${cpn.statut})</li>
      `
    )
    .join("") || "<li>Aucun rendez-vous programmé.</li>";

  // Affichage de la prédiction de risque (UNIQUEMENT pour les professionnels)
  let predictionHTML = "";
  if (dossier.prediction_risk && dossier.prediction_risk.available) {
    const risk = dossier.prediction_risk;
    const riskClass = risk.risk_level === "élevé" ? "risk-high" : risk.risk_level === "moyen" ? "risk-medium" : "risk-low";
    const riskPercentage = Math.round(risk.risk_score * 100);
    const confidencePercentage = Math.round(risk.confidence * 100);
    
    const recommendations = risk.recommendations
      .map((rec) => `<li>${rec}</li>`)
      .join("") || "<li>Aucune recommandation spécifique</li>";

    // Afficher les features utilisées si disponibles
    let featuresHTML = "";
    if (risk.features_used && Object.keys(risk.features_used).length > 0) {
      const featuresList = Object.entries(risk.features_used)
        .map(([key, value]) => `<li><strong>${key}:</strong> ${value}</li>`)
        .join("");
      featuresHTML = `
        <div class="risk-features">
          <h5>Facteurs analysés:</h5>
          <ul>${featuresList}</ul>
        </div>
      `;
    }

    predictionHTML = `
      <article class="prediction-card ${riskClass}">
        <div class="prediction-header">
          <h4>🔍 Prédiction de risque de non-observance</h4>
          <span class="prediction-badge ${riskClass}">${risk.risk_level.toUpperCase()}</span>
        </div>
        <div class="risk-info">
          <div class="risk-score">
            <span class="risk-value">${riskPercentage}%</span>
            <span class="risk-label">Score de risque</span>
          </div>
          <div class="risk-metrics">
            <div class="risk-metric">
              <span class="metric-label">Niveau:</span>
              <span class="metric-value">${risk.risk_level}</span>
        </div>
            <div class="risk-metric">
              <span class="metric-label">Confiance:</span>
              <span class="metric-value">${confidencePercentage}%</span>
            </div>
          </div>
        </div>
        ${featuresHTML}
        <div class="risk-recommendations">
          <h5>💡 Recommandations:</h5>
          <ul>${recommendations}</ul>
        </div>
      </article>
    `;
  } else if (dossier.prediction_risk && !dossier.prediction_risk.available) {
    predictionHTML = `
      <article class="prediction-card">
        <h4>Prédiction de risque</h4>
        <p class="prediction-unavailable">Modèle de prédiction non disponible</p>
      </article>
    `;
  }

  dossierContent.innerHTML = `
    <h3>${patienteData.nom || ""} ${patienteData.prenom || ""}</h3>
    <div class="dossier-grids">
      <article>
        <h4>Consultations</h4>
        <ul>${consultations}</ul>
      </article>
      <article>
        <h4>Rendez-vous CPN</h4>
        <ul>${cpnList}</ul>
      </article>
      <article>
        <h4>Vaccinations</h4>
        <ul>${vaccinations}</ul>
      </article>
      ${predictionHTML}
    </div>
  `;
}

async function loadDossier(patienteId) {
  try {
    const dossier = await fetchJSON(`/patientes/${patienteId}/dossier`);
    renderDossier(dossier);
    
    // Afficher aussi les prédictions si la section est ouverte
    const predictionSection = document.getElementById("prediction-section");
    if (predictionSection && !predictionSection.classList.contains("hidden")) {
      // Trouver la patiente et son risque
      const patiente = patientesCache.find(p => p.id === patienteId);
      const risk = risksMapCache[patienteId];
      if (patiente) {
        displayPrediction(patiente, risk);
      }
    }
  } catch (error) {
    if (dossierContent) {
    dossierContent.textContent = `Erreur lors du chargement : ${error.message}`;
    }
  }
}

// Exposer loadDossier globalement
window.loadDossier = loadDossier;

function renderAlerts(patientes, risksMap, dossiersMap) {
  if (!alertsContent) return;
  
  const alerts = [];
  const today = new Date();
  const daysThreshold = 7; // Alertes pour patientes non venues depuis plus de 7 jours
  
  patientes.forEach(patiente => {
    const risk = risksMap[patiente.id];
    if (!risk || !risk.available || risk.risk_level !== "élevé") return;
    
    const dossier = dossiersMap[patiente.id];
    const lastVisit = dossier && dossier.consultations && dossier.consultations.length > 0
      ? new Date(dossier.consultations.sort((a, b) => new Date(b.date_consultation) - new Date(a.date_consultation))[0].date_consultation)
      : null;
    
    const daysSinceLastVisit = lastVisit ? Math.floor((today - lastVisit) / (1000 * 60 * 60 * 24)) : null;
    
    if (daysSinceLastVisit === null || daysSinceLastVisit > daysThreshold) {
      alerts.push({
        patiente,
        risk,
        dossier,
        daysSinceLastVisit,
        priority: daysSinceLastVisit === null ? "high" : daysSinceLastVisit > 14 ? "high" : "medium"
      });
    }
  });
  
  if (alerts.length === 0) {
    alertsContent.innerHTML = `
      <div class="empty-state">
        <span class="empty-icon">✅</span>
        <p>Aucune alerte prioritaire pour le moment.</p>
      </div>
    `;
    return;
  }
  
  alerts.sort((a, b) => {
    if (a.priority !== b.priority) {
      return a.priority === "high" ? -1 : 1;
    }
    return (b.daysSinceLastVisit || 0) - (a.daysSinceLastVisit || 0);
  });
  
  const alertsHTML = alerts
    .map(alert => {
      const daysText = alert.daysSinceLastVisit === null 
        ? "Jamais venue" 
        : `${alert.daysSinceLastVisit} jours`;
      return `
        <div class="alert-item ${alert.priority}">
          <div class="alert-header">
            <span class="alert-icon">⚠️</span>
            <div class="alert-info">
              <strong>${alert.patiente.prenom || ""} ${alert.patiente.nom || ""}</strong>
              <p>Risque élevé (${Math.round(alert.risk.risk_score * 100)}%) - Non venue depuis ${daysText}</p>
            </div>
          </div>
          <div class="alert-actions">
            <button class="btn-small btn-primary" onclick="handleCall('${alert.dossier && alert.dossier.patiente && alert.dossier.patiente.user ? alert.dossier.patiente.user.telephone : ""}')">📞 Appeler</button>
            <button class="btn-small btn-secondary" onclick="handleQuickReminder(${alert.patiente.id})">✅ Rappel</button>
            <button class="btn-small btn-secondary" onclick="loadDossier(${alert.patiente.id})">👁️ Voir</button>
          </div>
        </div>
      `;
    })
    .join("");
  
  alertsContent.innerHTML = `<div class="alerts-list">${alertsHTML}</div>`;
}

function renderPerformance(patientes, risksMap) {
  if (!performanceContent) return;
  
  // Calculer les statistiques mensuelles (simplifié pour la démo)
  const monthlyStats = {
    attendanceRate: calculateAttendanceRate(patientes),
    highRiskCount: Object.values(risksMap).filter(r => r && r.available && r.risk_level === "élevé").length,
    totalPatientes: patientes.length
  };
  
  performanceContent.innerHTML = `
    <div class="performance-stats">
      <div class="performance-item">
        <h4>Taux de venue par mois</h4>
        <div class="stat-bar">
          <div class="stat-bar-fill" style="width: ${monthlyStats.attendanceRate}%"></div>
          <span class="stat-bar-label">${monthlyStats.attendanceRate}%</span>
        </div>
        <small>Basé sur les CPN complétées</small>
      </div>
      <div class="performance-item">
        <h4>Évolution du nombre de patientes à risque élevé</h4>
        <div class="stat-value-large">${monthlyStats.highRiskCount}</div>
        <small>Patientes nécessitant une attention particulière</small>
      </div>
      <div class="performance-actions">
        <button class="btn-secondary" onclick="exportReport('pdf')">📄 Exporter PDF</button>
        <button class="btn-secondary" onclick="exportReport('excel')">📊 Exporter Excel</button>
      </div>
    </div>
  `;
}

function renderMapClusters(patientes, risksMap) {
  if (!mapClusters) return;
  
  // Grouper par localité
  const clusters = {};
  patientes.forEach(patiente => {
    const ville = patiente.ville || "Non spécifiée";
    if (!clusters[ville]) {
      clusters[ville] = { total: 0, highRisk: 0, mediumRisk: 0, lowRisk: 0 };
    }
    clusters[ville].total++;
    const risk = risksMap[patiente.id];
    if (risk && risk.available) {
      if (risk.risk_level === "élevé") clusters[ville].highRisk++;
      else if (risk.risk_level === "moyen") clusters[ville].mediumRisk++;
      else clusters[ville].lowRisk++;
    }
  });
  
  const clustersHTML = Object.entries(clusters)
    .map(([ville, data]) => `
      <div class="map-cluster-item">
        <strong>${ville}</strong>
        <div class="cluster-stats">
          <span>Total: ${data.total}</span>
          <span class="risk-high">🔴 ${data.highRisk}</span>
          <span class="risk-medium">🟠 ${data.mediumRisk}</span>
          <span class="risk-low">🟢 ${data.lowRisk}</span>
        </div>
      </div>
    `)
    .join("");
  
  mapClusters.innerHTML = clustersHTML || "<p>Aucune donnée de localisation disponible</p>";
}

// Fonctions globales pour les actions rapides
window.handleCall = function(telephone) {
  if (!telephone || telephone.trim() === "") {
    alert("Numéro de téléphone non disponible pour cette patiente.");
    console.warn("Tentative d'appel sans numéro de téléphone");
    return;
  }
  
  // Nettoyer le numéro de téléphone
  const cleanPhone = telephone.trim().replace(/\s+/g, "");
  
  // Vérifier que c'est un numéro valide
  if (!/^\+?[0-9]{8,15}$/.test(cleanPhone)) {
    alert(`Numéro de téléphone invalide: ${telephone}`);
    console.warn("Numéro de téléphone invalide:", telephone);
    return;
  }
  
  console.log(`📞 Appel de ${cleanPhone}...`);
  try {
    window.location.href = `tel:${cleanPhone}`;
  } catch (error) {
    console.error("Erreur lors de l'appel:", error);
    alert("Impossible de lancer l'appel. Vérifiez que votre appareil supporte les appels téléphoniques.");
  }
};

// Fonction pour modifier une patiente
window.handleEditPatiente = async function(patienteId) {
  try {
    // Charger les données de la patiente
    const patiente = await fetchJSON(`/patientes/${patienteId}/profil`);
    
    // Ouvrir le modal d'ajout mais en mode édition
    if (window.openAddPatienteModal) {
      window.openAddPatienteModal();
      
      // Attendre que le modal soit ouvert
      setTimeout(() => {
        // Remplir le formulaire avec les données de la patiente
        const form = document.querySelector("#add-patiente-form");
        if (form) {
          // Remplir les champs
          const telephoneInput = document.querySelector("#patiente-telephone");
          const nomInput = document.querySelector("#patiente-nom");
          const prenomInput = document.querySelector("#patiente-prenom");
          const ageInput = document.querySelector("#patiente-age");
          const gestiteInput = document.querySelector("#patiente-gestite");
          const pariteInput = document.querySelector("#patiente-parite");
          const niveauInstructionInput = document.querySelector("#patiente-niveau-instruction");
          const langueInput = document.querySelector("#patiente-langue");
          const distanceInput = document.querySelector("#patiente-distance");
          const transportInput = document.querySelector("#patiente-transport");
          const adresseInput = document.querySelector("#patiente-adresse");
          const villeInput = document.querySelector("#patiente-ville");
          const antecedentsMedicauxInput = document.querySelector("#patiente-antecedents-medicaux");
          const antecedentsObstetricauxInput = document.querySelector("#patiente-antecedents-obstetricaux");
          const allergiesInput = document.querySelector("#patiente-allergies");
          const contactTelephoneInput = document.querySelector("#patiente-contact-telephone");
          const contactNomInput = document.querySelector("#patiente-contact-nom");
          const dernieresReglesInput = document.querySelector("#patiente-dernieres-regles");
          const accouchementPrevueInput = document.querySelector("#patiente-accouchement-prevue");
          
          if (telephoneInput) telephoneInput.value = patiente.user?.telephone || "";
          if (nomInput) nomInput.value = patiente.patiente.nom || "";
          if (prenomInput) prenomInput.value = patiente.patiente.prenom || "";
          if (ageInput) ageInput.value = patiente.patiente.age || "";
          if (gestiteInput) gestiteInput.value = patiente.patiente.gestite || 1;
          if (pariteInput) pariteInput.value = patiente.patiente.parite || 0;
          if (niveauInstructionInput) niveauInstructionInput.value = patiente.patiente.niveau_instruction || "";
          if (langueInput) langueInput.value = patiente.patiente.langue_preferee || "fr";
          if (distanceInput) distanceInput.value = patiente.patiente.distance_centre || "";
          if (transportInput) transportInput.value = patiente.patiente.moyen_transport || "";
          if (adresseInput) adresseInput.value = patiente.patiente.adresse || "";
          if (villeInput) villeInput.value = patiente.patiente.ville || "";
          if (antecedentsMedicauxInput) antecedentsMedicauxInput.value = patiente.patiente.antecedents_medicaux || "";
          if (antecedentsObstetricauxInput) antecedentsObstetricauxInput.value = patiente.patiente.antecedents_obstetricaux || "";
          if (allergiesInput) allergiesInput.value = patiente.patiente.allergies || "";
          if (contactTelephoneInput) contactTelephoneInput.value = patiente.patiente.telephone_urgence || "";
          if (contactNomInput) contactNomInput.value = patiente.patiente.nom_contact_urgence || "";
          if (dernieresReglesInput && patiente.patiente.date_dernieres_regles) {
            dernieresReglesInput.value = patiente.patiente.date_dernieres_regles.split('T')[0];
          }
          if (accouchementPrevueInput && patiente.patiente.date_accouchement_prevue) {
            accouchementPrevueInput.value = patiente.patiente.date_accouchement_prevue.split('T')[0];
          }
          
          // Désactiver le champ téléphone en mode édition
          if (telephoneInput) {
            telephoneInput.disabled = true;
            telephoneInput.style.opacity = "0.6";
          }
          
          // Changer le titre du modal
          const modalTitle = document.querySelector("#add-patiente-modal h2");
          if (modalTitle) {
            modalTitle.textContent = "Modifier une patiente";
          }
          
          // Stocker l'ID de la patiente pour la mise à jour
          form.dataset.editPatienteId = patienteId;
        }
      }, 100);
    }
  } catch (error) {
    console.error("Erreur lors du chargement de la patiente:", error);
    alert("Erreur lors du chargement des données de la patiente: " + (error.message || "Erreur inconnue"));
  }
};

// Fonction pour supprimer une patiente
window.handleDeletePatiente = async function(patienteId, patienteName) {
  const confirmed = confirm(`Êtes-vous sûr de vouloir supprimer ${patienteName} ?\n\nCette action est irréversible.`);
  
  if (!confirmed) {
    return;
  }
  
  try {
    // Appeler l'API pour supprimer la patiente
    await fetchJSON(`/patientes/${patienteId}`, {
      method: "DELETE"
    });
    
    // Afficher un message de succès
    alert(`Patiente ${patienteName} supprimée avec succès.`);
    
    // Recharger la liste
    if (window.loadDashboardData) {
      await window.loadDashboardData();
    } else {
      window.location.reload();
    }
  } catch (error) {
    console.error("Erreur lors de la suppression:", error);
    let errorMessage = "Erreur lors de la suppression de la patiente";
    try {
      const errorData = JSON.parse(error.message);
      errorMessage = errorData.detail || errorMessage;
    } catch {
      errorMessage = error.message || errorMessage;
    }
    alert(errorMessage);
  }
};

window.handleQuickReminder = async function(patienteId) {
  try {
    // Trouver la prochaine CPN de cette patiente
    const allCpn = await fetchJSON("/cpn");
    const patienteCpn = allCpn
      .filter(cpn => cpn.patiente_id === patienteId && cpn.statut !== "complete")
      .sort((a, b) => new Date(a.date_rdv) - new Date(b.date_rdv))[0];
    
    if (!patienteCpn) {
      alert("Aucune CPN planifiée pour cette patiente");
      return;
    }
    
    await fetchJSON(`/cpn/${patienteCpn.id}/rappels`, {
      method: "POST",
      body: JSON.stringify({ types: ["sms"] }),
    });
    
    alert("Rappel SMS envoyé avec succès !");
    await loadDashboardData();
  } catch (error) {
    console.error("Erreur lors de l'envoi du rappel:", error);
    alert("Erreur lors de l'envoi du rappel : " + error.message);
  }
};

window.exportReport = function(format) {
  try {
    console.log(`📊 Export ${format.toUpperCase()} demandé...`);
    
    // Récupérer les données des patientes
    const table = document.querySelector("#patient-table");
    if (!table) {
      alert("Aucune donnée à exporter");
      return;
    }
    
    const rows = table.querySelectorAll("tbody tr");
    if (rows.length === 0) {
      alert("Aucune patiente à exporter");
      return;
    }
    
    // Préparer les données pour l'export
    const data = [];
    const headers = ["Nom", "Âge", "Distance", "Risque", "Dernière venue", "Prochaine CPN"];
    
    rows.forEach(row => {
      const cells = row.querySelectorAll("td");
      if (cells.length >= 6) {
        const rowData = {
          nom: cells[0].textContent.trim(),
          age: cells[1].textContent.trim(),
          distance: cells[2].textContent.trim(),
          risque: cells[3].textContent.trim(),
          derniereVenue: cells[4].textContent.trim(),
          prochaineCPN: cells[5].textContent.trim()
        };
        data.push(rowData);
      }
    });
    
    if (format === "excel" || format === "csv") {
      // Créer un CSV
      let csv = headers.join(",") + "\n";
      data.forEach(row => {
        csv += [
          `"${row.nom}"`,
          row.age,
          row.distance,
          `"${row.risque}"`,
          `"${row.derniereVenue}"`,
          `"${row.prochaineCPN}"`
        ].join(",") + "\n";
      });
      
      // Télécharger le fichier
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", `patientes_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      console.log(`✅ Export CSV réussi: ${data.length} patientes exportées`);
      alert(`Export réussi ! ${data.length} patiente(s) exportée(s) en CSV.`);
    } else {
      alert(`Export ${format.toUpperCase()} en cours de développement. Utilisez CSV pour l'instant.`);
    }
  } catch (error) {
    console.error("Erreur lors de l'export:", error);
    alert("Erreur lors de l'export: " + error.message);
  }
};

async function loadDashboardData() {
  try {
    console.log("Chargement des données du tableau de bord...");
    
    // Charger les données avec gestion d'erreur individuelle
    const [stats, patientes, cpn, risksData] = await Promise.allSettled([
      fetchJSON("/dashboard/stats").catch(err => {
        console.error("Erreur stats:", err);
        throw err;
      }),
      fetchJSON("/dashboard/patientes").catch(err => {
        console.error("Erreur patientes:", err);
        throw err;
      }),
      fetchJSON("/cpn?statut=planifie").catch(err => {
        console.error("Erreur CPN:", err);
        return []; // Retourner un tableau vide si erreur
      }),
      fetchJSON("/prediction/patientes/risks").catch(err => {
        console.warn("Erreur risques (non bloquant):", err);
        return { patientes: [] }; // Ne pas bloquer si erreur
      }),
    ]);
    
    // Extraire les valeurs ou gérer les erreurs
    const statsData = stats.status === "fulfilled" ? stats.value : null;
    const patientesData = patientes.status === "fulfilled" ? patientes.value : [];
    const cpnData = cpn.status === "fulfilled" ? cpn.value : [];
    const risksDataValue = risksData.status === "fulfilled" ? risksData.value : { patientes: [] };
    
    // Afficher des erreurs si certaines données n'ont pas pu être chargées
    if (stats.status === "rejected") {
      console.error("Impossible de charger les statistiques:", stats.reason);
      if (statsSection) {
        const errorHTML = `
          <div class="error-state">
            <span class="error-icon">⚠️</span>
            <p>Erreur lors du chargement des statistiques.</p>
            <small>${stats.reason?.message || "Erreur de connexion"}</small>
          </div>
        `;
        if (statsContent) {
          statsContent.innerHTML = errorHTML;
        } else if (statsSection) {
          statsSection.innerHTML = errorHTML;
        }
      }
    }
    
    if (patientes.status === "rejected") {
      console.error("Impossible de charger les patientes:", patientes.reason);
      const tableBody = document.querySelector("#patient-table tbody") || patientTableBody;
      if (tableBody) {
        const errorMsg = patientes.reason?.message || "Erreur de connexion";
        const isNetworkError = errorMsg.includes("fetch") || errorMsg.includes("Failed to fetch") || errorMsg.includes("NetworkError");
        
        tableBody.innerHTML = `
          <tr>
            <td colspan="7" class="error-state" style="padding: 3rem 2rem; text-align: center;">
              <div style="max-width: 500px; margin: 0 auto;">
                <span class="error-icon" style="font-size: 3rem; display: block; margin-bottom: 1rem;">⚠️</span>
                <p style="font-size: 1.125rem; font-weight: 600; margin-bottom: 0.5rem; color: #dc2626;">
                  ${isNetworkError ? "Serveur backend non accessible" : "Erreur lors du chargement des patientes"}
                </p>
                <small style="display: block; color: #6b7280; margin-bottom: 1rem;">
                  ${isNetworkError 
                    ? "Le serveur backend n'est pas démarré ou n'est pas accessible. Veuillez démarrer le serveur backend pour utiliser l'application." 
                    : errorMsg}
                </small>
                ${isNetworkError ? `
                  <div style="background: #f3f4f6; padding: 1rem; border-radius: 0.5rem; margin-top: 1rem; text-align: left; font-size: 0.875rem;">
                    <strong style="display: block; margin-bottom: 0.5rem;">Pour démarrer le serveur :</strong>
                    <ol style="margin: 0; padding-left: 1.5rem; color: #4b5563;">
                      <li><strong>Méthode simple :</strong> Double-cliquez sur <code style="background: #e5e7eb; padding: 0.125rem 0.25rem; border-radius: 0.25rem;">DEMARRER_SERVEUR.bat</code> à la racine du projet</li>
                      <li><strong>Ou manuellement :</strong> Ouvrez un terminal dans le dossier <code style="background: #e5e7eb; padding: 0.125rem 0.25rem; border-radius: 0.25rem;">backend</code></li>
                      <li>Exécutez : <code style="background: #e5e7eb; padding: 0.125rem 0.25rem; border-radius: 0.25rem;">uvicorn main_csv:app --reload</code></li>
                      <li>Attendez que le serveur démarre (généralement sur http://localhost:8000)</li>
                      <li>Rechargez cette page</li>
                    </ol>
                  </div>
                ` : ''}
              </div>
            </td>
          </tr>
        `;
      }
      return; // Arrêter si on ne peut pas charger les patientes
    }
    
    patientesCache = patientesData;
    cpnCache = cpnData;
    
    // Créer une map des risques par patiente
    const risksMap = {};
    if (risksDataValue && risksDataValue.patientes) {
      risksDataValue.patientes.forEach((item) => {
        risksMap[item.patiente_id] = item.prediction;
      });
    }
    
    // Charger les dossiers pour toutes les patientes (pour dernière venue)
    const dossiersMap = {};
    await Promise.all(
      patientesData.map(async (patiente) => {
        try {
          const dossier = await fetchJSON(`/patientes/${patiente.id}/dossier`);
          dossiersMap[patiente.id] = dossier;
        } catch (err) {
          console.warn(`Impossible de charger le dossier de la patiente ${patiente.id}:`, err);
        }
      })
    );
    
    // Sauvegarder les dossiers en cache
    dossiersMapCache = dossiersMap;
    
    // Remplir le filtre de localité
    if (locationFilter) {
      const villes = [...new Set(patientesData.map(p => p.ville).filter(Boolean))].sort();
      locationFilter.innerHTML = '<option value="all">Toutes</option>' + 
        villes.map(v => `<option value="${v}">${v}</option>`).join("");
    }
    
    // Sauvegarder les stats
    statsCache = statsData;
    
    // Calculer les statistiques de risque
    const filterRiskValue = riskFilter ? riskFilter.value : "all";
    const filterLocationValue = locationFilter ? locationFilter.value : "all";
    const filterWeekValue = weekFilter ? weekFilter.value : "all";
    const filterCpnStatusValue = cpnStatusFilter ? cpnStatusFilter.value : "all";
    const filterAgeValue = ageFilter ? ageFilter.value : "all";
    const filterDistanceValue = distanceFilter ? distanceFilter.value : "all";
    const filterLastVisitValue = lastVisitFilter ? lastVisitFilter.value : "all";
    const riskStats = renderPatientes(patientesData, risksMap, filterRiskValue, filterLocationValue, filterWeekValue, filterCpnStatusValue, filterAgeValue, filterDistanceValue, filterLastVisitValue, dossiersMap);
    
    // Sauvegarder les risques en cache
    risksMapCache = risksMap;
    
    // Afficher les statistiques avec les risques (toujours, car elles peuvent être affichées dans différentes sections)
    if (statsData) {
      renderStats(statsData, riskStats, patientesData, risksMap);
    }
    renderReminders(cpnData);
    
    // Afficher les alertes (toujours, car elles peuvent être affichées dans différentes sections)
    renderAlerts(patientesData, risksMap, dossiersMap);
    
    // Afficher les statistiques de performance (toujours, car elles peuvent être affichées dans différentes sections)
    renderPerformance(patientesData, risksMap);
    
    // Afficher les clusters de la carte (toujours, car elles peuvent être affichées dans différentes sections)
    renderMapClusters(patientesData, risksMap);
    
    console.log("Données chargées avec succès");
  } catch (error) {
    console.error("Erreur lors du chargement du tableau de bord:", error);
    const errorMsg = error.message || "Erreur de connexion";
    
    // Afficher les erreurs dans l'interface
    if (statsSection) {
        const errorHTML = `
          <div class="error-state">
            <span class="error-icon">⚠️</span>
            <p>Erreur lors du chargement des statistiques.</p>
            <small>${errorMsg}</small>
          </div>
        `;
        if (statsContent) {
          statsContent.innerHTML = errorHTML;
        } else if (statsSection) {
          statsSection.innerHTML = errorHTML;
        }
    }
    
    const tableBody = document.querySelector("#patient-table tbody") || patientTableBody;
    if (tableBody) {
      const isNetworkError = errorMsg.includes("fetch") || errorMsg.includes("Failed to fetch") || errorMsg.includes("NetworkError");
      
      tableBody.innerHTML = `
        <tr>
          <td colspan="7" class="error-state" style="padding: 3rem 2rem; text-align: center;">
            <div style="max-width: 500px; margin: 0 auto;">
              <span class="error-icon" style="font-size: 3rem; display: block; margin-bottom: 1rem;">⚠️</span>
              <p style="font-size: 1.125rem; font-weight: 600; margin-bottom: 0.5rem; color: #dc2626;">
                ${isNetworkError ? "Serveur backend non accessible" : "Erreur lors du chargement des patientes"}
              </p>
              <small style="display: block; color: #6b7280; margin-bottom: 1rem;">
                ${isNetworkError 
                  ? "Le serveur backend n'est pas démarré ou n'est pas accessible. Veuillez démarrer le serveur backend pour utiliser l'application." 
                  : errorMsg}
              </small>
              ${isNetworkError ? `
                <div style="background: #f3f4f6; padding: 1rem; border-radius: 0.5rem; margin-top: 1rem; text-align: left; font-size: 0.875rem;">
                  <strong style="display: block; margin-bottom: 0.5rem;">Pour démarrer le serveur :</strong>
                    <ol style="margin: 0; padding-left: 1.5rem; color: #4b5563;">
                      <li><strong>Méthode simple :</strong> Double-cliquez sur <code style="background: #e5e7eb; padding: 0.125rem 0.25rem; border-radius: 0.25rem;">DEMARRER_SERVEUR.bat</code> à la racine du projet</li>
                      <li><strong>Ou manuellement :</strong> Ouvrez un terminal dans le dossier <code style="background: #e5e7eb; padding: 0.125rem 0.25rem; border-radius: 0.25rem;">backend</code></li>
                      <li>Exécutez : <code style="background: #e5e7eb; padding: 0.125rem 0.25rem; border-radius: 0.25rem;">uvicorn main_csv:app --reload</code></li>
                      <li>Attendez que le serveur démarre (généralement sur http://localhost:8000)</li>
                      <li>Rechargez cette page</li>
                    </ol>
                </div>
              ` : ''}
            </div>
          </td>
        </tr>
      `;
    }
    
    if (alertsContent) {
      alertsContent.innerHTML = `
        <div class="error-state">
          <span class="error-icon">⚠️</span>
          <p>Erreur lors du chargement des alertes.</p>
          <small>${errorMsg}</small>
        </div>
      `;
    }
    
    if (performanceContent) {
      performanceContent.innerHTML = `
        <div class="error-state">
          <span class="error-icon">⚠️</span>
          <p>Erreur lors du chargement des statistiques de performance.</p>
          <small>${errorMsg}</small>
        </div>
      `;
    }
  }
}

async function handleConsultationSubmit(event) {
  event.preventDefault();
  const patienteId = Number(consultationSelect.value);
  const poids = Number(document.querySelector("#consultation-poids").value) || null;
  const tas = Number(document.querySelector("#consultation-tas").value) || null;
  const tad = Number(document.querySelector("#consultation-tad").value) || null;
  const notes = document.querySelector("#consultation-notes").value.trim();

  try {
    await fetchJSON("/consultations", {
      method: "POST",
      body: JSON.stringify({
        patiente_id: patienteId,
        poids,
        tension_arterielle_systolique: tas,
        tension_arterielle_diastolique: tad,
        notes,
      }),
    });
    consultationMessage.textContent = "Consultation enregistrée";
    consultationMessage.className = "message success";
    consultationForm.reset();
    await loadDashboardData();
  } catch (error) {
    consultationMessage.textContent = error.message;
    consultationMessage.className = "message error";
  }
}

async function handleReminderSubmit(event) {
  event.preventDefault();
  const cpnId = Number(reminderSelect.value);
  const selectedTypes = Array.from(reminderForm.querySelectorAll("input[type=checkbox]:checked")).map(
    (input) => input.value
  );
  try {
    await fetchJSON(`/cpn/${cpnId}/rappels`, {
      method: "POST",
      body: JSON.stringify({ types: selectedTypes }),
    });
    reminderMessage.textContent = "Rappels envoyés";
    reminderMessage.className = "message success";
    await loadDashboardData();
  } catch (error) {
    reminderMessage.textContent = error.message;
    reminderMessage.className = "message error";
  }
}


function hasProfessionalProfile() {
  const saved = localStorage.getItem("mama_professional_profile");
  return saved !== null;
}

function loadProfessionalProfile() {
  const saved = localStorage.getItem("mama_professional_profile");
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (e) {
      return null;
    }
  }
  return null;
}

function saveProfessionalProfile(data) {
  localStorage.setItem("mama_professional_profile", JSON.stringify(data));
}

function showProfessionalProfileForm() {
  if (professionalProfileFormCard) {
    professionalProfileFormCard.classList.remove("hidden");
    professionalProfileFormCard.style.display = "block";
  }
  // Masquer la grille d'outils mais pas les sections détaillées (elles sont déjà masquées)
  document.querySelectorAll(".tools-grid-section").forEach(el => {
    el.style.display = "none";
  });
  // S'assurer que les sections détaillées sont masquées
  document.querySelectorAll(".detail-section").forEach(el => {
    el.classList.add("hidden");
    el.style.display = "none";
  });
}

function hideProfessionalProfileForm() {
  if (professionalProfileFormCard) {
    professionalProfileFormCard.classList.add("hidden");
    professionalProfileFormCard.style.display = "none";
  }
  // Afficher la grille d'outils
  document.querySelectorAll(".tools-grid-section").forEach(el => {
    el.style.display = "";
    el.style.visibility = "visible";
  });
  // Les sections détaillées restent masquées par défaut (seront affichées au clic)
  document.querySelectorAll(".detail-section").forEach(el => {
    el.classList.add("hidden");
    el.style.display = "none";
  });
}

function handleProfessionalProfileSubmit(event) {
  event.preventDefault();
  
  const formData = {
    prenom: document.getElementById("prof-prenom")?.value || "",
    nom: document.getElementById("prof-nom")?.value || "",
    telephone: document.getElementById("prof-telephone")?.value || "",
    email: document.getElementById("prof-email")?.value || "",
    profession: document.getElementById("prof-profession")?.value || "",
    centre: document.getElementById("prof-centre")?.value || "",
    adresse_centre: document.getElementById("prof-adresse-centre")?.value || "",
    ville: document.getElementById("prof-ville")?.value || ""
  };
  
  if (!formData.prenom || !formData.nom || !formData.telephone || !formData.profession || !formData.centre) {
    if (professionalProfileMessage) {
      professionalProfileMessage.textContent = "Veuillez remplir tous les champs obligatoires.";
      professionalProfileMessage.className = "message error";
    }
    return;
  }
  
  saveProfessionalProfile(formData);
  hideProfessionalProfileForm();
  
  if (professionalProfileMessage) {
    professionalProfileMessage.textContent = "Profil créé avec succès !";
    professionalProfileMessage.className = "message success";
  }
  
  // Charger les données du tableau de bord
  loadDashboardData();
}

// Gestion de la navigation par cartes
function setupToolCards() {
  const toolCards = document.querySelectorAll(".tool-card");
  console.log(`Initialisation de ${toolCards.length} cartes d'outils`);
  
  if (toolCards.length === 0) {
    console.warn("Aucune carte d'outil trouvée, nouvelle tentative dans 500ms...");
    setTimeout(setupToolCards, 500);
    return;
  }
  
  toolCards.forEach((card, index) => {
    // Retirer l'ancien event listener si présent
    const newCard = card.cloneNode(true);
    card.parentNode.replaceChild(newCard, card);
    
    // Utiliser onclick ET addEventListener pour être sûr que ça fonctionne
    const handleCardClick = function(e) {
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      
      const href = newCard.getAttribute("href");
      console.log(`[Carte ${index}] Carte cliquée: ${href}`);
      
      if (href && href.startsWith("#")) {
        const sectionId = href.substring(1) + "-section";
        const section = document.getElementById(sectionId);
        
        console.log(`[Carte ${index}] Recherche de la section: ${sectionId}`);
        
        if (section) {
          console.log(`[Carte ${index}] ✅ Section trouvée, ouverture...`);
          
          // Masquer toutes les sections d'abord
          document.querySelectorAll(".detail-section").forEach(s => {
            s.classList.add("hidden");
            s.style.setProperty("display", "none", "important"); // Forcer le masquage
          });
          
          // Attendre un peu avant d'afficher (pour éviter les conflits)
          setTimeout(() => {
            // Afficher la section sélectionnée avec force
            section.classList.remove("hidden");
            section.style.removeProperty("display"); // Retirer display pour utiliser le CSS par défaut
            section.style.setProperty("display", "block", "important"); // Forcer l'affichage
            section.style.setProperty("visibility", "visible", "important");
            section.style.setProperty("opacity", "1", "important");
            section.style.setProperty("position", "relative", "important");
            section.style.setProperty("z-index", "10", "important");
            
            // S'assurer que la grille d'outils est visible
            const toolsGrid = document.querySelector(".tools-grid-section");
            if (toolsGrid) {
              toolsGrid.style.display = "";
            }
            
            // Vérifier que la section est vraiment visible
            const computedStyle = window.getComputedStyle(section);
            console.log(`[Carte ${index}] Section affichée:`, {
              id: section.id,
              inlineDisplay: section.style.display,
              computedDisplay: computedStyle.display,
              computedVisibility: computedStyle.visibility,
              computedOpacity: computedStyle.opacity,
              hasHiddenClass: section.classList.contains("hidden"),
              offsetHeight: section.offsetHeight,
              offsetWidth: section.offsetWidth
            });
            
            // Si la section n'est toujours pas visible, forcer encore plus
            if (computedStyle.display === "none" || section.offsetHeight === 0) {
              console.warn(`[Carte ${index}] Section toujours masquée, forçage supplémentaire...`);
              section.style.cssText = "display: block !important; visibility: visible !important; opacity: 1 !important; position: relative !important; z-index: 10 !important;";
            }
            
            // Scroll vers la section
            setTimeout(() => {
              section.scrollIntoView({ behavior: "smooth", block: "start" });
            }, 50);
            
            // Charger les données si nécessaire
            handleSectionLoad(sectionId);
          }, 10);
        } else {
          console.error(`[Carte ${index}] ❌ Section non trouvée: ${sectionId}`);
          // Lister toutes les sections disponibles pour debug
          const allSections = document.querySelectorAll(".detail-section");
          console.log("Sections disponibles:", Array.from(allSections).map(s => s.id));
          alert(`Section "${sectionId}" non trouvée. Vérifiez la console pour plus de détails.`);
        }
      } else if (href && (href.startsWith("http") || href.startsWith("/") || href.includes(".html"))) {
        // Lien externe, laisser le navigateur gérer
        console.log(`[Carte ${index}] Lien externe: ${href}`);
      } else {
        console.warn(`[Carte ${index}] Href non reconnu: ${href}`);
      }
      
      return false;
    };
    
    // Attacher l'événement de plusieurs façons pour être sûr
    newCard.onclick = handleCardClick;
    newCard.addEventListener("click", handleCardClick, true); // Capture phase
    newCard.addEventListener("click", handleCardClick, false); // Bubble phase
    
    // Marquer comme initialisée
    newCard.setAttribute("data-initialized", "true");
    
    // Ajouter aussi un style pour indiquer que c'est cliquable
    newCard.style.cursor = "pointer";
    newCard.style.userSelect = "none";
    newCard.style.textDecoration = "none";
    newCard.style.color = "inherit";
    
    // Empêcher la navigation par défaut
    newCard.setAttribute("role", "button");
    newCard.setAttribute("tabindex", "0");
    
    // Support clavier
    newCard.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        handleCardClick(e);
      }
    });
  });
  
  console.log("✅ Cartes d'outils initialisées avec succès");
}

// Fonction pour gérer le chargement des données selon la section
function handleSectionLoad(sectionId) {
  switch(sectionId) {
    case "add-patiente-section":
      console.log("Section: Ajouter une patiente");
      const openFormBtn = document.querySelector("#open-form-btn");
      if (openFormBtn) {
        openFormBtn.onclick = function() {
          if (window.openAddPatienteModal) {
            window.openAddPatienteModal();
          } else {
            console.error("openAddPatienteModal n'est pas disponible");
            alert("Le formulaire d'ajout de patiente sera disponible bientôt.");
          }
        };
      }
      break;
      
    case "patientes-list-section":
      console.log("Section: Liste des patientes");
      const addPatienteBtnSection = document.querySelector("#add-patiente-btn-section");
      if (addPatienteBtnSection) {
        addPatienteBtnSection.onclick = function() {
          if (window.openAddPatienteModal) {
            window.openAddPatienteModal();
          }
        };
      }
      loadDashboardData();
      break;
      
    case "alerts-section":
      console.log("Section: Alertes");
      // Charger les données si pas déjà chargées
      if (patientesCache.length === 0) {
        loadDashboardData();
      } else {
        // Afficher immédiatement les alertes si les données sont déjà en cache
        if (dossiersMapCache) {
          renderAlerts(patientesCache, risksMapCache, dossiersMapCache);
        } else {
          loadDashboardData();
        }
      }
      break;
      
    case "stats-section":
      console.log("Section: Statistiques");
      // Charger les données si pas déjà chargées
      if (!statsCache) {
        loadDashboardData();
      } else {
        // Afficher immédiatement les stats si déjà en cache
        renderStats(statsCache, null, patientesCache, risksMapCache);
      }
      break;
      
    case "performance-section":
      console.log("Section: Performance");
      // Charger les données si pas déjà chargées
      if (patientesCache.length === 0) {
        loadDashboardData();
      } else {
        // Afficher immédiatement les stats de performance si déjà en cache
        renderPerformance(patientesCache, risksMapCache);
      }
      break;
      
    case "prediction-section":
      console.log("Section: Prédictions");
      loadDashboardData().then(() => {
        const predictionResults = document.querySelector("#prediction-results");
        if (predictionResults) {
          predictionResults.innerHTML = `
            <div class="info-message">
              <p>Sélectionnez une patiente dans la liste "Mes patientes" pour voir ses prédictions de risque.</p>
            </div>
          `;
        }
      }).catch(err => {
        console.error("Erreur lors du chargement des prédictions:", err);
      });
      break;
      
    case "map-section":
      console.log("Section: Géovisualisation");
      // Charger les données si pas déjà chargées
      if (patientesCache.length === 0) {
        loadDashboardData();
      } else {
        // Afficher immédiatement les clusters si les données sont déjà en cache
        renderMapClusters(patientesCache, risksMapCache);
      }
      break;
      
    default:
      console.log(`Section non gérée: ${sectionId}`);
  }
}

function closeDetailSection(sectionId) {
  const section = document.getElementById(sectionId);
  if (section) {
    section.classList.add("hidden");
    section.style.display = "none"; // Forcer le masquage
  }
}

// Fonction pour afficher les prédictions
function displayPrediction(patiente, risk) {
  const predictionResults = document.querySelector("#prediction-results");
  if (!predictionResults) return;
  
  if (risk && risk.available) {
    const riskLevel = risk.risk_level;
    const riskPercentage = Math.round(risk.risk_score * 100);
    const riskEmoji = riskLevel === "élevé" ? "🔴" : riskLevel === "moyen" ? "🟠" : "🟢";
    const riskClass = riskLevel === "élevé" ? "risk-high" : riskLevel === "moyen" ? "risk-medium" : "risk-low";
    
    predictionResults.innerHTML = `
      <div class="prediction-card ${riskClass}">
        <div class="prediction-header">
          <h3>${patiente.prenom || ""} ${patiente.nom || ""}</h3>
          <span class="prediction-badge-large">${riskEmoji} ${riskLevel.toUpperCase()} (${riskPercentage}%)</span>
        </div>
        <div class="prediction-details">
          <p><strong>Score de risque :</strong> ${riskPercentage}%</p>
          <p><strong>Niveau de confiance :</strong> ${Math.round(risk.confidence * 100)}%</p>
          ${risk.recommendations && risk.recommendations.length > 0 ? `
            <div class="prediction-recommendations">
              <h4>Recommandations :</h4>
              <ul>
                ${risk.recommendations.map(rec => `<li>${rec}</li>`).join("")}
              </ul>
            </div>
          ` : ""}
        </div>
      </div>
    `;
  } else {
    predictionResults.innerHTML = `
      <div class="info-message">
        <p>Les prédictions de risque ne sont pas encore disponibles pour cette patiente.</p>
        <p>Assurez-vous que toutes les informations médicales sont complètes.</p>
      </div>
    `;
  }
}

// Exposer les fonctions globalement
window.closeDetailSection = closeDetailSection;
window.openAddPatienteModal = openAddPatienteModal;
window.displayPrediction = displayPrediction;
window.setupToolCards = setupToolCards;
window.handleSectionLoad = handleSectionLoad;
window.loadDashboardData = loadDashboardData;
window.renderAlerts = renderAlerts;
window.renderStats = renderStats;
window.renderPerformance = renderPerformance;
window.renderMapClusters = renderMapClusters;
window.renderPatientes = renderPatientes;

async function bootstrap() {
  try {
    // Vérifier si le profil professionnel existe
    if (!hasProfessionalProfile()) {
      showProfessionalProfileForm();
      return;
    }
    
    // Mode sans authentification - accès direct
    // if (!authToken) {
    //   window.location.href = "index.html";
    //   return;
    // }
    // await fetchCurrentUser();
    
    // Simuler un utilisateur pour le mode développement
    if (userInfo) {
      userInfo.classList.remove("hidden");
      if (userName) {
        const profile = loadProfessionalProfile();
        if (profile) {
          userName.textContent = `${profile.prenom} ${profile.nom}`;
        } else {
          userName.textContent = "Mode Développement";
        }
      }
    }
    
    await loadDashboardData();
  } catch (error) {
    console.error("Erreur lors du chargement:", error);
    // Ne pas rediriger en cas d'erreur
  }
}

function handleFilterChange() {
  if (patientesCache.length > 0) {
    const filterRiskValue = riskFilter ? riskFilter.value : "all";
    const filterLocationValue = locationFilter ? locationFilter.value : "all";
    const filterWeekValue = weekFilter ? weekFilter.value : "all";
    const filterCpnStatusValue = cpnStatusFilter ? cpnStatusFilter.value : "all";
    const filterAgeValue = ageFilter ? ageFilter.value : "all";
    const filterDistanceValue = distanceFilter ? distanceFilter.value : "all";
    const filterLastVisitValue = lastVisitFilter ? lastVisitFilter.value : "all";
    
    // Utiliser les dossiers en cache si disponibles
    const dossiersMap = dossiersMapCache || {};
    
    // Recalculer les statistiques et afficher les patientes filtrées
    const riskStats = renderPatientes(patientesCache, risksMapCache, filterRiskValue, filterLocationValue, filterWeekValue, filterCpnStatusValue, filterAgeValue, filterDistanceValue, filterLastVisitValue, dossiersMap);
    // Mettre à jour les statistiques affichées avec les stats en cache
    if (statsCache) {
      renderStats(statsCache, riskStats, patientesCache, risksMapCache);
    }
  }
}

// Fonction pour réinitialiser tous les filtres
function resetAllFilters() {
  if (riskFilter) riskFilter.value = "all";
  if (locationFilter) locationFilter.value = "all";
  if (weekFilter) weekFilter.value = "all";
  if (cpnStatusFilter) cpnStatusFilter.value = "all";
  if (ageFilter) ageFilter.value = "all";
  if (distanceFilter) distanceFilter.value = "all";
  if (lastVisitFilter) lastVisitFilter.value = "all";
  
  // Déclencher le changement de filtre pour mettre à jour la liste
  handleFilterChange();
  
  console.log("🔄 Tous les filtres ont été réinitialisés");
}

// Exposer la fonction globalement
window.resetAllFilters = resetAllFilters;
window.handleFilterChange = handleFilterChange;

function openAddPatienteModal() {
  if (addPatienteModal) {
    addPatienteModal.classList.remove("hidden");
  }
}

function closeAddPatienteModal() {
  if (addPatienteModal) {
    addPatienteModal.classList.add("hidden");
    if (addPatienteForm) {
      addPatienteForm.reset();
    }
    if (patienteMessage) {
      patienteMessage.textContent = "";
      patienteMessage.className = "message";
    }
  }
}

async function handleAddPatienteSubmit(event) {
  event.preventDefault();
  
  if (!patienteMessage) return;
  
  // Récupérer les valeurs du formulaire
  const formData = {
    telephone: document.querySelector("#patiente-telephone").value.trim(),
    password: document.querySelector("#patiente-password").value,
    nom: document.querySelector("#patiente-nom").value.trim() || null,
    prenom: document.querySelector("#patiente-prenom").value.trim() || null,
    age: parseInt(document.querySelector("#patiente-age").value),
    gestite: parseInt(document.querySelector("#patiente-gestite").value) || 1,
    parite: parseInt(document.querySelector("#patiente-parite").value) || 0,
    niveau_instruction: document.querySelector("#patiente-niveau-instruction").value || null,
    langue_preferee: document.querySelector("#patiente-langue").value || "fr",
    distance_centre: document.querySelector("#patiente-distance").value ? parseFloat(document.querySelector("#patiente-distance").value) : null,
    moyen_transport: document.querySelector("#patiente-transport").value || null,
    adresse: document.querySelector("#patiente-adresse").value.trim() || null,
    ville: document.querySelector("#patiente-ville").value.trim() || null,
    antecedents_medicaux: document.querySelector("#patiente-antecedents-medicaux").value.trim() || null,
    antecedents_obstetricaux: document.querySelector("#patiente-antecedents-obstetricaux").value.trim() || null,
    allergies: document.querySelector("#patiente-allergies").value.trim() || null,
    telephone_urgence: document.querySelector("#patiente-contact-telephone").value.trim() || null,
    nom_contact_urgence: document.querySelector("#patiente-contact-nom").value.trim() || null,
    date_dernieres_regles: document.querySelector("#patiente-dernieres-regles").value || null,
    date_accouchement_prevue: document.querySelector("#patiente-accouchement-prevue").value || null,
  };
  
  // Validation
  if (!formData.telephone || !formData.password || !formData.age) {
    patienteMessage.textContent = "Veuillez remplir tous les champs obligatoires (téléphone, mot de passe, âge)";
    patienteMessage.className = "message error";
    return;
  }
  
  if (formData.password.length < 6) {
    patienteMessage.textContent = "Le mot de passe doit contenir au moins 6 caractères";
    patienteMessage.className = "message error";
      return;
    }
  
  try {
    if (isEditMode) {
      patienteMessage.textContent = "Modification en cours...";
    } else {
      patienteMessage.textContent = "Création en cours...";
    }
    patienteMessage.className = "message";
    
    let newPatiente;
    if (isEditMode) {
      // Mode édition : mettre à jour la patiente
      newPatiente = await fetchJSON(`/patientes/${isEditMode}`, {
        method: "PUT",
        body: JSON.stringify(formData),
      });
    } else {
      // Mode création : créer une nouvelle patiente
      newPatiente = await fetchJSON("/patientes/", {
        method: "POST",
        body: JSON.stringify(formData),
      });
    }
    
    console.log("✅ Patiente créée:", newPatiente);
    
    // Afficher un message de succès détaillé
    const patienteName = `${newPatiente.prenom || ""} ${newPatiente.nom || ""}`.trim() || newPatiente.user?.telephone || "Nouvelle patiente";
    const successTitle = isEditMode ? "Patiente modifiée avec succès !" : "Patiente créée avec succès !";
    patienteMessage.innerHTML = `
      <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem;">
        <span style="font-size: 1.5rem;">✅</span>
        <strong style="font-size: 1.1rem;">${successTitle}</strong>
      </div>
      <div style="padding: 1rem; background: #f0f9ff; border-radius: 0.5rem; margin-top: 0.5rem;">
        <p style="margin: 0 0 0.5rem 0;"><strong>Nom:</strong> ${patienteName}</p>
        <p style="margin: 0 0 0.5rem 0;"><strong>Téléphone:</strong> ${newPatiente.user?.telephone || formData.telephone}</p>
        ${newPatiente.age ? `<p style="margin: 0 0 0.5rem 0;"><strong>Âge:</strong> ${newPatiente.age} ans</p>` : ''}
        ${newPatiente.ville ? `<p style="margin: 0;"><strong>Ville:</strong> ${newPatiente.ville}</p>` : ''}
      </div>
    `;
    patienteMessage.className = "message success";
    
    // Réinitialiser le mode édition
    if (isEditMode) {
      delete form.dataset.editPatienteId;
      const telephoneInput = document.querySelector("#patiente-telephone");
      if (telephoneInput) {
        telephoneInput.disabled = false;
        telephoneInput.style.opacity = "1";
      }
      const modalTitle = document.querySelector("#add-patiente-modal h2");
      if (modalTitle) {
        modalTitle.textContent = "Ajouter une nouvelle patiente";
      }
    }
    
    // Émettre un événement pour afficher la section de succès sur la page enregistrer-patiente.html
    window.dispatchEvent(new CustomEvent("patiente-created", {
      detail: { patiente: newPatiente }
    }));
    
    // Réinitialiser le formulaire
    if (addPatienteForm) {
      addPatienteForm.reset();
      // Réactiver le champ téléphone si désactivé
      const telephoneInput = document.querySelector("#patiente-telephone");
      if (telephoneInput && telephoneInput.disabled) {
        telephoneInput.disabled = false;
        telephoneInput.style.opacity = "1";
      }
    }
    
    // Vérifier si on est sur la page mes-patientes.html
    const tableBody = document.querySelector("#patient-table tbody");
    const isOnMesPatientesPage = tableBody !== null || window.location.pathname.includes('mes-patientes.html') || window.location.href.includes('mes-patientes.html');
    
    console.log("🔄 Mise à jour de la liste des patientes après ajout...", { isOnMesPatientesPage, tableBody: !!tableBody, newPatienteId: newPatiente.id });
    
    // Sauvegarder les informations de la nouvelle patiente pour la vérification
    const newPatienteInfo = {
      id: newPatiente.id,
      prenom: newPatiente.prenom,
      nom: newPatiente.nom,
      telephone: newPatiente.user?.telephone || formData.telephone
    };
    
    // Fonction pour forcer la mise à jour de la liste avec retry
    async function forceUpdateList(retryCount = 0) {
      const maxRetries = 2;
      try {
        console.log(`📡 Début du rechargement des données... (tentative ${retryCount + 1}/${maxRetries + 1})`);
        
        // Vider le cache pour forcer le rechargement
        patientesCache = [];
        risksMapCache = {};
        dossiersMapCache = {};
        statsCache = null;
        
        // Attendre un peu pour laisser l'API traiter la nouvelle patiente
        if (retryCount === 0) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }
        
        // Forcer un rechargement direct des patientes avec cache-busting
        console.log("📡 Rechargement direct des patientes avec cache-busting...");
        const timestamp = Date.now();
        const [patientesResponse, risksResponse] = await Promise.allSettled([
          fetchJSON(`/dashboard/patientes?_t=${timestamp}`),
          fetchJSON(`/prediction/patientes/risks?_t=${timestamp}`).catch(() => ({ patientes: [] }))
        ]);
        
        const patientesData = patientesResponse.status === "fulfilled" ? patientesResponse.value : [];
        const risksData = risksResponse.status === "fulfilled" ? risksResponse.value : { patientes: [] };
        
        console.log(`✅ ${patientesData.length} patientes récupérées`);
        
        // Créer une map des risques
        const risksMap = {};
        if (risksData && risksData.patientes) {
          risksData.patientes.forEach((item) => {
            risksMap[item.patiente_id] = item.prediction;
          });
        }
        
        // Charger les dossiers pour la dernière venue (limité aux 10 premières pour la rapidité)
        const dossiersMap = {};
        const patientesToLoad = patientesData.slice(0, 20); // Limiter à 20 pour la rapidité
        await Promise.all(
          patientesToLoad.map(async (patiente) => {
            try {
              const dossier = await fetchJSON(`/patientes/${patiente.id}/dossier?_t=${timestamp}`);
              dossiersMap[patiente.id] = dossier;
            } catch (err) {
              console.warn(`Impossible de charger le dossier de la patiente ${patiente.id}:`, err);
            }
          })
        );
        
        // Mettre à jour le cache
        patientesCache = patientesData;
        risksMapCache = risksMap;
        dossiersMapCache = dossiersMap;
        
        // Récupérer les valeurs des filtres actuels
        const riskFilterEl = document.querySelector("#risk-filter");
        const locationFilterEl = document.querySelector("#location-filter");
        const weekFilterEl = document.querySelector("#week-filter");
        const cpnStatusFilterEl = document.querySelector("#cpn-status-filter");
        
        const filterRisk = riskFilterEl ? riskFilterEl.value : "all";
        const filterLocation = locationFilterEl ? locationFilterEl.value : "all";
        const filterWeek = weekFilterEl ? weekFilterEl.value : "all";
        const filterCpnStatus = cpnStatusFilterEl ? cpnStatusFilterEl.value : "all";
        const ageFilterEl = document.querySelector("#age-filter");
        const distanceFilterEl = document.querySelector("#distance-filter");
        const lastVisitFilterEl = document.querySelector("#last-visit-filter");
        const filterAge = ageFilterEl ? ageFilterEl.value : "all";
        const filterDistance = distanceFilterEl ? distanceFilterEl.value : "all";
        const filterLastVisit = lastVisitFilterEl ? lastVisitFilterEl.value : "all";
        
        // Mettre à jour le filtre de localité
        if (locationFilterEl) {
          const currentLocationValue = locationFilterEl.value;
          const villes = [...new Set(patientesData.map(p => p.ville).filter(Boolean))].sort();
          locationFilterEl.innerHTML = '<option value="all">Toutes</option>' + 
            villes.map(v => `<option value="${v}">${v}</option>`).join("");
          if (currentLocationValue && villes.includes(currentLocationValue)) {
            locationFilterEl.value = currentLocationValue;
          }
        }
        
        // Vérifier que le tableau existe et le mettre à jour directement
        const updatedTableBody = document.querySelector("#patient-table tbody");
        if (updatedTableBody) {
          console.log("✅ Mise à jour directe du tableau...");
          
          // Utiliser renderPatientes directement
          try {
            // S'assurer que la nouvelle patiente est bien dans les données
            const newPatienteInData = patientesData.find(p => 
              p.id === newPatienteInfo.id ||
              (p.prenom === newPatienteInfo.prenom && p.nom === newPatienteInfo.nom && p.user?.telephone === newPatienteInfo.telephone)
            );
            
            if (!newPatienteInData && retryCount < maxRetries) {
              console.log(`⚠️ Nouvelle patiente non trouvée dans les données, nouvelle tentative dans 1 seconde...`);
              setTimeout(() => {
                forceUpdateList(retryCount + 1);
              }, 1000);
              return;
            }
            
            if (newPatienteInData) {
              console.log(`✅ Nouvelle patiente trouvée dans les données: ${newPatienteInData.prenom} ${newPatienteInData.nom} (ID: ${newPatienteInData.id})`);
            }
            
            // Rendre le tableau avec les données
            renderPatientes(patientesData, risksMap, filterRisk, filterLocation, filterWeek, filterCpnStatus, filterAge, filterDistance, filterLastVisit, dossiersMap);
            console.log("✅ Tableau mis à jour avec succès");
            
            // Attendre un peu pour que le DOM soit mis à jour
            await new Promise(resolve => setTimeout(resolve, 200));
            
            const rowCount = updatedTableBody.querySelectorAll("tr").length;
            console.log(`✅ Tableau contient ${rowCount} lignes`);
            
            // Vérifier que la nouvelle patiente est visible dans le tableau
            const newPatienteRow = Array.from(updatedTableBody.querySelectorAll("tr")).find(row => {
              const cells = row.querySelectorAll("td");
              if (cells.length > 0) {
                const nameCell = cells[0].textContent.trim();
                const hasPrenom = newPatienteInfo.prenom && nameCell.includes(newPatienteInfo.prenom);
                const hasNom = newPatienteInfo.nom && nameCell.includes(newPatienteInfo.nom);
                return hasPrenom || hasNom || (newPatienteInData && nameCell.includes(`${newPatienteInData.prenom || ''} ${newPatienteInData.nom || ''}`.trim()));
              }
              return false;
            });
            
            if (newPatienteRow) {
              console.log("✅ Nouvelle patiente trouvée dans le tableau et mise en évidence");
              // Mettre en évidence la nouvelle ligne
              newPatienteRow.style.backgroundColor = "#f0fdf4";
              newPatienteRow.style.borderLeft = "4px solid #10b981";
              setTimeout(() => {
                newPatienteRow.style.transition = "background-color 0.5s ease, border-left 0.5s ease";
                newPatienteRow.style.backgroundColor = "";
                newPatienteRow.style.borderLeft = "";
              }, 3000);
            } else {
              console.warn("⚠️ Nouvelle patiente non visible dans le tableau (peut-être filtrée)");
            }
            
            // Afficher un message de confirmation
            const existingMsg = document.querySelector(".patiente-added-msg");
            if (existingMsg) existingMsg.remove();
            
            const successMsg = document.createElement("div");
            successMsg.className = "patiente-added-msg";
            successMsg.style.cssText = "position: fixed; top: 80px; right: 20px; background: #10b981; color: white; padding: 1rem 1.5rem; border-radius: 0.5rem; box-shadow: 0 4px 12px rgba(0,0,0,0.15); z-index: 10000; display: flex; align-items: center; gap: 0.5rem;";
            successMsg.innerHTML = `
              <span style="font-size: 1.5rem;">✅</span>
              <div>
                <strong>Patiente ajoutée !</strong>
                <div style="font-size: 0.875rem; opacity: 0.9;">La liste a été mise à jour (${rowCount} patiente${rowCount > 1 ? 's' : ''})</div>
              </div>
            `;
            document.body.appendChild(successMsg);
            
            // Scroll vers le haut du tableau
            const tableContainer = document.querySelector(".table-container");
            if (tableContainer) {
              setTimeout(() => {
                tableContainer.scrollIntoView({ behavior: "smooth", block: "start" });
              }, 100);
            }
            
            // Retirer le message après 3 secondes
            setTimeout(() => {
              successMsg.style.transition = "opacity 0.3s ease";
              successMsg.style.opacity = "0";
              setTimeout(() => successMsg.remove(), 300);
            }, 3000);
          } catch (renderError) {
            console.error("❌ Erreur lors du rendu du tableau:", renderError);
            if (retryCount < maxRetries) {
              setTimeout(() => {
                forceUpdateList(retryCount + 1);
              }, 1000);
              return;
            }
            // En cas d'erreur de rendu, recharger la page
            if (isOnMesPatientesPage) {
              window.location.reload();
            }
          }
        } else {
          console.warn("⚠️ Tableau non trouvé sur la page");
          if (retryCount < maxRetries) {
            setTimeout(() => {
              forceUpdateList(retryCount + 1);
            }, 1000);
            return;
          }
          // Dernier recours: recharger la page
          if (isOnMesPatientesPage) {
            console.log("🔄 Rechargement de la page...");
            window.location.reload();
          }
        }
      } catch (error) {
        console.error("❌ Erreur lors de la mise à jour de la liste:", error);
        // En cas d'erreur, réessayer ou recharger la page
        if (retryCount < maxRetries) {
          console.log(`🔄 Nouvelle tentative dans 1 seconde...`);
          setTimeout(() => {
            forceUpdateList(retryCount + 1);
          }, 1000);
        } else if (isOnMesPatientesPage) {
          console.log("🔄 Rechargement de la page pour récupérer les dernières données...");
          setTimeout(() => {
            window.location.reload();
          }, 1000);
        }
      }
    }
    
    // Fermer le modal après un court délai pour laisser le temps de voir le message de succès
    setTimeout(() => {
      closeAddPatienteModal();
      
      // Lancer la mise à jour immédiatement après la fermeture du modal
      setTimeout(() => {
        forceUpdateList();
      }, 300);
    }, 1000);
  } catch (error) {
    console.error("Erreur lors de la création de la patiente:", error);
    let errorMessage = "Erreur lors de la création de la patiente";
    try {
      const errorData = JSON.parse(error.message);
      errorMessage = errorData.detail || errorMessage;
    } catch {
      errorMessage = error.message || errorMessage;
    }
    patienteMessage.textContent = errorMessage;
    patienteMessage.className = "message error";
  }
}

logoutButton.addEventListener("click", handleLogout);
consultationForm.addEventListener("submit", handleConsultationSubmit);
reminderForm.addEventListener("submit", handleReminderSubmit);
if (riskFilter) {
  riskFilter.addEventListener("change", handleFilterChange);
}
if (locationFilter) {
  locationFilter.addEventListener("change", handleFilterChange);
}
if (weekFilter) {
  weekFilter.addEventListener("change", handleFilterChange);
}
if (cpnStatusFilter) {
  cpnStatusFilter.addEventListener("change", handleFilterChange);
}
if (ageFilter) {
  ageFilter.addEventListener("change", handleFilterChange);
}
if (distanceFilter) {
  distanceFilter.addEventListener("change", handleFilterChange);
}
if (lastVisitFilter) {
  lastVisitFilter.addEventListener("change", handleFilterChange);
}
if (resetFiltersBtn) {
  resetFiltersBtn.addEventListener("click", resetAllFilters);
}
if (exportBtn) {
  exportBtn.addEventListener("click", () => exportReport("excel"));
}
if (addPatienteBtn) {
  addPatienteBtn.addEventListener("click", openAddPatienteModal);
}
// Ajouter aussi pour le bouton dans la section patientes-list
const addPatienteBtnSection = document.querySelector("#add-patiente-btn-section");
if (addPatienteBtnSection) {
  addPatienteBtnSection.addEventListener("click", openAddPatienteModal);
}
if (closeModalBtn) {
  closeModalBtn.addEventListener("click", closeAddPatienteModal);
}
if (cancelPatienteBtn) {
  cancelPatienteBtn.addEventListener("click", closeAddPatienteModal);
}
if (addPatienteForm) {
  addPatienteForm.addEventListener("submit", handleAddPatienteSubmit);
}
if (professionalProfileForm) {
  professionalProfileForm.addEventListener("submit", handleProfessionalProfileSubmit);
}
// Fermer le modal en cliquant en dehors
if (addPatienteModal) {
  addPatienteModal.addEventListener("click", (e) => {
    if (e.target === addPatienteModal) {
      closeAddPatienteModal();
    }
  });
}

// Initialiser les cartes d'outils
function initToolCards() {
  // Attendre que le DOM soit complètement chargé
  if (document.readyState === 'loading') {
    document.addEventListener("DOMContentLoaded", () => {
      setTimeout(setupToolCards, 200);
    });
  } else {
    // DOM déjà chargé, mais attendre un peu pour être sûr
    setTimeout(setupToolCards, 200);
  }
}

// Appeler bootstrap et initToolCards
// Attendre que le DOM soit complètement chargé
if (document.readyState === 'loading') {
  document.addEventListener("DOMContentLoaded", () => {
    console.log("DOM chargé, initialisation...");
    bootstrap().then(() => {
      initToolCards();
    }).catch(err => {
      console.error("Erreur lors du bootstrap:", err);
      initToolCards(); // Initialiser quand même les cartes
    });
  });
} else {
  console.log("DOM déjà chargé, initialisation immédiate...");
  bootstrap().then(() => {
    initToolCards();
  }).catch(err => {
    console.error("Erreur lors du bootstrap:", err);
    initToolCards(); // Initialiser quand même les cartes
  });
}

// Réessayer après un délai supplémentaire au cas où
setTimeout(() => {
  const toolCards = document.querySelectorAll(".tool-card");
  console.log(`Vérification: ${toolCards.length} cartes trouvées`);
  if (toolCards.length > 0) {
    const firstCard = toolCards[0];
    const hasOnclick = firstCard.onclick !== null;
    const hasListeners = firstCard.getAttribute("data-initialized") === "true";
    console.log("Première carte:", {
      hasOnclick,
      hasListeners,
      href: firstCard.getAttribute("href")
    });
    if (!hasOnclick && !hasListeners) {
      console.warn("Les cartes ne sont pas initialisées, nouvelle tentative...");
      setupToolCards();
    }
  } else {
    console.error("Aucune carte trouvée après 1 seconde !");
  }
}, 1000);

