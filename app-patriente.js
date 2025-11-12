const API_BASE = "http://localhost:8000/api";

let authToken = localStorage.getItem("mama_token") || "";
let currentUser = null;
let patienteData = null;

const userInfo = document.querySelector("#user-info");
const userName = document.querySelector("#user-name");
const logoutButton = document.querySelector("#logout-button");
const profileName = document.querySelector("#profile-name");
const profileAge = document.querySelector("#profile-age");
const profileDossier = document.querySelector("#profile-dossier");
const profileWeek = document.querySelector("#profile-week");
const profileDistance = document.querySelector("#profile-distance");
const profileTransport = document.querySelector("#profile-transport");
const distanceSeparator = document.querySelector("#distance-separator");
const transportSeparator = document.querySelector("#transport-separator");
const nextAppointmentContent = document.querySelector("#next-appointment-content");
const notificationsContent = document.querySelector("#notifications-content");
const cpnContent = document.querySelector("#cpn-content");
const dossierContent = document.querySelector("#dossier-content");
const remindersContent = document.querySelector("#reminders-content");
const symptomBtn = document.querySelector("#symptom-btn");
const cancelAppointmentBtn = document.querySelector("#cancel-appointment-btn");
const registrationFormCard = document.querySelector("#registration-form-card");
const registrationForm = document.querySelector("#patiente-registration-form");
const registrationMessage = document.querySelector("#registration-message");
const dashboardSections = document.querySelectorAll("section.card:not(#registration-form-card)");

const defaultHeaders = () => {
  const headers = { "Content-Type": "application/json" };
  if (authToken) {
    headers["Authorization"] = `Bearer ${authToken}`;
  }
  return headers;
};

async function fetchJSON(path, options = {}) {
  // Mode démonstration : utiliser des données mockées si le serveur n'est pas accessible
  const USE_MOCK = window.USE_MOCK_DATA !== false; // Par défaut activé
  
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
    // Si erreur réseau et mode mock activé, utiliser les données de démonstration
    if (USE_MOCK && (error instanceof TypeError || error.message.includes("fetch") || error.message.includes("HTTP"))) {
      console.log(`[Mode démonstration] Utilisation de données mockées pour ${path}`);
      return await getMockData(path, options);
    }
    
    // Sinon, propager l'erreur
    console.error(`Erreur API ${path}:`, error);
    throw error;
  }
}

