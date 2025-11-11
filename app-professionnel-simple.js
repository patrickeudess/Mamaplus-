/**
 * Version simplifiée - Fonctionne sans serveur backend
 * Utilise localStorage pour stocker les données
 */

// Clé pour le stockage local
const STORAGE_KEY = 'mama_patientes_data';

// Données par défaut (exemples)
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

// Fonctions de stockage
function getPatientes() {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    return JSON.parse(stored);
  }
  // Initialiser avec les données par défaut
  savePatientes(DEFAULT_PATIENTES);
  return DEFAULT_PATIENTES;
}

function savePatientes(patientes) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(patientes));
}

function addPatiente(patienteData) {
  const patientes = getPatientes();
  
  // Vérifier que l'ID est fourni
  if (!patienteData.id || patienteData.id <= 0) {
    throw new Error("L'ID du patient est obligatoire et doit être un nombre positif");
  }
  
  // Vérifier que l'ID n'existe pas déjà
  const existingPatiente = patientes.find(p => p.id === patienteData.id);
  if (existingPatiente) {
    throw new Error(`L'ID ${patienteData.id} est déjà utilisé par ${existingPatiente.prenom || ''} ${existingPatiente.nom || ''}`);
  }
  
  const newPatiente = {
    id: parseInt(patienteData.id),
    ...patienteData,
    risque: calculateRisk(patienteData),
    derniere_venue: null,
    prochaine_cpn: null
  };
  
  // Retirer l'ID des données pour éviter la duplication
  delete newPatiente.id;
  newPatiente.id = parseInt(patienteData.id);
  
  patientes.push(newPatiente);
  savePatientes(patientes);
  return newPatiente;
}

function updatePatiente(id, patienteData) {
  const patientes = getPatientes();
  const index = patientes.findIndex(p => p.id === id);
  if (index !== -1) {
    patientes[index] = { ...patientes[index], ...patienteData };
    savePatientes(patientes);
    return patientes[index];
  }
  return null;
}

function deletePatiente(id) {
  const patientes = getPatientes();
  const filtered = patientes.filter(p => p.id !== id);
  savePatientes(filtered);
  return filtered.length < patientes.length;
}

// Calcul simple du risque
function calculateRisk(patiente) {
  let score = 0;
  
  // Âge
  if (patiente.age < 18 || patiente.age > 35) score += 2;
  else if (patiente.age < 20 || patiente.age > 30) score += 1;
  
  // Distance
  if (patiente.distance_centre > 10) score += 2;
  else if (patiente.distance_centre > 5) score += 1;
  
  // Niveau d'instruction
  if (patiente.niveau_instruction === "aucun") score += 1;
  
  if (score >= 4) return "élevé";
  if (score >= 2) return "moyen";
  return "faible";
}

// Fonction pour formater la date
function formatDate(dateString) {
  if (!dateString) return "–";
  const date = new Date(dateString);
  return date.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric" });
}

// Fonction pour obtenir le badge de risque
function getRiskBadge(risque) {
  const badges = {
    "élevé": '<span class="risk-badge risk-badge-high">🔴 Élevé</span>',
    "moyen": '<span class="risk-badge risk-badge-medium">🟠 Modéré</span>',
    "faible": '<span class="risk-badge risk-badge-low">🟢 Faible</span>'
  };
  return badges[risque] || '<span class="risk-badge">–</span>';
}

// Fonction pour filtrer les patientes
function filterPatientes(patientes, filters) {
  return patientes.filter(p => {
    if (filters.risque !== "all" && p.risque !== filters.risque) return false;
    if (filters.localite !== "all" && p.ville !== filters.localite) return false;
    if (filters.age !== "all") {
      const age = p.age || 0;
      if (filters.age === "41+") {
        if (age < 41) return false;
      } else {
        const [min, max] = filters.age.split("-").map(Number);
        if (age < min || age > max) return false;
      }
    }
    if (filters.distance !== "all") {
      const distance = p.distance_centre || 0;
      if (filters.distance === "10+") {
        if (distance < 10) return false;
      } else {
        const [min, max] = filters.distance.split("-").map(Number);
        if (distance < min || distance >= max) return false;
      }
    }
    return true;
  });
}

