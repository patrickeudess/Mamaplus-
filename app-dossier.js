const API_BASE = "http://localhost:8000/api";

let authToken = localStorage.getItem("mama_token") || "";
let patienteData = null;

const userInfo = document.querySelector("#user-info");
const userName = document.querySelector("#user-name");
const logoutButton = document.querySelector("#logout-button");
const profileName = document.querySelector("#profile-name");
const profileAge = document.querySelector("#profile-age");
const profileDossier = document.querySelector("#profile-dossier");
const profileWeek = document.querySelector("#profile-week");
const dossierContent = document.querySelector("#dossier-content");

const defaultHeaders = () => {
  const headers = { "Content-Type": "application/json" };
  if (authToken) {
    headers["Authorization"] = `Bearer ${authToken}`;
  }
  return headers;
};

async function fetchJSON(path, options = {}) {
  const USE_MOCK = window.USE_MOCK_DATA !== false;
  
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
    if (USE_MOCK && (error instanceof TypeError || error.message.includes("fetch") || error.message.includes("HTTP"))) {
      console.log(`[Mode démonstration] Utilisation de données mockées pour ${path}`);
      return await getMockData(path, options);
    }
    
    console.error(`Erreur API ${path}:`, error);
    throw error;
  }
}

async function getMockData(path, options = {}) {
  await new Promise(resolve => setTimeout(resolve, 300));
  
  const mockPatiente = {
    id: 1,
    prenom: "Awa",
    nom: "Koffi",
    age: 28,
    date_dernieres_regles: "2024-01-15",
    date_accouchement_prevue: "2024-10-22"
  };
  
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
        notes: "Consultation normale, tout va bien."
      },
      {
        id: 2,
        date_consultation: "2024-03-15T09:00:00",
        poids: 67.2,
        tension_arterielle_systolique: 118,
        tension_arterielle_diastolique: 78,
        notes: "Poids normal, tension stable."
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
    cpn: [
      {
        id: 1,
        numero_cpn: 1,
        date_rdv: "2024-02-15T09:00:00",
        statut: "complete"
      },
      {
        id: 2,
        numero_cpn: 2,
        date_rdv: "2024-03-15T09:00:00",
        statut: "complete"
      },
      {
        id: 3,
        numero_cpn: 3,
        date_rdv: "2024-04-20T10:00:00",
        statut: "planifie"
      }
    ],
    prediction_risk: {
      available: true,
      risk_score: 0.68,
      risk_level: "moyen",
      confidence: 0.85,
      recommendations: [
        "Hydratez-vous davantage et reposez-vous.",
        "Si vous ressentez des maux de tête fréquents, consultez sans attendre."
      ]
    }
  };
  
  if (path.startsWith("/patientes/") && path.endsWith("/dossier")) {
    return mockDossier;
  }
  
  if (path === "/patientes/") {
    return [mockPatiente];
  }
  
  return null;
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
}

// Fonctions d'aide intelligente
function getWeightAdvice(poids, semaineGrossesse) {
  if (!poids || !semaineGrossesse) return null;
  
  // Gain de poids recommandé pendant la grossesse
  const gainNormal = semaineGrossesse * 0.4; // ~0.4 kg par semaine en moyenne
  const poidsInitial = poids - gainNormal;
  
  if (gainNormal < 5) {
    return { type: "info", message: "Votre prise de poids est dans la normale pour cette période de grossesse." };
  } else if (gainNormal > 15) {
    return { type: "warning", message: "Prise de poids importante. Consultez votre médecin pour un suivi nutritionnel." };
  }
  return null;
}

function getBloodPressureAdvice(systolique, diastolique) {
  if (!systolique || !diastolique) return null;
  
  if (systolique >= 140 || diastolique >= 90) {
    return { 
      type: "alert", 
      message: "⚠️ Tension artérielle élevée détectée. Consultez immédiatement votre médecin." 
    };
  } else if (systolique >= 130 || diastolique >= 85) {
    return { 
      type: "warning", 
      message: "Tension artérielle légèrement élevée. Surveillez régulièrement et consultez si cela persiste." 
    };
  } else if (systolique < 90 || diastolique < 60) {
    return { 
      type: "info", 
      message: "Tension artérielle basse. Assurez-vous de bien vous hydrater et de vous lever lentement." 
    };
  }
  return { type: "success", message: "✅ Tension artérielle normale." };
}