// Fonction pour obtenir des données mockées
async function getMockData(path, options = {}) {
  // Simuler un délai réseau
  await new Promise(resolve => setTimeout(resolve, 300));
  
  // Données de démonstration
  const mockPatiente = {
    id: 1,
    prenom: "Awa",
    nom: "Koffi",
    age: 28,
    ville: "Bamako",
    adresse: "Quartier Hamdallaye",
    distance_centre: 2.3,
    moyen_transport: "moto",
    date_dernieres_regles: "2024-01-15",
    date_accouchement_prevue: "2024-10-22"
  };
  
  const mockRisk = {
    available: true,
    risk_score: 0.68,
    risk_level: "moyen",
    confidence: 0.85,
    recommendations: [
      "Hydratez-vous davantage et reposez-vous.",
      "Si vous ressentez des maux de tête fréquents, consultez sans attendre.",
      "Le centre le plus proche est à 2,3 km."
    ]
  };
  
  const mockCpn = [
    {
      id: 1,
      numero_cpn: 1,
      date_rdv: "2024-02-15T09:00:00",
      statut: "complete",
      notes: "Consultation normale, tout va bien."
    },
    {
      id: 2,
      numero_cpn: 2,
      date_rdv: "2024-03-15T09:00:00",
      statut: "complete",
      notes: "Poids normal, tension stable."
    },
    {
      id: 3,
      numero_cpn: 3,
      date_rdv: "2024-04-20T10:00:00",
      statut: "planifie",
      notes: "Prochaine consultation prévue."
    }
  ];
  
  const mockDossier = {
    patiente: {
      ...mockPatiente,
      user: { telephone: "+22370000001" }
    },
    consultations: [
      {
        id: 1,
        date_consultation: "2024-02-15T09:00:00",
        poids: 65.5,
        tension_arterielle_systolique: 120,
        tension_arterielle_diastolique: 80,
        notes: "Consultation normale"
      }
    ],
    vaccinations: [
      {
        id: 1,
        type_vaccin: "Tétanos",
        date_vaccination: "2024-02-15",
        site_injection: "Bras gauche"
      }
    ],
    cpn: mockCpn,
    prediction_risk: mockRisk
  };
  
  // Router selon le chemin
  if (path === "/patientes/" || path.startsWith("/dashboard/patientes")) {
    return [mockPatiente];
  }
  
  if (path.startsWith("/patientes/") && path.endsWith("/dossier")) {
    return mockDossier;
  }
  
  if (path.startsWith("/patientes/") && path.includes("/risk")) {
    return mockRisk;
  }
  
  if (path.startsWith("/cpn")) {
    return mockCpn;
  }
  
  return null;
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
  // // Vérifier que c'est une patiente
  // if (currentUser.role !== "patiente") {
  //   handleLogout();
  //   throw new Error("Accès réservé aux patientes");
  // }
  // userName.textContent = `${currentUser.prenom || ""} ${currentUser.nom || ""}`.trim() || currentUser.telephone;
  // userInfo.classList.remove("hidden");
  
  // Mode développement - section masquée
  // if (userInfo) {
  //   userInfo.classList.remove("hidden");
  //   if (userName) {
  //     userName.textContent = "Mode Développement";
  //   }
  // }
  
  // Récupérer les données de la patiente via l'endpoint spécifique
  // try {
  //   patienteData = await fetchJSON("/auth/me/patiente");
  // } catch (error) {
  //   console.warn("Impossible de récupérer le profil patiente:", error);
  // }
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

function renderProfile(patiente) {
  if (!patiente) return;
  
  const nom = `${patiente.prenom || ""} ${patiente.nom || ""}`.trim() || "Patiente";
  const age = patiente.age ? `${patiente.age} ans` : "";
  const dossier = patiente.id ? `Dossier #${patiente.id}` : "";
  
  const semaine = calculatePregnancyWeek(
    patiente.date_dernieres_regles,
    patiente.date_accouchement_prevue
  );
  const semaineText = semaine !== null ? `Semaine ${semaine} de grossesse` : "Semaine non calculée";
  
  if (profileName) profileName.textContent = nom;
  if (profileAge) profileAge.textContent = age;
  if (profileDossier) profileDossier.textContent = dossier;
  if (profileWeek) profileWeek.textContent = semaineText;
  
  // Afficher la distance si disponible
  if (patiente.distance_centre && profileDistance && distanceSeparator) {
    profileDistance.textContent = `Distance: ${patiente.distance_centre.toFixed(1)} km`;
    profileDistance.style.display = "inline";
    distanceSeparator.style.display = "inline";
  } else if (profileDistance && distanceSeparator) {
    profileDistance.style.display = "none";
    distanceSeparator.style.display = "none";
  }
  
  // Afficher le moyen de transport si disponible
  if (patiente.moyen_transport && profileTransport && transportSeparator) {
    const transportText = {
      "pieds": "À pied",
      "velo": "À vélo",
      "moto": "En moto",
      "voiture": "En voiture",
      "transport_public": "Transport public"
    }[patiente.moyen_transport] || patiente.moyen_transport;
    
    profileTransport.textContent = `Moyen: ${transportText}`;
    profileTransport.style.display = "inline";
    transportSeparator.style.display = "inline";
  } else if (profileTransport && transportSeparator) {
    profileTransport.style.display = "none";
    transportSeparator.style.display = "none";
  }
}

function renderCPN(cpnList) {
  if (!cpnList || cpnList.length === 0) {
    cpnContent.innerHTML = `
      <div class="empty-state">
        <span class="empty-icon">📅</span>
        <p>Aucun rendez-vous CPN programmé pour le moment.</p>
        <small>Vos prochains rendez-vous apparaîtront ici.</small>
      </div>
    `;
    return;
  }

  const cpnHTML = cpnList
    .map((cpn) => {
      const date = new Date(cpn.date_rdv);
      const statutClass = cpn.statut === "complete" ? "statut-complete" : 
                         cpn.statut === "confirme" ? "statut-confirme" : 
                         cpn.statut === "manque" ? "statut-manque" : "statut-planifie";
      const isUpcoming = new Date(cpn.date_rdv) > new Date();
      const isToday = date.toDateString() === new Date().toDateString();
      
      return `
        <div class="cpn-item-enhanced ${statutClass} ${isUpcoming ? 'upcoming' : ''} ${isToday ? 'today' : ''}">
          <div class="cpn-item-header">
            <div class="cpn-number-badge">CPN ${cpn.numero_cpn}</div>
            <span class="cpn-statut-badge ${statutClass}">${cpn.statut}</span>
          </div>
          <div class="cpn-date-info">
            <span class="cpn-date-icon">📅</span>
            <div>
              <p class="cpn-date-main">${date.toLocaleDateString("fr-FR", { 
            weekday: "long", 
            year: "numeric", 
            month: "long", 
                day: "numeric"
              })}</p>
              <p class="cpn-date-time">${date.toLocaleTimeString("fr-FR", {
            hour: "2-digit",
            minute: "2-digit"
          })}</p>
            </div>
          </div>
          ${cpn.notes ? `<div class="cpn-notes"><p>${cpn.notes}</p></div>` : ""}
        </div>
      `;
    })
    .join("");

  cpnContent.innerHTML = cpnHTML;
}

function renderDossier(dossier) {
  // SANS la prédiction de risque (réservée aux professionnels)
  const consultations = dossier.consultations && dossier.consultations.length > 0
    ? dossier.consultations
    .map(
      (c) => `
            <div class="dossier-item">
              <div class="item-date">${new Date(c.date_consultation).toLocaleDateString("fr-FR", {
                weekday: "short",
                year: "numeric",
                month: "short",
                day: "numeric"
              })}</div>
              <div class="item-content">
                <div class="item-metrics">
                  ${c.poids ? `<span class="metric"><strong>Poids:</strong> ${c.poids} kg</span>` : ""}
                  ${c.tension_arterielle_systolique ? `<span class="metric"><strong>TA:</strong> ${c.tension_arterielle_systolique}/${c.tension_arterielle_diastolique || "–"}</span>` : ""}
                </div>
                ${c.notes ? `<p class="item-notes">${c.notes}</p>` : ""}
              </div>
            </div>
          `
        )
        .join("")
    : '<div class="empty-state-small"><p>Aucune consultation enregistrée.</p></div>';

  const vaccinations = dossier.vaccinations && dossier.vaccinations.length > 0
    ? dossier.vaccinations
    .map(
      (v) => `
            <div class="dossier-item">
              <div class="item-icon">💉</div>
              <div class="item-content">
                <strong>${v.type_vaccin}</strong>
                <p class="item-date-small">${new Date(v.date_vaccination).toLocaleDateString("fr-FR")} ${v.site_injection ? `– ${v.site_injection}` : ""}</p>
              </div>
            </div>
          `
        )
        .join("")
    : '<div class="empty-state-small"><p>Aucune vaccination enregistrée.</p></div>';

  const cpnList = dossier.cpn && dossier.cpn.length > 0
    ? dossier.cpn
    .map(
          (cpn) => {
            const date = new Date(cpn.date_rdv);
            const statutClass = cpn.statut === "complete" ? "statut-complete" : 
                               cpn.statut === "confirme" ? "statut-confirme" : 
                               cpn.statut === "manque" ? "statut-manque" : "statut-planifie";
            return `
              <div class="dossier-item">
                <div class="item-icon">📅</div>
                <div class="item-content">
                  <strong>CPN ${cpn.numero_cpn}</strong>
                  <p class="item-date-small">${date.toLocaleDateString("fr-FR", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric"
                  })}</p>
                  <span class="statut-badge ${statutClass}">${cpn.statut}</span>
                </div>
              </div>
            `;
          }
        )
        .join("")
    : '<div class="empty-state-small"><p>Aucun rendez-vous programmé.</p></div>';

  dossierContent.innerHTML = `
    <div class="dossier-grids">
      <article class="dossier-section">
        <div class="section-header">
          <span class="section-icon">🩺</span>
        <h4>Consultations</h4>
        </div>
        <div class="dossier-list">${consultations}</div>
      </article>
      <article class="dossier-section">
        <div class="section-header">
          <span class="section-icon">📅</span>
        <h4>Rendez-vous CPN</h4>
        </div>
        <div class="dossier-list">${cpnList}</div>
      </article>
      <article class="dossier-section">
        <div class="section-header">
          <span class="section-icon">💉</span>
        <h4>Vaccinations</h4>
        </div>
        <div class="dossier-list">${vaccinations}</div>
      </article>
    </div>
  `;
}

function renderRisk(riskData) {
  if (!riskContent) return;
  
  if (!riskData || !riskData.available) {
    riskContent.innerHTML = `
      <div class="empty-state">
        <span class="empty-icon">🎯</span>
        <p>Calcul du risque non disponible pour le moment.</p>
      </div>
    `;
    return;
  }
  
  const risk = riskData;
  const riskPercentage = Math.round(risk.risk_score * 100);
  const riskLevel = risk.risk_level;
  
  let riskClass = "risk-low";
  let riskColor = "#10b981";
  let riskEmoji = "🟢";
  
  if (riskLevel === "élevé") {
    riskClass = "risk-high";
    riskColor = "#ef4444";
    riskEmoji = "🔴";
  } else if (riskLevel === "moyen") {
    riskClass = "risk-medium";
    riskColor = "#f59e0b";
    riskEmoji = "🟠";
  }
  
  const recommendations = risk.recommendations && risk.recommendations.length > 0
    ? risk.recommendations.map(rec => `<li>${rec}</li>`).join("")
    : "<li>Aucune recommandation spécifique pour le moment.</li>";
  
  riskContent.innerHTML = `
    <div class="risk-display ${riskClass}">
      <div class="risk-header">
        <span class="risk-emoji">${riskEmoji}</span>
        <div class="risk-main">
          <div class="risk-level-text">Risque ${riskLevel}</div>
          <div class="risk-percentage">${riskPercentage}%</div>
        </div>
      </div>
      <div class="risk-message">
        ${riskLevel === "élevé" 
          ? "⚠️ Pensez à confirmer votre prochain rendez-vous et suivez attentivement les recommandations."
          : riskLevel === "moyen"
          ? "💡 Pensez à confirmer votre prochain rendez-vous."
          : "✅ Votre suivi est optimal, continuez ainsi !"}
      </div>
      <div class="risk-recommendations">
        <h4>💡 Conseils personnalisés :</h4>
        <ul>${recommendations}</ul>
      </div>
    </div>
  `;
}

function renderNextAppointment(cpnList, patiente) {
  // Chercher l'élément dynamiquement si nécessaire (pour les pages qui l'utilisent)
  const appointmentContent = nextAppointmentContent || document.getElementById("next-appointment-content");
  if (!appointmentContent) return;
  
  const upcomingCpn = cpnList
    .filter(cpn => new Date(cpn.date_rdv) > new Date() && cpn.statut !== "complete")
    .sort((a, b) => new Date(a.date_rdv) - new Date(b.date_rdv))[0];
  
  if (!upcomingCpn) {
    appointmentContent.innerHTML = `
      <div class="empty-state">
        <span class="empty-icon">📅</span>
        <p>Aucune consultation programmée pour le moment.</p>
        <small>Vos prochains rendez-vous apparaîtront ici une fois planifiés par votre professionnel de santé.</small>
      </div>
    `;
    return;
  }
  
  const date = new Date(upcomingCpn.date_rdv);
  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();
  const isTomorrow = date.toDateString() === new Date(now.getTime() + 86400000).toDateString();
  const daysUntil = Math.ceil((date - now) / (1000 * 60 * 60 * 24));
  
  let dateLabel = "";
  let urgencyClass = "";
  if (isToday) {
    dateLabel = "Aujourd'hui";
    urgencyClass = "urgent-today";
  } else if (isTomorrow) {
    dateLabel = "Demain";
    urgencyClass = "urgent-tomorrow";
  } else if (daysUntil <= 7) {
    dateLabel = `Dans ${daysUntil} jour${daysUntil > 1 ? 's' : ''}`;
    urgencyClass = "urgent-week";
  } else {
    dateLabel = date.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" });
  }
  
  const statutClass = upcomingCpn.statut === "planifie" ? "statut-planifie" : 
                     upcomingCpn.statut === "confirme" ? "statut-confirme" : 
                     upcomingCpn.statut === "manque" ? "statut-manque" : "statut-complete";
  
  appointmentContent.innerHTML = `
    <div class="next-appointment-enhanced ${urgencyClass} ${isToday ? 'today' : ''}">
      <div class="appointment-header-enhanced">
        <div class="appointment-badge-large">CPN ${upcomingCpn.numero_cpn}</div>
        <span class="appointment-status-badge ${statutClass}">${upcomingCpn.statut}</span>
      </div>
      
      <div class="appointment-date-enhanced">
        <div class="date-label-large">${dateLabel}</div>
        <div class="date-full-enhanced">${date.toLocaleDateString("fr-FR", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric"
        })}</div>
        <div class="date-time-enhanced">
          <span class="time-icon">🕐</span>
          <span>${date.toLocaleTimeString("fr-FR", {
            hour: "2-digit",
            minute: "2-digit"
          })}</span>
        </div>
        ${daysUntil > 0 && daysUntil <= 7 ? `
          <div class="days-until">
            ${daysUntil === 1 ? "⏰ Dans 1 jour" : `⏰ Dans ${daysUntil} jours`}
          </div>
        ` : ""}
      </div>
      
      ${patiente && (patiente.ville || patiente.adresse) ? `
        <div class="appointment-location-enhanced">
          <div class="location-header">
            <span class="location-icon-large">📍</span>
            <strong>Lieu de consultation</strong>
          </div>
          <div class="location-details">
            ${patiente.ville ? `<p class="location-city">${patiente.ville}</p>` : ""}
            ${patiente.adresse ? `<p class="location-address">${patiente.adresse}</p>` : ""}
            ${patiente.distance_centre ? `<p class="location-distance">Distance : ${patiente.distance_centre.toFixed(1)} km</p>` : ""}
            ${patiente.moyen_transport ? `
              <p class="location-transport">
                Moyen de transport recommandé : 
                <span class="transport-type">${
                  patiente.moyen_transport === "pieds" ? "À pied" :
                  patiente.moyen_transport === "velo" ? "À vélo" :
                  patiente.moyen_transport === "moto" ? "En moto" :
                  patiente.moyen_transport === "voiture" ? "En voiture" :
                  patiente.moyen_transport === "transport_public" ? "Transport public" :
                  patiente.moyen_transport
                }</span>
              </p>
            ` : ""}
          </div>
        </div>
      ` : ""}
      
      ${upcomingCpn.notes ? `
        <div class="appointment-notes-enhanced">
          <div class="notes-header">
            <span class="notes-icon">📝</span>
            <strong>Notes importantes</strong>
          </div>
          <p class="notes-content">${upcomingCpn.notes}</p>
        </div>
      ` : ""}
      
      <div class="appointment-actions">
        <button class="btn-appointment-action" onclick="alert('Fonctionnalité à venir : Confirmer le rendez-vous')">
          ✅ Confirmer le rendez-vous
        </button>
        <button class="btn-appointment-action secondary" onclick="handleCancelAppointment()">
          🚫 Signaler un empêchement
        </button>
      </div>
    </div>
  `;
}

function renderReminders(cpnList, consultations, vaccinations) {
  const remindersEl = remindersContent || document.getElementById("reminders-content");
  if (!remindersEl) return;
  
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const reminders = [];
  
  // Prochaine consultation (consultations médicales)
  if (consultations && consultations.length > 0) {
    const upcomingConsultation = consultations
      .filter(c => {
        const date = new Date(c.date_consultation);
        date.setHours(0, 0, 0, 0);
        return date >= now;
      })
      .sort((a, b) => new Date(a.date_consultation) - new Date(b.date_consultation))[0];
    
    if (upcomingConsultation) {
      const date = new Date(upcomingConsultation.date_consultation);
      const daysUntil = Math.ceil((date - now) / (1000 * 60 * 60 * 24));
      let dateLabel = "";
      if (daysUntil === 0) dateLabel = "Aujourd'hui";
      else if (daysUntil === 1) dateLabel = "Demain";
      else if (daysUntil <= 7) dateLabel = `Dans ${daysUntil} jours`;
      else dateLabel = date.toLocaleDateString("fr-FR", { day: "numeric", month: "long" });
      
      reminders.push({
        type: "consultation",
        icon: "🩺",
        title: "Prochaine consultation",
        date: date,
        dateLabel: dateLabel,
        time: date.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })
      });
    }
  }
  
  // Prochaine CPN
  if (cpnList && cpnList.length > 0) {
    const upcomingCpn = cpnList
      .filter(cpn => {
        const date = new Date(cpn.date_rdv);
        date.setHours(0, 0, 0, 0);
        return date >= now && cpn.statut !== "complete";
      })
      .sort((a, b) => new Date(a.date_rdv) - new Date(b.date_rdv))[0];
    
    if (upcomingCpn) {
      const date = new Date(upcomingCpn.date_rdv);
      const daysUntil = Math.ceil((date - now) / (1000 * 60 * 60 * 24));
      let dateLabel = "";
      if (daysUntil === 0) dateLabel = "Aujourd'hui";
      else if (daysUntil === 1) dateLabel = "Demain";
      else if (daysUntil <= 7) dateLabel = `Dans ${daysUntil} jours`;
      else dateLabel = date.toLocaleDateString("fr-FR", { day: "numeric", month: "long" });
      
      reminders.push({
        type: "cpn",
        icon: "📅",
        title: `CPN ${upcomingCpn.numero_cpn}`,
        date: date,
        dateLabel: dateLabel,
        time: date.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })
      });
    }
  }
  
  // Prochaines vaccinations
  if (vaccinations && vaccinations.length > 0) {
    // Vaccinations à venir (selon le calendrier de vaccination prénatale)
    // Pour l'instant, on affiche les vaccinations récentes ou à venir
    const upcomingVaccinations = vaccinations
      .filter(v => {
        if (!v.date_vaccination) return false;
        const date = new Date(v.date_vaccination);
        date.setHours(0, 0, 0, 0);
        return date >= now;
      })
      .sort((a, b) => new Date(a.date_vaccination) - new Date(b.date_vaccination));
    
    upcomingVaccinations.forEach(vaccination => {
      const date = new Date(vaccination.date_vaccination);
      const daysUntil = Math.ceil((date - now) / (1000 * 60 * 60 * 24));
      let dateLabel = "";
      if (daysUntil === 0) dateLabel = "Aujourd'hui";
      else if (daysUntil === 1) dateLabel = "Demain";
      else if (daysUntil <= 7) dateLabel = `Dans ${daysUntil} jours`;
      else dateLabel = date.toLocaleDateString("fr-FR", { day: "numeric", month: "long" });
      
      reminders.push({
        type: "vaccination",
        icon: "💉",
        title: `Vaccination ${vaccination.type_vaccin || "prévue"}`,
        date: date,
        dateLabel: dateLabel
      });
    });
  }
  
  // Trier par date
  reminders.sort((a, b) => a.date - b.date);
  
  if (reminders.length === 0) {
    remindersEl.innerHTML = `
      <div class="empty-state">
        <span class="empty-icon">📅</span>
        <p>Aucun rendez-vous programmé pour le moment.</p>
        <small>Vos prochains rendez-vous apparaîtront ici une fois planifiés.</small>
      </div>
    `;
    return;
  }
  
  const remindersHTML = reminders.map(reminder => {
    const dateStr = reminder.date.toLocaleDateString("fr-FR", {
      weekday: "short",
      day: "numeric",
      month: "short"
    });
    
    return `
      <div class="reminder-item" data-type="${reminder.type}">
        <div class="reminder-icon">${reminder.icon}</div>
        <div class="reminder-content">
          <div class="reminder-title">${reminder.title}</div>
          <div class="reminder-date">
            <span class="reminder-date-label">${reminder.dateLabel}</span>
            <span class="reminder-date-full">${dateStr}</span>
            ${reminder.time ? `<span class="reminder-time">${reminder.time}</span>` : ""}
          </div>
        </div>
      </div>
    `;
  }).join("");
  
  remindersEl.innerHTML = `
    <div class="reminders-list">
      ${remindersHTML}
    </div>
  `;
}

