const tabBtns = document.querySelectorAll(".tab-btn-enhanced, .tab-btn");
const tabContents = document.querySelectorAll(".tab-content");

// Gestion des onglets
tabBtns.forEach(btn => {
  btn.addEventListener("click", () => {
    const targetTab = btn.getAttribute("data-tab");
    
    // Désactiver tous les onglets
    tabBtns.forEach(b => b.classList.remove("active"));
    tabContents.forEach(c => c.classList.remove("active"));
    
    // Activer l'onglet sélectionné
    btn.classList.add("active");
    const targetContent = document.querySelector(`#${targetTab}-tab`);
    if (targetContent) {
      targetContent.classList.add("active");
    }
    
    // Scroll vers le haut de la section
    targetContent.scrollIntoView({ behavior: "smooth", block: "start" });
  });
});

// Gestion des FAQ (expand/collapse)
document.addEventListener("DOMContentLoaded", () => {
  const faqItems = document.querySelectorAll(".faq-item");
  faqItems.forEach(item => {
    const question = item.querySelector(".faq-question");
    if (question) {
      question.addEventListener("click", () => {
        const isActive = item.classList.contains("active");
        // Fermer tous les autres
        faqItems.forEach(i => i.classList.remove("active"));
        // Ouvrir celui-ci si il n'était pas actif
        if (!isActive) {
          item.classList.add("active");
        }
      });
    }
  });
});