// Fonction pour afficher les patientes
function renderPatientes(patientes = null) {
  const tableBody = document.querySelector("#patient-table tbody");
  if (!tableBody) return;
  
  // Récupérer les filtres
  const filters = {
    risque: document.querySelector("#risk-filter")?.value || "all",
    localite: document.querySelector("#location-filter")?.value || "all",
    age: document.querySelector("#age-filter")?.value || "all",
    distance: document.querySelector("#distance-filter")?.value || "all"
  };
  
  // Utiliser les patientes fournies ou récupérer depuis le stockage
  let allPatientes = patientes || getPatientes();
  
  // Filtrer
  const filteredPatientes = filterPatientes(allPatientes, filters);
  
  // Trier par ID décroissant (les plus récentes en premier)
  filteredPatientes.sort((a, b) => b.id - a.id);
  
  // Vider le tableau
  tableBody.innerHTML = "";
  
  if (filteredPatientes.length === 0) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="7" style="text-align: center; padding: 2rem; color: #6b7280;">
          Aucune patiente trouvée avec ces filtres
        </td>
      </tr>
    `;
    return;
  }
  
  // Mettre à jour le filtre de localité
  const locationFilter = document.querySelector("#location-filter");
  if (locationFilter) {
    const villes = [...new Set(allPatientes.map(p => p.ville).filter(Boolean))].sort();
    const currentValue = locationFilter.value;
    locationFilter.innerHTML = '<option value="all">Toutes</option>' + 
      villes.map(v => `<option value="${v}">${v}</option>`).join("");
    if (currentValue && villes.includes(currentValue)) {
      locationFilter.value = currentValue;
    }
  }
  
  // Afficher les patientes
  filteredPatientes.forEach(patiente => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${patiente.prenom || ""} ${patiente.nom || ""}</td>
      <td>${patiente.age || "–"}</td>
      <td>${patiente.distance_centre ? `${patiente.distance_centre.toFixed(1)} km` : "–"}</td>
      <td>${getRiskBadge(patiente.risque)}</td>
      <td>${formatDate(patiente.derniere_venue)}</td>
      <td>${formatDate(patiente.prochaine_cpn)}</td>
      <td>
        <div class="action-buttons">
          <button class="action-btn call-btn" onclick="handleCall('${patiente.telephone || ""}')" title="Appeler" ${!patiente.telephone ? 'disabled' : ''}>
            📞
          </button>
          <button class="action-btn edit-btn" onclick="handleEditPatiente(${patiente.id})" title="Modifier">
            ✏️
          </button>
          <button class="action-btn view-btn" onclick="handleViewPatiente(${patiente.id})" title="Voir dossier">
            👁️
          </button>
          <button class="action-btn delete-btn" onclick="handleDeletePatiente(${patiente.id}, '${(patiente.prenom || '') + ' ' + (patiente.nom || '')}')" title="Supprimer">
            🗑️
          </button>
        </div>
      </td>
    `;
    tableBody.appendChild(row);
  });
}

// Fonctions d'action
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

window.handleEditPatiente = function(patienteId) {
  const patientes = getPatientes();
  const patiente = patientes.find(p => p.id === patienteId);
  if (!patiente) {
    alert("Patiente introuvable");
    return;
  }
  
  // Ouvrir le modal et préremplir
  if (window.openAddPatienteModal) {
    window.openAddPatienteModal();
    setTimeout(() => {
      const form = document.querySelector("#add-patiente-form");
      if (form) {
      const idInput = document.querySelector("#patiente-id");
      const nomInput = document.querySelector("#patiente-nom");
      const prenomInput = document.querySelector("#patiente-prenom");
      const ageInput = document.querySelector("#patiente-age");
      const villeInput = document.querySelector("#patiente-ville");
      const distanceInput = document.querySelector("#patiente-distance");
      const telephoneInput = document.querySelector("#patiente-telephone");
      
      if (idInput) {
        idInput.value = patiente.id || "";
        idInput.disabled = true;
        idInput.style.opacity = "0.6";
        idInput.required = false; // Pas obligatoire en modification car déjà existant
      }
      if (nomInput) nomInput.value = patiente.nom || "";
      if (prenomInput) prenomInput.value = patiente.prenom || "";
      if (ageInput) ageInput.value = patiente.age || "";
      if (villeInput) villeInput.value = patiente.ville || "";
      if (distanceInput) distanceInput.value = patiente.distance_centre || "";
      if (telephoneInput) {
        telephoneInput.value = patiente.telephone || "";
        telephoneInput.disabled = true;
        telephoneInput.style.opacity = "0.6";
      }
        
        const modalTitle = document.querySelector("#add-patiente-modal h2");
        if (modalTitle) modalTitle.textContent = "Modifier une patiente";
        
        form.dataset.editPatienteId = patienteId;
      }
    }, 100);
  }
};

window.handleViewPatiente = function(patienteId) {
  const patientes = getPatientes();
  const patiente = patientes.find(p => p.id === patienteId);
  if (patiente) {
    alert(`Dossier de ${patiente.prenom} ${patiente.nom}\n\nÂge: ${patiente.age} ans\nVille: ${patiente.ville}\nDistance: ${patiente.distance_centre} km\nRisque: ${patiente.risque}`);
  }
};

window.handleDeletePatiente = function(patienteId, patienteName) {
  if (confirm(`Êtes-vous sûr de vouloir supprimer ${patienteName} ?\n\nCette action est irréversible.`)) {
    if (deletePatiente(patienteId)) {
      alert(`Patiente ${patienteName} supprimée avec succès.`);
      renderPatientes();
    } else {
      alert("Erreur lors de la suppression");
    }
  }
};