function renderNotifications(cpnList, vaccinations) {
  if (!notificationsContent) return;
  
  const notifications = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // Rappels CPN (48h avant et la veille)
  cpnList
    .filter(cpn => {
      const cpnDate = new Date(cpn.date_rdv);
      cpnDate.setHours(0, 0, 0, 0);
      const diffDays = Math.ceil((cpnDate - today) / (1000 * 60 * 60 * 24));
      return diffDays >= 0 && diffDays <= 2 && cpn.statut !== "complete";
    })
    .forEach(cpn => {
      const cpnDate = new Date(cpn.date_rdv);
      const diffDays = Math.ceil((cpnDate - today) / (1000 * 60 * 60 * 24));
      notifications.push({
        type: "cpn",
        priority: diffDays === 0 ? "high" : "medium",
        message: diffDays === 0 
          ? `Rappel : Votre CPN ${cpn.numero_cpn} est aujourd'hui à ${cpnDate.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}`
          : diffDays === 1
          ? `Rappel : Votre CPN ${cpn.numero_cpn} est demain`
          : `Rappel : Votre CPN ${cpn.numero_cpn} est dans ${diffDays} jours`,
        date: cpnDate
      });
    });
  
  // Rappels de prévention
  notifications.push({
    type: "prevention",
    priority: "low",
    message: "💧 Hydratez-vous régulièrement et reposez-vous suffisamment.",
    date: null
  });
  
  notifications.push({
    type: "prevention",
    priority: "low",
    message: "⚠️ Signalez toute douleur inhabituelle ou symptôme préoccupant.",
    date: null
  });
  
  if (notifications.length === 0) {
    notificationsContent.innerHTML = `
      <div class="empty-state">
        <span class="empty-icon">🔔</span>
        <p>Aucune notification pour le moment.</p>
      </div>
    `;
    return;
  }
  
  const notificationsHTML = notifications
    .map(notif => `
      <div class="notification-item ${notif.priority}">
        <span class="notification-icon">${notif.type === "cpn" ? "📅" : "💡"}</span>
        <div class="notification-content">
          <p>${notif.message}</p>
          ${notif.date ? `<small>${notif.date.toLocaleDateString("fr-FR")}</small>` : ""}
        </div>
      </div>
    `)
    .join("");
  
  notificationsContent.innerHTML = `<div class="notifications-list">${notificationsHTML}</div>`;
}


