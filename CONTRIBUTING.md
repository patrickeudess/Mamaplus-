# Guide de contribution à MAMA+

Merci de votre intérêt pour contribuer à MAMA+ ! Ce document fournit des directives pour contribuer au projet.

## 🚀 Comment contribuer

### Signaler un bug

Si vous trouvez un bug :

1. Vérifiez qu'il n'a pas déjà été signalé dans les [Issues](https://github.com/votre-username/mama-plus/issues)
2. Créez une nouvelle issue avec :
   - Un titre clair et descriptif
   - Une description détaillée du problème
   - Les étapes pour reproduire le bug
   - Le comportement attendu vs le comportement actuel
   - Votre environnement (OS, version Python, navigateur, etc.)

### Proposer une fonctionnalité

1. Vérifiez qu'elle n'a pas déjà été proposée
2. Créez une issue avec le label "enhancement"
3. Décrivez clairement :
   - Le problème que cela résout
   - La solution proposée
   - Les avantages

### Soumettre du code

1. **Fork** le dépôt
2. **Clone** votre fork :
   ```bash
   git clone https://github.com/votre-username/mama-plus.git
   cd mama-plus
   ```
3. **Créez une branche** :
   ```bash
   git checkout -b feature/ma-nouvelle-fonctionnalite
   ```
4. **Faites vos modifications**
5. **Testez** vos changements
6. **Commitez** avec des messages clairs :
   ```bash
   git commit -m "Ajout: Description de la fonctionnalité"
   ```
7. **Push** vers votre fork :
   ```bash
   git push origin feature/ma-nouvelle-fonctionnalite
   ```
8. **Ouvrez une Pull Request**

## 📝 Standards de code

### Python

- Suivez [PEP 8](https://www.python.org/dev/peps/pep-0008/)
- Utilisez des noms de variables descriptifs
- Ajoutez des docstrings pour les fonctions et classes
- Maximum 100 caractères par ligne

### JavaScript

- Utilisez des noms de variables descriptifs
- Commentez le code complexe
- Suivez les conventions ES6+

### HTML/CSS

- Utilisez une indentation cohérente (2 espaces)
- Utilisez des noms de classes sémantiques
- Respectez l'accessibilité (ARIA labels, etc.)

## 🧪 Tests

Avant de soumettre :

- Testez vos modifications manuellement
- Vérifiez qu'il n'y a pas d'erreurs de console
- Testez sur différents navigateurs si possible

## 📋 Checklist pour les Pull Requests

- [ ] Le code suit les standards du projet
- [ ] Les tests passent
- [ ] La documentation est à jour
- [ ] Les messages de commit sont clairs
- [ ] Le code est commenté si nécessaire

## 🎯 Types de contributions

- 🐛 **Bug fixes** : Corriger des erreurs
- ✨ **Nouvelles fonctionnalités** : Ajouter des capacités
- 📚 **Documentation** : Améliorer la documentation
- 🎨 **UI/UX** : Améliorer l'interface
- ⚡ **Performance** : Optimiser le code
- 🔧 **Refactoring** : Améliorer la structure du code

## 💬 Communication

- Soyez respectueux et constructif
- Utilisez les issues pour les discussions
- Répondez aux commentaires sur vos PRs

Merci de contribuer à MAMA+ ! 🙏