function getCPNStatusExplanation(statut) {
  const explanations = {
    "planifie": "Rendez-vous programmé. Pensez à confirmer votre présence 24h avant.",
    "confirme": "Rendez-vous confirmé. Préparez vos questions pour le professionnel de santé.",
    "complete": "Consultation terminée. Suivez les recommandations de votre médecin.",
    "manque": "Rendez-vous manqué. Contactez rapidement votre centre de santé pour reprogrammer."
  };
  return explanations[statut] || "";
}

function getVaccinationInfo(typeVaccin) {
  const infos = {
    "Tétanos": "Le vaccin contre le tétanos est recommandé pendant la grossesse pour protéger la mère et le nouveau-né.",
    "Coqueluche": "Recommandé entre 27 et 36 semaines de grossesse pour protéger le bébé à la naissance.",
    "Grippe": "Recommandé pendant la saison grippale pour protéger la mère et le bébé."
  };
  return infos[typeVaccin] || "Vaccination importante pour votre santé et celle de votre bébé.";
}

function renderDossier(dossier) {
  // Vérifier que l'élément existe
  if (!dossierContent) {
    console.error("Élément dossier-content introuvable");
    return;
  }
  
  if (!dossier) {
    renderEmptyDossier();
    return;
  }
  
  // Calculer la semaine de grossesse pour les conseils
  const semaineGrossesse = calculatePregnancyWeek(
    dossier.patiente?.date_dernieres_regles,
    dossier.patiente?.date_accouchement_prevue
  ) || 0;
  
  // Trier les consultations par date (plus récentes en premier)
  const consultationsSorted = dossier.consultations && dossier.consultations.length > 0
    ? [...dossier.consultations].sort((a, b) => new Date(b.date_consultation) - new Date(a.date_consultation))
    : [];
  
  const consultations = consultationsSorted.length > 0
    ? consultationsSorted
    .map(
      (c) => {
        const date = new Date(c.date_consultation);
        // Formatage robuste de la date
        const dayNames = ['DIM', 'LUN', 'MAR', 'MER', 'JEU', 'VEN', 'SAM'];
        const monthNames = ['JANVIER', 'FÉVRIER', 'MARS', 'AVRIL', 'MAI', 'JUIN',
                           'JUILLET', 'AOÛT', 'SEPTEMBRE', 'OCTOBRE', 'NOVEMBRE', 'DÉCEMBRE'];
        
        const dayName = dayNames[date.getDay()] || 'JOUR';
        const day = date.getDate();
        const month = monthNames[date.getMonth()] || 'MOIS';
        const year = date.getFullYear();
        
        return `
            <div class="dossier-item consultation-item">
              <div class="item-header-consultation">
                <div class="item-icon-large">🩺</div>
                <div class="item-date-enhanced">
                  <div class="date-day">${dayName}. ${day} ${month} ${year}</div>
                </div>
              </div>
              <div class="item-content-enhanced">
                <div class="item-metrics-enhanced">
                  ${c.poids !== null && c.poids !== undefined ? `
                    <div class="metric-card" role="group" aria-label="Métrique de poids">
                      <div class="metric-header">
                        <span class="metric-label">POIDS</span>
                        <button class="help-icon" aria-label="Information sur le poids" data-help="Le poids est mesuré à chaque consultation pour suivre l'évolution de votre grossesse. Un gain de poids progressif est normal et nécessaire.">ℹ️</button>
                      </div>
                      <span class="metric-value" aria-label="${c.poids} kilogrammes">${c.poids} kg</span>
                      ${getWeightAdvice(c.poids, semaineGrossesse) ? `
                        <div class="metric-advice ${getWeightAdvice(c.poids, semaineGrossesse).type}">
                          ${getWeightAdvice(c.poids, semaineGrossesse).message}
                        </div>
                      ` : ""}
                    </div>
                  ` : ""}
                  ${c.tension_arterielle_systolique !== null && c.tension_arterielle_systolique !== undefined ? `
                    <div class="metric-card" role="group" aria-label="Métrique de tension artérielle">
                      <div class="metric-header">
                        <span class="metric-label">TA</span>
                        <button class="help-icon" aria-label="Information sur la tension artérielle" data-help="La tension artérielle (TA) mesure la pression du sang dans vos artères. Pendant la grossesse, une tension normale est importante pour votre santé et celle de votre bébé.">ℹ️</button>
                      </div>
                      <span class="metric-value" aria-label="Tension artérielle ${c.tension_arterielle_systolique} sur ${c.tension_arterielle_diastolique || 'non mesurée'}">${c.tension_arterielle_systolique}/${c.tension_arterielle_diastolique || "–"}</span>
                      ${getBloodPressureAdvice(c.tension_arterielle_systolique, c.tension_arterielle_diastolique) ? `
                        <div class="metric-advice ${getBloodPressureAdvice(c.tension_arterielle_systolique, c.tension_arterielle_diastolique).type}">
                          ${getBloodPressureAdvice(c.tension_arterielle_systolique, c.tension_arterielle_diastolique).message}
                        </div>
                      ` : ""}
                    </div>
                  ` : ""}
                </div>
                ${c.notes ? `
                  <div class="item-notes-enhanced">
                    <p>${c.notes}</p>
                  </div>
                ` : ""}
              </div>
            </div>
          `;
      }
    )
    .join("")
    : '<div class="empty-state-small"><p>Aucune consultation enregistrée.</p></div>';

  // Trier les vaccinations par date (plus récentes en premier)
  const vaccinationsSorted = dossier.vaccinations && dossier.vaccinations.length > 0
    ? [...dossier.vaccinations].sort((a, b) => new Date(b.date_vaccination) - new Date(a.date_vaccination))
    : [];
  
  const vaccinations = vaccinationsSorted.length > 0
    ? vaccinationsSorted
    .map(
      (v) => {
        const date = new Date(v.date_vaccination);
        return `
            <div class="dossier-item vaccination-item">
              <div class="item-icon-large vaccination-icon">💉</div>
              <div class="item-content-enhanced">
                <div class="vaccination-header">
                  <div class="vaccination-header-left">
                    <strong class="vaccination-type">${v.type_vaccin}</strong>
                    <button class="help-icon vaccination-help" aria-label="Information sur la vaccination" data-help="${getVaccinationInfo(v.type_vaccin)}">ℹ️</button>
                  </div>
                </div>
                <div class="vaccination-details">
                  <span class="vaccination-date">${date.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric" })}</span>
                  ${v.site_injection ? `<span class="vaccination-site">${v.site_injection}</span>` : ""}
                </div>
                <div class="vaccination-info">
                  💡 ${getVaccinationInfo(v.type_vaccin)}
                </div>
              </div>
            </div>
          `;
      }
    )
    .join("")
    : '<div class="empty-state-small"><p>Aucune vaccination enregistrée.</p></div>';

  // Trier les CPN : d'abord par statut (planifiées en premier), puis par date
  const cpnSorted = dossier.cpn && dossier.cpn.length > 0
    ? [...dossier.cpn].sort((a, b) => {
        // Ordre de priorité des statuts
        const statutOrder = { planifie: 0, confirme: 1, complete: 2, manque: 3 };
        const statutA = statutOrder[a.statut] !== undefined ? statutOrder[a.statut] : 99;
        const statutB = statutOrder[b.statut] !== undefined ? statutOrder[b.statut] : 99;
        
        // Si statuts différents, trier par statut
        if (statutA !== statutB) {
          return statutA - statutB;
        }
        
        // Si même statut, trier par date (plus récentes en premier)
        return new Date(b.date_rdv) - new Date(a.date_rdv);
      })
    : [];
  
  const cpnList = cpnSorted.length > 0
    ? cpnSorted
    .map(
          (cpn) => {
            const date = new Date(cpn.date_rdv);
            const statutClass = cpn.statut === "complete" ? "statut-complete" : 
                               cpn.statut === "confirme" ? "statut-confirme" : 
                               cpn.statut === "manque" ? "statut-manque" : "statut-planifie";
            const statutText = cpn.statut === "complete" ? "COMPLÉTÉE" : 
                              cpn.statut === "confirme" ? "CONFIRMÉE" : 
                              cpn.statut === "manque" ? "MANQUÉE" : "PLANIFIÉE";
            return `
              <div class="dossier-item cpn-item">
                <div class="item-icon-large cpn-icon">📅</div>
                <div class="item-content-enhanced">
                  <div class="cpn-header">
                    <div class="cpn-header-left">
                      <strong class="cpn-number">CPN ${cpn.numero_cpn}</strong>
                      <button class="help-icon cpn-help" aria-label="Information sur le statut CPN" data-help="${getCPNStatusExplanation(cpn.statut)}">ℹ️</button>
                    </div>
                    <span class="statut-badge-enhanced ${statutClass}" aria-label="Statut: ${statutText}">${statutText}</span>
                  </div>
                  <div class="cpn-date-full">
                    ${date.toLocaleDateString("fr-FR", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric"
                    }).toLowerCase()}
                  </div>
                  ${getCPNStatusExplanation(cpn.statut) ? `
                    <div class="cpn-advice ${statutClass}">
                      💡 ${getCPNStatusExplanation(cpn.statut)}
                    </div>
                  ` : ""}
                  ${cpn.notes ? `<p class="cpn-notes">${cpn.notes}</p>` : ""}
                </div>
              </div>
            `;
          }
        )
        .join("")
    : '<div class="empty-state-small"><p>Aucun rendez-vous programmé.</p></div>';

  dossierContent.innerHTML = `
    <div class="dossier-grids-enhanced">
      <article class="dossier-section-enhanced section-icon-consultation">
        <div class="section-header-enhanced">
          <div class="section-icon-wrapper section-icon-consultation">
            <span class="section-icon-large">🩺</span>
          </div>
          <div class="section-title-wrapper">
            <h3 class="section-title">Consultations</h3>
            <span class="section-count">${consultationsSorted.length}</span>
          </div>
        </div>
        <div class="dossier-list-enhanced">${consultations}</div>
      </article>
      
      <article class="dossier-section-enhanced section-icon-cpn">
        <div class="section-header-enhanced">
          <div class="section-icon-wrapper section-icon-cpn">
            <span class="section-icon-large">📅</span>
          </div>
          <div class="section-title-wrapper">
            <h3 class="section-title">Rendez-vous CPN</h3>
            <span class="section-count">${cpnSorted.length}</span>
          </div>
        </div>
        <div class="dossier-list-enhanced">${cpnList}</div>
      </article>
      
      <article class="dossier-section-enhanced section-icon-vaccination">
        <div class="section-header-enhanced">
          <div class="section-icon-wrapper section-icon-vaccination">
            <span class="section-icon-large">💉</span>
          </div>
          <div class="section-title-wrapper">
            <h3 class="section-title">Vaccinations</h3>
            <span class="section-count">${vaccinationsSorted.length}</span>
          </div>
        </div>
        <div class="dossier-list-enhanced">${vaccinations}</div>
      </article>
    </div>
  `;
}