async function loadPatienteData() {
  try {
    // Utiliser les données sauvegardées localement en priorité
    if (!patienteData) {
      const savedData = loadSavedPatienteData();
      if (savedData) {
        patienteData = savedData;
      }
    }
    
    let patienteId = null;
    
    if (patienteData && patienteData.id) {
      patienteId = patienteData.id;
      renderProfile(patienteData);
    } else {
      // Essayer de charger depuis le serveur (mode démonstration)
      try {
        const patientes = await fetchJSON("/patientes/");
        if (patientes && patientes.length > 0) {
          patienteId = patientes[0].id;
          patienteData = patientes[0];
          renderProfile(patienteData);
        } else {
          // Aucune patiente disponible - afficher le formulaire
          showRegistrationForm();
          return;
        }
      } catch (error) {
        // Si erreur, afficher le formulaire
        console.error("Erreur lors du chargement:", error);
        showRegistrationForm();
        return;
      }
    }

    // Charger les CPN
    let cpnList = [];
    try {
      if (patienteId) {
        // Charger les CPN de cette patiente spécifique
        const allCpn = await fetchJSON("/cpn");
        cpnList = allCpn.filter(cpn => cpn.patiente_id === patienteId);
      } else {
        // Charger toutes les CPN (pour la démo)
        cpnList = await fetchJSON("/cpn");
      }
    renderCPN(cpnList);
    } catch (error) {
      console.error("Erreur lors du chargement des CPN:", error);
      const errorMsg = error.message || "Erreur de connexion";
      if (cpnContent) {
        cpnContent.innerHTML = `
          <div class="error-state">
            <span class="error-icon">⚠️</span>
            <p>Erreur lors du chargement des CPN.</p>
            <small>${errorMsg}</small>
          </div>
        `;
      }
    }

    // Charger le dossier complet pour avoir consultations et vaccinations
    let consultations = [];
    let vaccinations = [];
    if (patienteId) {
      try {
        const dossier = await fetchJSON(`/patientes/${patienteId}/dossier`).catch(() => ({}));
        consultations = dossier.consultations || [];
        vaccinations = dossier.vaccinations || [];
      } catch (error) {
        console.error("Erreur lors du chargement du dossier:", error);
      }
    }
    
    // Afficher les rappels (prochaine consultation, CPN, vaccinations)
    renderReminders(cpnList, consultations, vaccinations);
    
    // Afficher la prochaine consultation (pour compatibilité avec autres pages)
    renderNextAppointment(cpnList, patienteData);
    
    // Afficher les notifications (pour compatibilité avec autres pages)
    renderNotifications(cpnList, vaccinations);
    
    // Afficher un aperçu du dossier (lien vers la page complète)
    if (patienteId) {
      try {
        const dossier = await fetchJSON(`/patientes/${patienteId}/dossier`);
        renderDossierPreview(dossier);
      } catch (error) {
        console.error("Erreur lors du chargement du dossier:", error);
        renderDossierPreview(null);
      }
    } else {
      renderDossierPreview(null);
    }
  } catch (error) {
    console.error("Erreur lors du chargement des données:", error);
    cpnContent.innerHTML = `
      <div class="error-state">
        <span class="error-icon">⚠️</span>
        <p>Erreur lors du chargement de vos rendez-vous.</p>
        <small>${error.message}</small>
      </div>
    `;
    dossierContent.innerHTML = `
      <div class="error-state">
        <span class="error-icon">⚠️</span>
        <p>Erreur lors du chargement de votre dossier.</p>
        <small>${error.message}</small>
      </div>
    `;
  }
}