// Fonction pour gérer l'ajout/modification
window.handleAddPatienteSubmit = function(event) {
  event.preventDefault();
  
  const form = event.target;
  const editId = form.dataset.editPatienteId;
  
  // Récupérer l'ID du patient
  const patienteIdInput = document.querySelector("#patiente-id");
  const patienteId = patienteIdInput ? parseInt(patienteIdInput.value) : null;
  
  // Vérifier que l'ID est fourni (sauf en mode modification)
  if (!editId && (!patienteId || patienteId <= 0)) {
    alert("L'ID du patient est obligatoire. Veuillez saisir un ID valide.");
    if (patienteIdInput) {
      patienteIdInput.focus();
    }
    return;
  }
  
  const formData = {
    id: editId ? parseInt(editId) : patienteId, // Utiliser l'ID existant en modification, nouveau ID en ajout
    prenom: document.querySelector("#patiente-prenom")?.value || "",
    nom: document.querySelector("#patiente-nom")?.value || "",
    age: parseInt(document.querySelector("#patiente-age")?.value) || 0,
    ville: document.querySelector("#patiente-ville")?.value || "",
    distance_centre: parseFloat(document.querySelector("#patiente-distance")?.value) || 0,
    telephone: document.querySelector("#patiente-telephone")?.value || "",
    niveau_instruction: document.querySelector("#patiente-niveau-instruction")?.value || "",
    moyen_transport: document.querySelector("#patiente-transport")?.value || ""
  };
  
  try {
    if (editId) {
      // Modification
      updatePatiente(parseInt(editId), formData);
      alert("Patiente modifiée avec succès !");
    } else {
      // Ajout
      addPatiente(formData);
      alert("Patiente ajoutée avec succès !");
    }
  } catch (error) {
    alert("Erreur : " + error.message);
    return;
  }
  
  // Fermer le modal
  const modal = document.querySelector("#add-patiente-modal");
  if (modal) modal.classList.add("hidden");
  
  // Réinitialiser le formulaire
  form.reset();
  delete form.dataset.editPatienteId;
  
  // Réactiver le champ téléphone si désactivé
  const telephoneInput = document.querySelector("#patiente-telephone");
  if (telephoneInput) {
    telephoneInput.disabled = false;
    telephoneInput.style.opacity = "1";
  }
  
  // Réactiver le champ ID si désactivé
  const idInput = document.querySelector("#patiente-id");
  if (idInput) {
    idInput.disabled = false;
    idInput.style.opacity = "1";
    idInput.required = true;
  }
  
  // Recharger la liste
  renderPatientes();
};

// Fonction pour ouvrir le modal
window.openAddPatienteModal = function() {
  const modal = document.querySelector("#add-patiente-modal");
  if (modal) {
    modal.classList.remove("hidden");
    const form = document.querySelector("#add-patiente-form");
    if (form) {
      form.reset();
      delete form.dataset.editPatienteId;
      const modalTitle = document.querySelector("#add-patiente-modal h2");
      if (modalTitle) modalTitle.textContent = "Ajouter une patiente";
      
      // Réactiver le champ téléphone
      const telephoneInput = document.querySelector("#patiente-telephone");
      if (telephoneInput) {
        telephoneInput.disabled = false;
        telephoneInput.style.opacity = "1";
      }
      
      // Réactiver le champ ID
      const idInput = document.querySelector("#patiente-id");
      if (idInput) {
        idInput.disabled = false;
        idInput.style.opacity = "1";
        idInput.required = true;
      }
    }
  }
};

// Fonction pour fermer le modal
window.closeAddPatienteModal = function() {
  const modal = document.querySelector("#add-patiente-modal");
  if (modal) {
    modal.classList.add("hidden");
    const form = document.querySelector("#add-patiente-form");
    if (form) {
      form.reset();
      delete form.dataset.editPatienteId;
      
      // Réactiver le champ téléphone
      const telephoneInput = document.querySelector("#patiente-telephone");
      if (telephoneInput) {
        telephoneInput.disabled = false;
        telephoneInput.style.opacity = "1";
      }
      
      // Réactiver le champ ID
      const idInput = document.querySelector("#patiente-id");
      if (idInput) {
        idInput.disabled = false;
        idInput.style.opacity = "1";
        idInput.required = true;
      }
    }
  }
};

// Fonction pour calculer et afficher les indicateurs de suivi
function calculateDashboardStats() {
  const patientes = getPatientes();
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // Statistiques de base
  const totalPatientes = patientes.length;
  
  // Patientes par niveau de risque
  const risqueEleve = patientes.filter(p => p.risque === "élevé").length;
  const risqueMoyen = patientes.filter(p => p.risque === "moyen").length;
  const risqueFaible = patientes.filter(p => p.risque === "faible").length;
  
  // CPN en retard (prochaine_cpn est passée)
  let cpnRetard = 0;
  let cpnAujourdhui = 0;
  let jamaisVenue = 0;
  let consultationsAujourdhui = 0;
  
  patientes.forEach(patiente => {
    // Vérifier CPN
    if (patiente.prochaine_cpn) {
      try {
        const cpnDate = new Date(patiente.prochaine_cpn);
        if (!isNaN(cpnDate.getTime())) {
          cpnDate.setHours(0, 0, 0, 0);
          const daysDiff = Math.floor((today - cpnDate) / (1000 * 60 * 60 * 24));
          if (daysDiff > 0) {
            cpnRetard++;
          } else if (daysDiff === 0) {
            cpnAujourdhui++;
          }
        }
      } catch (e) {
        console.warn("Erreur date CPN:", e);
      }
    }
    
    // Vérifier dernière venue
    if (!patiente.derniere_venue) {
      jamaisVenue++;
    } else {
      try {
        const lastVisit = new Date(patiente.derniere_venue);
        if (!isNaN(lastVisit.getTime())) {
          lastVisit.setHours(0, 0, 0, 0);
          if (lastVisit.getTime() === today.getTime()) {
            consultationsAujourdhui++;
          }
        }
      } catch (e) {
        console.warn("Erreur date dernière venue:", e);
      }
    }
  });
  
  // Taux d'observance (approximation basée sur les CPN)
  const patientesAvecCPN = patientes.filter(p => p.prochaine_cpn || p.derniere_venue).length;
  const tauxObservance = totalPatientes > 0 
    ? Math.round((patientesAvecCPN / totalPatientes) * 100) 
    : 0;
  
  return {
    totalPatientes,
    risqueEleve,
    risqueMoyen,
    risqueFaible,
    cpnRetard,
    cpnAujourdhui,
    jamaisVenue,
    consultationsAujourdhui,
    tauxObservance
  };
}

