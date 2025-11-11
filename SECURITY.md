# Politique de sécurité

## 🔒 Signalement de vulnérabilités

Si vous découvrez une vulnérabilité de sécurité, veuillez **ne pas** créer une issue publique. Au lieu de cela, envoyez un email à [votre-email@example.com] avec les détails.

## 🛡️ Bonnes pratiques de sécurité

### Pour les développeurs

1. **Ne jamais commiter** :
   - Clés API
   - Mots de passe
   - Tokens d'authentification
   - Fichiers `.env`
   - Certificats privés

2. **Vérifier les dépendances** :
   ```bash
   pip list --outdated
   ```

3. **Valider les entrées utilisateur** :
   - Utiliser les schémas Pydantic
   - Sanitizer les données HTML
   - Vérifier les types de fichiers uploadés

4. **Authentification** :
   - Utiliser des mots de passe forts
   - Implémenter la rotation des tokens
   - Limiter les tentatives de connexion

### Pour les utilisateurs

1. **Mots de passe** :
   - Utilisez des mots de passe uniques et forts
   - Ne partagez jamais vos identifiants
   - Changez régulièrement vos mots de passe

2. **Données sensibles** :
   - Ne stockez pas de données médicales sensibles en clair
   - Utilisez HTTPS en production
   - Sauvegardez régulièrement vos données

## 🔐 Sécurité des données

- Les données sont chiffrées en transit (HTTPS)
- Les mots de passe sont hashés avec bcrypt
- Les tokens JWT ont une expiration
- Les sessions sont sécurisées

## 📋 Checklist de sécurité

- [ ] Pas de secrets dans le code
- [ ] Dépendances à jour
- [ ] Validation des entrées
- [ ] Authentification robuste
- [ ] HTTPS en production
- [ ] Logs sécurisés
- [ ] Sauvegardes régulières

## 🚨 Vulnérabilités connues

Aucune vulnérabilité connue actuellement.

Si vous en découvrez une, contactez-nous immédiatement.