function renderDossierPreview(dossier) {
  if (!dossierContent) return;
  
  if (!dossier) {
    dossierContent.innerHTML = `
      <div class="dossier-preview">
        <p>Aucune donnée disponible pour le moment.</p>
        <a href="dossier-medical.html" class="btn-primary" style="display: inline-block; text-decoration: none; margin-top: 1rem;">
          📋 Voir le dossier complet
        </a>
      </div>
    `;
    return;
  }
  
  const consultationsCount = dossier.consultations?.length || 0;
  const cpnCount = dossier.cpn?.length || 0;
  const vaccinationsCount = dossier.vaccinations?.length || 0;
  
      dossierContent.innerHTML = `
    <div class="dossier-preview">
      <div class="dossier-stats">
        <div class="dossier-stat-item">
          <span class="stat-icon">🩺</span>
          <div>
            <strong>${consultationsCount}</strong>
            <p>Consultation${consultationsCount > 1 ? 's' : ''}</p>
          </div>
        </div>
        <div class="dossier-stat-item">
          <span class="stat-icon">📅</span>
          <div>
            <strong>${cpnCount}</strong>
            <p>CPN</p>
          </div>
        </div>
        <div class="dossier-stat-item">
          <span class="stat-icon">💉</span>
          <div>
            <strong>${vaccinationsCount}</strong>
            <p>Vaccination${vaccinationsCount > 1 ? 's' : ''}</p>
          </div>
        </div>
      </div>
      <div style="margin-top: 1rem; text-align: center;">
        <a href="dossier-medical.html" class="btn-primary" style="display: inline-block; text-decoration: none;">
          📋 Voir le dossier complet
        </a>
      </div>
        </div>
      `;
}