// Fonction pour afficher les indicateurs
function renderDashboardStats() {
  const statsContent = document.querySelector("#dashboard-stats-content");
  if (!statsContent) return;
  
  try {
    const stats = calculateDashboardStats();
    
    statsContent.innerHTML = `
      <div class="stat-card" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border-radius: 0.5rem; padding: 0.75rem; box-shadow: 0 2px 4px rgba(0,0,0,0.1); min-width: 0;">
        <div class="stat-icon" style="font-size: 1.25rem; margin-bottom: 0.2rem;">👥</div>
        <div class="stat-value" style="font-size: 1.5rem; font-weight: 700; color: white; margin-bottom: 0.1rem;">${stats.totalPatientes}</div>
        <div class="stat-label" style="color: rgba(255,255,255,0.9); font-size: 0.7rem; font-weight: 500; line-height: 1.2;">Total patientes</div>
      </div>
      
      <div class="stat-card" style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; border-radius: 0.5rem; padding: 0.75rem; box-shadow: 0 2px 4px rgba(0,0,0,0.1); min-width: 0;">
        <div class="stat-icon" style="font-size: 1.25rem; margin-bottom: 0.2rem;">🔴</div>
        <div class="stat-value" style="font-size: 1.5rem; font-weight: 700; color: white; margin-bottom: 0.1rem;">${stats.risqueEleve}</div>
        <div class="stat-label" style="color: rgba(255,255,255,0.9); font-size: 0.7rem; font-weight: 500; line-height: 1.2;">Risque élevé</div>
      </div>
      
      <div class="stat-card" style="background: linear-gradient(135deg, #fa709a 0%, #fee140 100%); color: white; border-radius: 0.5rem; padding: 0.75rem; box-shadow: 0 2px 4px rgba(0,0,0,0.1); min-width: 0;">
        <div class="stat-icon" style="font-size: 1.25rem; margin-bottom: 0.2rem;">⚠️</div>
        <div class="stat-value" style="font-size: 1.5rem; font-weight: 700; color: white; margin-bottom: 0.1rem;">${stats.cpnRetard}</div>
        <div class="stat-label" style="color: rgba(255,255,255,0.9); font-size: 0.7rem; font-weight: 500; line-height: 1.2;">CPN en retard</div>
      </div>
      
      <div class="stat-card" style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); color: white; border-radius: 0.5rem; padding: 0.75rem; box-shadow: 0 2px 4px rgba(0,0,0,0.1); min-width: 0;">
        <div class="stat-icon" style="font-size: 1.25rem; margin-bottom: 0.2rem;">📅</div>
        <div class="stat-value" style="font-size: 1.5rem; font-weight: 700; color: white; margin-bottom: 0.1rem;">${stats.cpnAujourdhui}</div>
        <div class="stat-label" style="color: rgba(255,255,255,0.9); font-size: 0.7rem; font-weight: 500; line-height: 1.2;">CPN aujourd'hui</div>
      </div>
      
      <div class="stat-card" style="background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%); color: white; border-radius: 0.5rem; padding: 0.75rem; box-shadow: 0 2px 4px rgba(0,0,0,0.1); min-width: 0;">
        <div class="stat-icon" style="font-size: 1.25rem; margin-bottom: 0.2rem;">✅</div>
        <div class="stat-value" style="font-size: 1.5rem; font-weight: 700; color: white; margin-bottom: 0.1rem;">${stats.consultationsAujourdhui}</div>
        <div class="stat-label" style="color: rgba(255,255,255,0.9); font-size: 0.7rem; font-weight: 500; line-height: 1.2;">Consultations aujourd'hui</div>
      </div>
      
      <div class="stat-card" style="background: linear-gradient(135deg, #fa709a 0%, #fee140 100%); color: white; border-radius: 0.5rem; padding: 0.75rem; box-shadow: 0 2px 4px rgba(0,0,0,0.1); min-width: 0;">
        <div class="stat-icon" style="font-size: 1.25rem; margin-bottom: 0.2rem;">🚫</div>
        <div class="stat-value" style="font-size: 1.5rem; font-weight: 700; color: white; margin-bottom: 0.1rem;">${stats.jamaisVenue}</div>
        <div class="stat-label" style="color: rgba(255,255,255,0.9); font-size: 0.7rem; font-weight: 500; line-height: 1.2;">Jamais venues</div>
      </div>
      
      <div class="stat-card" style="background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%); color: white; border-radius: 0.5rem; padding: 0.75rem; box-shadow: 0 2px 4px rgba(0,0,0,0.1); min-width: 0;">
        <div class="stat-icon" style="font-size: 1.25rem; margin-bottom: 0.2rem;">📊</div>
        <div class="stat-value" style="font-size: 1.5rem; font-weight: 700; color: white; margin-bottom: 0.1rem;">${stats.tauxObservance}%</div>
        <div class="stat-label" style="color: rgba(255,255,255,0.9); font-size: 0.7rem; font-weight: 500; line-height: 1.2;">Taux d'observance</div>
      </div>
      
      <div class="stat-card" style="background: linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%); color: white; border-radius: 0.5rem; padding: 0.75rem; box-shadow: 0 2px 4px rgba(0,0,0,0.1); min-width: 0;">
        <div class="stat-icon" style="font-size: 1.25rem; margin-bottom: 0.2rem;">🟠</div>
        <div class="stat-value" style="font-size: 1.5rem; font-weight: 700; color: white; margin-bottom: 0.1rem;">${stats.risqueMoyen}</div>
        <div class="stat-label" style="color: rgba(255,255,255,0.9); font-size: 0.7rem; font-weight: 500; line-height: 1.2;">Risque modéré</div>
      </div>
    `;
  } catch (error) {
    console.error("Erreur lors du calcul des statistiques:", error);
    statsContent.innerHTML = `
      <div class="error-state" style="padding: 2rem; text-align: center; color: #dc2626;">
        <span class="error-icon" style="font-size: 2rem; display: block; margin-bottom: 0.5rem;">⚠️</span>
        <p>Erreur lors du chargement des indicateurs</p>
      </div>
    `;
  }
}