function renderEmptyDossier() {
  if (!dossierContent) return;
  
  dossierContent.innerHTML = `
    <div class="dossier-grids-enhanced">
      <article class="dossier-section-enhanced section-icon-consultation">
        <div class="section-header-enhanced">
          <div class="section-icon-wrapper section-icon-consultation">
            <span class="section-icon-large">🩺</span>
          </div>
          <div class="section-title-wrapper">
            <h3 class="section-title">Consultations</h3>
            <span class="section-count">0</span>
          </div>
        </div>
        <div class="empty-state-small">
          <p>Aucune consultation enregistrée pour le moment.</p>
        </div>
      </article>
      <article class="dossier-section-enhanced section-icon-cpn">
        <div class="section-header-enhanced">
          <div class="section-icon-wrapper section-icon-cpn">
            <span class="section-icon-large">📅</span>
          </div>
          <div class="section-title-wrapper">
            <h3 class="section-title">Rendez-vous CPN</h3>
            <span class="section-count">0</span>
          </div>
        </div>
        <div class="empty-state-small">
          <p>Aucun rendez-vous programmé pour le moment.</p>
        </div>
      </article>
      <article class="dossier-section-enhanced section-icon-vaccination">
        <div class="section-header-enhanced">
          <div class="section-icon-wrapper section-icon-vaccination">
            <span class="section-icon-large">💉</span>
          </div>
          <div class="section-title-wrapper">
            <h3 class="section-title">Vaccinations</h3>
            <span class="section-count">0</span>
          </div>
        </div>
        <div class="empty-state-small">
          <p>Aucune vaccination enregistrée pour le moment.</p>
        </div>
      </article>
    </div>
  `;
}

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