function renderEmptyDossier() {
  if (!dossierContent) return;
  renderDossierPreview(null);
}

// Vérifier si les données de la patiente existent
function hasPatienteData() {
  const saved = localStorage.getItem("mama_patiente_data");
  if (saved) {
    try {
      const data = JSON.parse(saved);
      return data && data.prenom && data.nom && data.age;
    } catch (e) {
      return false;
    }
  }
  return false;
}

// Charger les données sauvegardées
function loadSavedPatienteData() {
  const saved = localStorage.getItem("mama_patiente_data");
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (e) {
      return null;
    }
  }
  return null;
}

// Sauvegarder les données de la patiente
function savePatienteData(data) {
  localStorage.setItem("mama_patiente_data", JSON.stringify(data));
}

// Afficher le formulaire d'inscription
function showRegistrationForm() {
  if (registrationFormCard) {
    registrationFormCard.classList.remove("hidden");
  }
  // Masquer les sections du tableau de bord
  dashboardSections.forEach(section => {
    section.style.display = "none";
  });
}

// Masquer le formulaire et afficher le tableau de bord
function hideRegistrationForm() {
  if (registrationFormCard) {
    registrationFormCard.classList.add("hidden");
  }
  // Afficher les sections du tableau de bord
  dashboardSections.forEach(section => {
    section.style.display = "";
  });
}