// Fonction pour rendre les statistiques détaillées
window.renderStatsPage = function() {
  const statsContent = document.querySelector("#stats-content");
  if (!statsContent) return;
  
  try {
    const patientes = getPatientes();
    const stats = calculateDashboardStats();
    const today = new Date();
    
    // Calculs supplémentaires
    const totalPatientes = patientes.length;
    const patientesParVille = {};
    const patientesParAge = { "18-25": 0, "26-30": 0, "31-35": 0, "36+": 0 };
    const patientesParDistance = { "0-2": 0, "2-5": 0, "5-10": 0, "10+": 0 };
    
    patientes.forEach(p => {
      // Par ville
      const ville = p.ville || "Non renseigné";
      patientesParVille[ville] = (patientesParVille[ville] || 0) + 1;
      
      // Par âge
      if (p.age >= 18 && p.age <= 25) patientesParAge["18-25"]++;
      else if (p.age >= 26 && p.age <= 30) patientesParAge["26-30"]++;
      else if (p.age >= 31 && p.age <= 35) patientesParAge["31-35"]++;
      else if (p.age > 35) patientesParAge["36+"]++;
      
      // Par distance
      const dist = p.distance_centre || 0;
      if (dist < 2) patientesParDistance["0-2"]++;
      else if (dist < 5) patientesParDistance["2-5"]++;
      else if (dist < 10) patientesParDistance["5-10"]++;
      else patientesParDistance["10+"]++;
    });
    
    // Taux de venue CPN
    const patientesAvecCPN = patientes.filter(p => p.prochaine_cpn || p.derniere_venue).length;
    const tauxVenueCPN = totalPatientes > 0 ? Math.round((patientesAvecCPN / totalPatientes) * 100) : 0;
    
    // Taux d'alerte (risque élevé + CPN en retard)
    const tauxAlerte = totalPatientes > 0 
      ? Math.round(((stats.risqueEleve + stats.cpnRetard) / totalPatientes) * 100) 
      : 0;
    
    statsContent.innerHTML = `
      <div class="stats-page-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1.5rem;">
        <!-- Statistiques principales -->
        <div class="stat-card-large" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border-radius: 0.75rem; padding: 1.5rem; grid-column: 1 / -1;">
          <h3 style="margin: 0 0 1rem 0; font-size: 1.25rem;">📊 Vue d'ensemble</h3>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 1rem;">
            <div>
              <div style="font-size: 2.5rem; font-weight: 700; margin-bottom: 0.25rem;">${stats.totalPatientes}</div>
              <div style="font-size: 0.9rem; opacity: 0.9;">Total patientes</div>
            </div>
            <div>
              <div style="font-size: 2.5rem; font-weight: 700; margin-bottom: 0.25rem;">${stats.risqueEleve}</div>
              <div style="font-size: 0.9rem; opacity: 0.9;">Risque élevé</div>
            </div>
            <div>
              <div style="font-size: 2.5rem; font-weight: 700; margin-bottom: 0.25rem;">${stats.cpnRetard}</div>
              <div style="font-size: 0.9rem; opacity: 0.9;">CPN en retard</div>
            </div>
            <div>
              <div style="font-size: 2.5rem; font-weight: 700; margin-bottom: 0.25rem;">${tauxVenueCPN}%</div>
              <div style="font-size: 0.9rem; opacity: 0.9;">Taux de venue CPN</div>
            </div>
          </div>
        </div>
        
        <!-- Répartition par risque -->
        <div class="stat-card" style="background: white; border: 1px solid #e5e7eb; border-radius: 0.75rem; padding: 1.5rem; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <h3 style="margin: 0 0 1rem 0; font-size: 1.1rem; color: #374151;">🎯 Répartition par niveau de risque</h3>
          <div style="margin-bottom: 1rem;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
              <span style="color: #6b7280; font-size: 0.9rem;">Risque élevé</span>
              <span style="font-weight: 600; color: #dc2626;">${stats.risqueEleve}</span>
            </div>
            <div style="background: #fee2e2; border-radius: 0.5rem; height: 8px; overflow: hidden;">
              <div style="background: #dc2626; height: 100%; width: ${totalPatientes > 0 ? (stats.risqueEleve / totalPatientes * 100) : 0}%; transition: width 0.3s ease;"></div>
            </div>
          </div>
          <div style="margin-bottom: 1rem;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
              <span style="color: #6b7280; font-size: 0.9rem;">Risque modéré</span>
              <span style="font-weight: 600; color: #d97706;">${stats.risqueMoyen}</span>
            </div>
            <div style="background: #fef3c7; border-radius: 0.5rem; height: 8px; overflow: hidden;">
              <div style="background: #d97706; height: 100%; width: ${totalPatientes > 0 ? (stats.risqueMoyen / totalPatientes * 100) : 0}%; transition: width 0.3s ease;"></div>
            </div>
          </div>
          <div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
              <span style="color: #6b7280; font-size: 0.9rem;">Risque faible</span>
              <span style="font-weight: 600; color: #059669;">${stats.risqueFaible}</span>
            </div>
            <div style="background: #d1fae5; border-radius: 0.5rem; height: 8px; overflow: hidden;">
              <div style="background: #059669; height: 100%; width: ${totalPatientes > 0 ? (stats.risqueFaible / totalPatientes * 100) : 0}%; transition: width 0.3s ease;"></div>
            </div>
          </div>
        </div>
        
        <!-- Répartition par âge -->
        <div class="stat-card" style="background: white; border: 1px solid #e5e7eb; border-radius: 0.75rem; padding: 1.5rem; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <h3 style="margin: 0 0 1rem 0; font-size: 1.1rem; color: #374151;">👤 Répartition par âge</h3>
          ${Object.entries(patientesParAge).map(([age, count]) => `
            <div style="margin-bottom: 1rem;">
              <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
                <span style="color: #6b7280; font-size: 0.9rem;">${age} ans</span>
                <span style="font-weight: 600; color: #2563eb;">${count}</span>
              </div>
              <div style="background: #eff6ff; border-radius: 0.5rem; height: 8px; overflow: hidden;">
                <div style="background: #2563eb; height: 100%; width: ${totalPatientes > 0 ? (count / totalPatientes * 100) : 0}%; transition: width 0.3s ease;"></div>
              </div>
            </div>
          `).join('')}
        </div>
        
        <!-- Répartition par distance -->
        <div class="stat-card" style="background: white; border: 1px solid #e5e7eb; border-radius: 0.75rem; padding: 1.5rem; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <h3 style="margin: 0 0 1rem 0; font-size: 1.1rem; color: #374151;">📍 Distance au centre</h3>
          ${Object.entries(patientesParDistance).map(([dist, count]) => `
            <div style="margin-bottom: 1rem;">
              <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
                <span style="color: #6b7280; font-size: 0.9rem;">${dist} km</span>
                <span style="font-weight: 600; color: #7c3aed;">${count}</span>
              </div>
              <div style="background: #f3e8ff; border-radius: 0.5rem; height: 8px; overflow: hidden;">
                <div style="background: #7c3aed; height: 100%; width: ${totalPatientes > 0 ? (count / totalPatientes * 100) : 0}%; transition: width 0.3s ease;"></div>
              </div>
            </div>
          `).join('')}
        </div>
        
        <!-- Indicateurs de performance -->
        <div class="stat-card" style="background: white; border: 1px solid #e5e7eb; border-radius: 0.75rem; padding: 1.5rem; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <h3 style="margin: 0 0 1rem 0; font-size: 1.1rem; color: #374151;">📈 Indicateurs clés</h3>
          <div style="margin-bottom: 1rem;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
              <span style="color: #6b7280; font-size: 0.9rem;">Taux d'observance</span>
              <span style="font-weight: 600; color: #059669;">${stats.tauxObservance}%</span>
            </div>
            <div style="background: #d1fae5; border-radius: 0.5rem; height: 12px; overflow: hidden;">
              <div style="background: linear-gradient(90deg, #059669, #10b981); height: 100%; width: ${stats.tauxObservance}%; transition: width 0.3s ease;"></div>
            </div>
          </div>
          <div style="margin-bottom: 1rem;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
              <span style="color: #6b7280; font-size: 0.9rem;">Taux d'alerte</span>
              <span style="font-weight: 600; color: ${tauxAlerte > 30 ? '#dc2626' : tauxAlerte > 15 ? '#d97706' : '#059669'};">${tauxAlerte}%</span>
            </div>
            <div style="background: #fee2e2; border-radius: 0.5rem; height: 12px; overflow: hidden;">
              <div style="background: linear-gradient(90deg, ${tauxAlerte > 30 ? '#dc2626' : tauxAlerte > 15 ? '#d97706' : '#059669'}, ${tauxAlerte > 30 ? '#ef4444' : tauxAlerte > 15 ? '#f59e0b' : '#10b981'}); height: 100%; width: ${tauxAlerte}%; transition: width 0.3s ease;"></div>
            </div>
          </div>
          <div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
              <span style="color: #6b7280; font-size: 0.9rem;">Consultations aujourd'hui</span>
              <span style="font-weight: 600; color: #2563eb;">${stats.consultationsAujourdhui}</span>
            </div>
            <div style="background: #eff6ff; border-radius: 0.5rem; height: 12px; overflow: hidden;">
              <div style="background: linear-gradient(90deg, #2563eb, #3b82f6); height: 100%; width: ${totalPatientes > 0 ? (stats.consultationsAujourdhui / totalPatientes * 100) : 0}%; transition: width 0.3s ease;"></div>
            </div>
          </div>
        </div>
        
        <!-- Répartition par ville -->
        <div class="stat-card" style="background: white; border: 1px solid #e5e7eb; border-radius: 0.75rem; padding: 1.5rem; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <h3 style="margin: 0 0 1rem 0; font-size: 1.1rem; color: #374151;">🏙️ Répartition par ville</h3>
          ${Object.entries(patientesParVille).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([ville, count]) => `
            <div style="margin-bottom: 0.75rem;">
              <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
                <span style="color: #6b7280; font-size: 0.9rem;">${ville}</span>
                <span style="font-weight: 600; color: #6366f1;">${count}</span>
              </div>
              <div style="background: #eef2ff; border-radius: 0.5rem; height: 8px; overflow: hidden;">
                <div style="background: #6366f1; height: 100%; width: ${totalPatientes > 0 ? (count / totalPatientes * 100) : 0}%; transition: width 0.3s ease;"></div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  } catch (error) {
    console.error("Erreur lors du calcul des statistiques:", error);
    statsContent.innerHTML = `
      <div class="error-state" style="padding: 2rem; text-align: center; color: #dc2626;">
        <span class="error-icon" style="font-size: 2rem; display: block; margin-bottom: 0.5rem;">⚠️</span>
        <p>Erreur lors du chargement des statistiques</p>
      </div>
    `;
  }
};