function handleLogout() {
  authToken = "";
  localStorage.removeItem("mama_token");
  window.location.href = "index.html";
}

async function bootstrap() {
  try {
    // Afficher l'état de chargement
    if (dossierContent) {
      dossierContent.innerHTML = `
        <div class="loading-state">
          <div class="spinner"></div>
          <p>Chargement de votre dossier médical...</p>
        </div>
      `;
    }
    
    if (userInfo) {
      userInfo.classList.remove("hidden");
      if (userName) {
        userName.textContent = "Mode Développement";
      }
    }
    
    const savedData = loadSavedPatienteData();
    if (savedData) {
      patienteData = savedData;
      renderProfile(patienteData);
    } else {
      try {
        const patientes = await fetchJSON("/patientes/");
        if (patientes && patientes.length > 0) {
          patienteData = patientes[0];
          renderProfile(patienteData);
        }
      } catch (error) {
        console.error("Erreur lors du chargement des patientes:", error);
        // Continuer même en cas d'erreur
      }
    }
    
    const patienteId = patienteData?.id;
    if (patienteId) {
      try {
        const dossier = await fetchJSON(`/patientes/${patienteId}/dossier`);
        if (dossier) {
          renderDossier(dossier);
          // Initialiser les tooltips après le rendu
          setTimeout(initHelpTooltips, 300);
        } else {
          renderEmptyDossier();
          setTimeout(initHelpTooltips, 300);
        }
      } catch (error) {
        console.error("Erreur lors du chargement du dossier:", error);
        if (dossierContent) {
          dossierContent.innerHTML = `
            <div class="error-state">
              <span class="error-icon">⚠️</span>
              <p>Erreur lors du chargement de votre dossier médical.</p>
              <small>${error.message || "Veuillez réessayer plus tard"}</small>
            </div>
          `;
        }
      }
    } else {
      renderEmptyDossier();
      setTimeout(initHelpTooltips, 300);
    }
  } catch (error) {
    console.error("Erreur lors du chargement:", error);
    if (dossierContent) {
      dossierContent.innerHTML = `
        <div class="error-state">
          <span class="error-icon">⚠️</span>
          <p>Une erreur est survenue lors du chargement.</p>
          <small>${error.message || "Veuillez réessayer plus tard"}</small>
        </div>
      `;
    }
  }
}