// Gérer la soumission du formulaire d'inscription
async function handleRegistrationSubmit(event) {
  event.preventDefault();
  
  if (registrationMessage) {
    registrationMessage.textContent = "";
    registrationMessage.className = "message";
  }
  
  // Collecter les données du formulaire
  const formData = {
    prenom: document.querySelector("#reg-prenom").value.trim(),
    nom: document.querySelector("#reg-nom").value.trim(),
    age: parseInt(document.querySelector("#reg-age").value),
    gestite: parseInt(document.querySelector("#reg-gestite").value) || 1,
    parite: parseInt(document.querySelector("#reg-parite").value) || 0,
    niveau_instruction: document.querySelector("#reg-niveau-instruction").value || null,
    date_dernieres_regles: document.querySelector("#reg-dernieres-regles").value,
    date_accouchement_prevue: document.querySelector("#reg-accouchement-prevue").value || null,
    ville: document.querySelector("#reg-ville").value.trim() || null,
    adresse: document.querySelector("#reg-adresse").value.trim() || null,
    distance_centre: parseFloat(document.querySelector("#reg-distance").value) || null,
    moyen_transport: document.querySelector("#reg-transport").value || null,
    antecedents_medicaux: document.querySelector("#reg-antecedents-medicaux").value.trim() || null,
    antecedents_obstetricaux: document.querySelector("#reg-antecedents-obstetricaux").value.trim() || null
  };
  
  // Validation
  if (!formData.prenom || !formData.nom || !formData.age || !formData.date_dernieres_regles) {
    if (registrationMessage) {
      registrationMessage.textContent = "Veuillez remplir tous les champs obligatoires (*)";
      registrationMessage.className = "message error";
    }
    return;
  }
  
  // Calculer la date d'accouchement prévue si non fournie
  if (!formData.date_accouchement_prevue && formData.date_dernieres_regles) {
    const lastPeriod = new Date(formData.date_dernieres_regles);
    const dueDate = new Date(lastPeriod);
    dueDate.setDate(dueDate.getDate() + 280); // 40 semaines
    formData.date_accouchement_prevue = dueDate.toISOString().split('T')[0];
  }
  
  // Générer un ID unique
  formData.id = Date.now();
  
  try {
    // Sauvegarder localement
    savePatienteData(formData);
    
    // Mettre à jour les données globales
    patienteData = formData;
    
    // Masquer le formulaire
    hideRegistrationForm();
    
    // Charger le tableau de bord
    await loadPatienteData();
    
    if (registrationMessage) {
      registrationMessage.textContent = "Profil créé avec succès !";
      registrationMessage.className = "message success";
    }
  } catch (error) {
    console.error("Erreur lors de la création du profil:", error);
    if (registrationMessage) {
      registrationMessage.textContent = "Erreur lors de la création du profil: " + error.message;
      registrationMessage.className = "message error";
    }
  }
}