// Fonction pour rendre la page Performance
window.renderPerformancePage = function() {
  const performanceContent = document.querySelector("#performance-content");
  if (!performanceContent) return;
  
  try {
    const patientes = getPatientes();
    const stats = calculateDashboardStats();
    const totalPatientes = patientes.length;
    
    // Calcul du taux de venue
    const patientesAvecCPN = patientes.filter(p => p.prochaine_cpn || p.derniere_venue).length;
    const tauxVenue = totalPatientes > 0 ? Math.round((patientesAvecCPN / totalPatientes) * 100) : 0;
    
    // Évolution (simulation - basée sur les données actuelles)
    const evolutionRisque = {
      actuel: stats.risqueEleve,
      prevision: Math.max(0, stats.risqueEleve - 1) // Simulation
    };
    
    // Taux de suivi
    const patientesSuivies = patientes.filter(p => p.derniere_venue).length;
    const tauxSuivi = totalPatientes > 0 ? Math.round((patientesSuivies / totalPatientes) * 100) : 0;
    
    performanceContent.innerHTML = `
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1.5rem;">
        <!-- Taux de venue -->
        <div class="performance-card" style="background: white; border: 1px solid #e5e7eb; border-radius: 0.75rem; padding: 1.5rem; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <h3 style="margin: 0 0 1rem 0; font-size: 1.1rem; color: #374151;">📅 Taux de venue par mois</h3>
          <div style="margin-bottom: 1rem;">
            <div style="font-size: 3rem; font-weight: 700; color: #2563eb; margin-bottom: 0.5rem; text-align: center;">${tauxVenue}%</div>
            <div style="background: #eff6ff; border-radius: 0.75rem; height: 24px; overflow: hidden; position: relative;">
              <div style="background: linear-gradient(90deg, #2563eb, #3b82f6); height: 100%; width: ${tauxVenue}%; transition: width 0.5s ease; display: flex; align-items: center; justify-content: flex-end; padding-right: 0.5rem;">
                <span style="color: white; font-size: 0.75rem; font-weight: 600;">${tauxVenue}%</span>
              </div>
            </div>
          </div>
          <small style="color: #6b7280; font-size: 0.85rem;">Basé sur les CPN complétées et planifiées</small>
        </div>
        
        <!-- Évolution du risque -->
        <div class="performance-card" style="background: white; border: 1px solid #e5e7eb; border-radius: 0.75rem; padding: 1.5rem; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <h3 style="margin: 0 0 1rem 0; font-size: 1.1rem; color: #374151;">📊 Évolution du nombre de patientes à risque élevé</h3>
          <div style="text-align: center; margin-bottom: 1rem;">
            <div style="font-size: 3rem; font-weight: 700; color: #dc2626; margin-bottom: 0.5rem;">${evolutionRisque.actuel}</div>
            <div style="color: #6b7280; font-size: 0.9rem;">Patientes nécessitant une attention particulière</div>
          </div>
          <div style="background: #f3f4f6; border-radius: 0.5rem; padding: 1rem; margin-top: 1rem;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
              <span style="color: #6b7280; font-size: 0.9rem;">Tendance</span>
              <span style="font-weight: 600; color: ${evolutionRisque.actuel >= evolutionRisque.prevision ? '#dc2626' : '#059669'};">${evolutionRisque.actuel >= evolutionRisque.prevision ? '↗️ En hausse' : '↘️ En baisse'}</span>
            </div>
          </div>
        </div>
        
        <!-- Taux de suivi -->
        <div class="performance-card" style="background: white; border: 1px solid #e5e7eb; border-radius: 0.75rem; padding: 1.5rem; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <h3 style="margin: 0 0 1rem 0; font-size: 1.1rem; color: #374151;">✅ Taux de suivi</h3>
          <div style="margin-bottom: 1rem;">
            <div style="font-size: 3rem; font-weight: 700; color: #059669; margin-bottom: 0.5rem; text-align: center;">${tauxSuivi}%</div>
            <div style="background: #d1fae5; border-radius: 0.75rem; height: 24px; overflow: hidden; position: relative;">
              <div style="background: linear-gradient(90deg, #059669, #10b981); height: 100%; width: ${tauxSuivi}%; transition: width 0.5s ease; display: flex; align-items: center; justify-content: flex-end; padding-right: 0.5rem;">
                <span style="color: white; font-size: 0.75rem; font-weight: 600;">${tauxSuivi}%</span>
              </div>
            </div>
          </div>
          <small style="color: #6b7280; font-size: 0.85rem;">Patientes ayant effectué au moins une consultation</small>
        </div>
        
        <!-- Résumé des alertes -->
        <div class="performance-card" style="background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); border: 1px solid #fbbf24; border-radius: 0.75rem; padding: 1.5rem; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <h3 style="margin: 0 0 1rem 0; font-size: 1.1rem; color: #92400e;">⚠️ Alertes prioritaires</h3>
          <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem;">
            <div>
              <div style="font-size: 2rem; font-weight: 700; color: #dc2626; margin-bottom: 0.25rem;">${stats.cpnRetard}</div>
              <div style="color: #78350f; font-size: 0.85rem;">CPN en retard</div>
            </div>
            <div>
              <div style="font-size: 2rem; font-weight: 700; color: #dc2626; margin-bottom: 0.25rem;">${stats.jamaisVenue}</div>
              <div style="color: #78350f; font-size: 0.85rem;">Jamais venues</div>
            </div>
          </div>
        </div>
        
        <!-- Actions -->
        <div class="performance-card" style="background: white; border: 1px solid #e5e7eb; border-radius: 0.75rem; padding: 1.5rem; box-shadow: 0 2px 4px rgba(0,0,0,0.1); grid-column: 1 / -1;">
          <h3 style="margin: 0 0 1rem 0; font-size: 1.1rem; color: #374151;">📥 Export des données</h3>
          <div style="display: flex; gap: 1rem; flex-wrap: wrap;">
            <button class="btn-secondary" onclick="if(window.exportReport) window.exportReport('csv')" style="padding: 0.75rem 1.5rem; background: #2563eb; color: white; border: none; border-radius: 0.5rem; cursor: pointer; font-weight: 500; transition: background 0.2s;">
              📄 Exporter CSV
            </button>
            <button class="btn-secondary" onclick="alert('Fonctionnalité à venir')" style="padding: 0.75rem 1.5rem; background: #059669; color: white; border: none; border-radius: 0.5rem; cursor: pointer; font-weight: 500; transition: background 0.2s;">
              📊 Exporter Excel
            </button>
            <button class="btn-secondary" onclick="alert('Fonctionnalité à venir')" style="padding: 0.75rem 1.5rem; background: #dc2626; color: white; border: none; border-radius: 0.5rem; cursor: pointer; font-weight: 500; transition: background 0.2s;">
              📑 Exporter PDF
            </button>
          </div>
        </div>
      </div>
    `;
  } catch (error) {
    console.error("Erreur lors du calcul de la performance:", error);
    performanceContent.innerHTML = `
      <div class="error-state" style="padding: 2rem; text-align: center; color: #dc2626;">
        <span class="error-icon" style="font-size: 2rem; display: block; margin-bottom: 0.5rem;">⚠️</span>
        <p>Erreur lors du chargement des statistiques de performance</p>
      </div>
    `;
  }
};