if (logoutButton) logoutButton.addEventListener("click", handleLogout);

// Initialiser les tooltips d'aide après le chargement
function initHelpTooltips() {
  document.querySelectorAll('.help-icon').forEach(icon => {
    icon.addEventListener('click', function(e) {
      e.stopPropagation();
      const helpText = this.getAttribute('data-help');
      if (helpText) {
        showTooltip(this, helpText);
      }
    });
  });
}

function showTooltip(element, text) {
  // Supprimer les tooltips existants
  document.querySelectorAll('.help-tooltip').forEach(t => t.remove());
  
  const tooltip = document.createElement('div');
  tooltip.className = 'help-tooltip';
  tooltip.textContent = text;
  
  const rect = element.getBoundingClientRect();
  tooltip.style.left = `${rect.left + rect.width / 2}px`;
  tooltip.style.top = `${rect.top - 10}px`;
  tooltip.style.transform = 'translate(-50%, -100%)';
  
  document.body.appendChild(tooltip);
  
  // Fermer au clic ailleurs
  setTimeout(() => {
    const closeTooltip = (e) => {
      if (!tooltip.contains(e.target) && e.target !== element) {
        tooltip.remove();
        document.removeEventListener('click', closeTooltip);
      }
    };
    document.addEventListener('click', closeTooltip);
  }, 100);
}

bootstrap();