async function bootstrap() {
  try {
    // Mode sans authentification - accès direct
    // Section user-info masquée - Mode développement supprimé
    
    // Vérifier si les données de la patiente existent
    const savedData = loadSavedPatienteData();
    if (savedData) {
      patienteData = savedData;
      hideRegistrationForm();
    await loadPatienteData();
    } else {
      // Afficher le formulaire d'inscription
      showRegistrationForm();
    }
  } catch (error) {
    console.error("Erreur lors du chargement:", error);
    // Afficher le formulaire en cas d'erreur
    showRegistrationForm();
  }
}

// Gestion de l'espace d'assistance

function handleSymptom() {
  const symptom = prompt("Décrivez votre symptôme ou votre situation :");
  if (symptom) {
    alert("Merci pour votre signalement. Un professionnel de santé vous contactera si nécessaire.");
    // TODO: Implémenter l'envoi du signalement
  }
}

function handleCancelAppointment() {
  const reason = prompt("Pourquoi ne pouvez-vous pas venir au rendez-vous ?");
  if (reason) {
    alert("Votre empêchement a été enregistré. Nous vous contacterons pour reprogrammer le rendez-vous.");
    // TODO: Implémenter l'annulation/report de rendez-vous
  }
}

// Gestion de la navigation par cartes
function setupToolCards() {
  const toolCards = document.querySelectorAll(".tool-card");
  toolCards.forEach(card => {
    card.addEventListener("click", (e) => {
      const href = card.getAttribute("href");
      if (href && href.startsWith("#")) {
        e.preventDefault();
        const sectionId = href.substring(1) + "-section";
        const section = document.getElementById(sectionId);
        if (section) {
          // Masquer toutes les sections
          document.querySelectorAll(".detail-section").forEach(s => s.classList.add("hidden"));
          // Afficher la section sélectionnée
          section.classList.remove("hidden");
          section.scrollIntoView({ behavior: "smooth" });
          
          // Charger les données si nécessaire
          if (sectionId === "next-appointment-section") {
            loadPatienteData();
          } else if (sectionId === "notifications-section") {
            loadPatienteData();
          } else if (sectionId === "cpn-history-section") {
            loadPatienteData();
          }
        }
      }
      // Les liens externes (chatbot.html, conseils.html, dossier-medical.html) fonctionnent normalement
    });
  });
}

function closeDetailSection(sectionId) {
  const section = document.getElementById(sectionId);
  if (section) {
    section.classList.add("hidden");
  }
}

// Exposer les fonctions globalement
window.closeDetailSection = closeDetailSection;
window.loadPatienteData = loadPatienteData;
window.renderNextAppointment = renderNextAppointment;
window.renderNotifications = renderNotifications;
window.renderCPN = renderCPN;
window.renderReminders = renderReminders;

logoutButton.addEventListener("click", handleLogout);
if (symptomBtn) symptomBtn.addEventListener("click", handleSymptom);
if (cancelAppointmentBtn) cancelAppointmentBtn.addEventListener("click", handleCancelAppointment);
if (registrationForm) registrationForm.addEventListener("submit", handleRegistrationSubmit);

// Initialiser les cartes d'outils
document.addEventListener("DOMContentLoaded", () => {
  setupToolCards();
});

bootstrap();

