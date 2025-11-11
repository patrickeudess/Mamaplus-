const chatbotMessages = document.querySelector("#chatbot-messages");
const chatbotInput = document.querySelector("#chatbot-input");
const chatbotSendBtn = document.querySelector("#chatbot-send-btn");
const suggestionBtns = document.querySelectorAll(".suggestion-btn");

// Réponses prédéfinies du chatbot
const chatbotResponses = {
  "nutrition": "Pendant la grossesse, il est important de consommer des aliments riches en acide folique, fer, calcium et protéines. Privilégiez les fruits et légumes, les protéines maigres, et les produits laitiers. Évitez l'alcool, la caféine excessive, et les aliments crus.",
  "signes": "Les signes d'alerte à surveiller incluent : saignements vaginaux, douleurs abdominales intenses, perte de liquide amniotique, absence de mouvements du bébé, maux de tête sévères, ou fièvre élevée. En cas de doute, consultez immédiatement un professionnel de santé.",
  "consultation": "Vous devriez consulter un médecin immédiatement en cas de saignements, douleurs intenses, perte de liquide, ou absence de mouvements du bébé. Pour les urgences, appelez le +223 70 00 00 00.",
  "exercices": "Pendant la grossesse, les exercices doux sont recommandés : marche, natation, yoga prénatal. Évitez les sports de contact et les activités à haut risque. Consultez votre médecin avant de commencer un nouveau programme d'exercice."
};

function addMessage(text, isBot = false) {
  const messageDiv = document.createElement("div");
  messageDiv.className = `chatbot-message ${isBot ? "bot" : "user"}`;
  
  if (isBot) {
    messageDiv.innerHTML = `
      <div class="message-avatar">🤖</div>
      <div class="message-content">
        <p>${text}</p>
      </div>
    `;
  } else {
    messageDiv.innerHTML = `
      <div class="message-content user-message">
        <p>${text}</p>
      </div>
    `;
  }
  
  chatbotMessages.appendChild(messageDiv);
  chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
}

function getBotResponse(question) {
  const lowerQuestion = question.toLowerCase();
  
  // Recherche de mots-clés
  if (lowerQuestion.includes("nutrition") || lowerQuestion.includes("aliment") || lowerQuestion.includes("manger")) {
    return chatbotResponses.nutrition;
  }
  
  if (lowerQuestion.includes("signe") || lowerQuestion.includes("alerte") || lowerQuestion.includes("danger")) {
    return chatbotResponses.signes;
  }
  
  if (lowerQuestion.includes("consult") || lowerQuestion.includes("médecin") || lowerQuestion.includes("docteur")) {
    return chatbotResponses.consultation;
  }
  
  if (lowerQuestion.includes("exercice") || lowerQuestion.includes("sport") || lowerQuestion.includes("activité")) {
    return chatbotResponses.exercices;
  }
  
  // Réponse par défaut
  return "Merci pour votre question. Pour des informations plus spécifiques, je vous recommande de consulter votre professionnel de santé. Vous pouvez également consulter la page 'Conseils' pour plus d'informations sur la nutrition et les signes d'alerte.";
}

function sendMessage() {
  const question = chatbotInput.value.trim();
  if (!question) return;
  
  // Ajouter le message de l'utilisateur
  addMessage(question, false);
  chatbotInput.value = "";
  
  // Simuler un délai de réponse
  setTimeout(() => {
    const response = getBotResponse(question);
    addMessage(response, true);
  }, 500);
}

// Événements
if (chatbotSendBtn) {
  chatbotSendBtn.addEventListener("click", sendMessage);
}

if (chatbotInput) {
  chatbotInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      sendMessage();
    }
  });
}

// Suggestions
suggestionBtns.forEach(btn => {
  btn.addEventListener("click", () => {
    const question = btn.getAttribute("data-question");
    chatbotInput.value = question;
    sendMessage();
  });
});