// Fonction pour réinitialiser les filtres
window.resetAllFilters = function() {
  const riskFilter = document.querySelector("#risk-filter");
  const locationFilter = document.querySelector("#location-filter");
  const ageFilter = document.querySelector("#age-filter");
  const distanceFilter = document.querySelector("#distance-filter");
  
  if (riskFilter) riskFilter.value = "all";
  if (locationFilter) locationFilter.value = "all";
  if (ageFilter) ageFilter.value = "all";
  if (distanceFilter) distanceFilter.value = "all";
  
  renderPatientes();
};

// Fonction pour gérer les changements de filtres
window.handleFilterChange = function() {
  renderPatientes();
};

// Fonction pour exporter
window.exportReport = function(format) {
  const patientes = getPatientes();
  if (patientes.length === 0) {
    alert("Aucune patiente à exporter");
    return;
  }
  
  let csv = "Nom,Âge,Distance,Risque,Dernière venue,Prochaine CPN\n";
  patientes.forEach(p => {
    csv += `"${p.prenom} ${p.nom}",${p.age},${p.distance_centre || 0} km,"${p.risque}","${formatDate(p.derniere_venue)}","${formatDate(p.prochaine_cpn)}"\n`;
  });
  
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute("download", `patientes_${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  alert(`Export réussi ! ${patientes.length} patiente(s) exportée(s) en CSV.`);
};

// Initialisation au chargement de la page
document.addEventListener("DOMContentLoaded", () => {
  // Afficher les indicateurs de suivi (si on est sur le tableau de bord)
  renderDashboardStats();
  
  // Afficher les patientes (si on est sur la page mes-patientes)
  if (document.querySelector("#patient-table")) {
    renderPatientes();
  }
  
  // Configurer les event listeners pour les filtres
  const filters = ["risk-filter", "location-filter", "age-filter", "distance-filter"];
  filters.forEach(filterId => {
    const filter = document.querySelector(`#${filterId}`);
    if (filter) {
      filter.addEventListener("change", handleFilterChange);
    }
  });
  
  // Configurer le bouton d'ajout
  const addBtn = document.querySelector("#add-patiente-btn-section");
  if (addBtn) {
    addBtn.onclick = openAddPatienteModal;
  }
  
  // Configurer le bouton de réinitialisation
  const resetBtn = document.querySelector("#reset-filters-btn");
  if (resetBtn) {
    resetBtn.onclick = resetAllFilters;
  }
  
  // Configurer le bouton d'export
  const exportBtn = document.querySelector("#export-btn");
  if (exportBtn) {
    exportBtn.onclick = () => exportReport("csv");
  }
  
  // Configurer le formulaire
  const form = document.querySelector("#add-patiente-form");
  if (form) {
    form.addEventListener("submit", handleAddPatienteSubmit);
  }
  
  // Configurer le bouton de fermeture du modal
  const closeBtn = document.querySelector("#close-modal-btn, #cancel-patiente-btn");
  if (closeBtn) {
    closeBtn.onclick = closeAddPatienteModal;
  }
  
  // Rafraîchir les indicateurs toutes les 30 secondes
  if (document.querySelector("#dashboard-stats-content")) {
    setInterval(() => {
      renderDashboardStats();
    }, 30000);
  }
  
  console.log("✅ Version simplifiée chargée - Fonctionne sans serveur backend !");
  console.log(`📊 ${getPatientes().length} patiente(s) chargée(s) depuis le stockage local`);
});

