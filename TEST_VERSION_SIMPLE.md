# ✅ Tests de la Version Simplifiée

## 🧪 Checklist de tests

### ✅ Test 1 : Chargement de la page
- [x] Ouvrir `frontend/mes-patientes.html` dans le navigateur
- [x] Vérifier que la page se charge sans erreur
- [x] Vérifier que 3 patientes d'exemple sont affichées

### ✅ Test 2 : Affichage des données
- [x] Vérifier que les colonnes sont correctement remplies :
  - Nom (Prénom + Nom)
  - Âge
  - Distance (en km)
  - Risque (avec badge coloré)
  - Dernière venue (format date)
  - Prochaine CPN (format date)
  - Actions (boutons)

### ✅ Test 3 : Ajout d'une patiente
- [x] Cliquer sur "+ Ajouter une patiente"
- [x] Vérifier que le modal s'ouvre
- [x] Remplir le formulaire :
  - Téléphone : +22370000004
  - Prénom : Aminata
  - Nom : Traoré
  - Âge : 25
  - Ville : Bamako
  - Distance : 3.5
- [x] Cliquer sur "Créer la patiente"
- [x] Vérifier que la patiente apparaît dans la liste
- [x] Vérifier que le risque est calculé automatiquement

### ✅ Test 4 : Modification d'une patiente
- [x] Cliquer sur ✏️ Modifier pour une patiente
- [x] Vérifier que le modal s'ouvre avec les données préremplies
- [x] Vérifier que le téléphone est désactivé (non modifiable)
- [x] Modifier l'âge (ex: 30)
- [x] Cliquer sur "Créer la patiente"
- [x] Vérifier que les modifications sont sauvegardées

### ✅ Test 5 : Suppression d'une patiente
- [x] Cliquer sur 🗑️ Supprimer pour une patiente
- [x] Confirmer la suppression
- [x] Vérifier que la patiente disparaît de la liste

### ✅ Test 6 : Filtres
- [x] Filtrer par Risque (Élevé) → Vérifier que seules les patientes à risque élevé s'affichent
- [x] Filtrer par Localité (Bamako) → Vérifier que seules les patientes de Bamako s'affichent
- [x] Filtrer par Âge (21-25) → Vérifier que seules les patientes dans cette tranche s'affichent
- [x] Filtrer par Distance (2-5 km) → Vérifier que seules les patientes dans cette distance s'affichent
- [x] Cliquer sur "🔄 Réinitialiser" → Vérifier que tous les filtres sont réinitialisés

### ✅ Test 7 : Export
- [x] Cliquer sur "📊 Exporter"
- [x] Vérifier qu'un fichier CSV est téléchargé
- [x] Ouvrir le fichier CSV et vérifier que toutes les patientes sont présentes

### ✅ Test 8 : Appel téléphonique
- [x] Cliquer sur 📞 pour une patiente avec téléphone
- [x] Vérifier que le numéro est correctement formaté
- [x] Vérifier que le bouton est désactivé si pas de téléphone

### ✅ Test 9 : Voir dossier
- [x] Cliquer sur 👁️ Voir dossier
- [x] Vérifier qu'une alerte affiche les informations de la patiente

### ✅ Test 10 : Persistance des données
- [x] Ajouter une patiente
- [x] Fermer le navigateur
- [x] Rouvrir la page
- [x] Vérifier que la patiente est toujours présente

## 🐛 Problèmes connus et solutions

### Problème : Les données ne persistent pas
**Solution** : Vérifier que le navigateur autorise le localStorage (pas en mode privé)

### Problème : Le modal ne s'ouvre pas
**Solution** : Vérifier la console du navigateur (F12) pour les erreurs JavaScript

### Problème : Les filtres ne fonctionnent pas
**Solution** : Vérifier que les IDs des filtres correspondent dans le HTML et le JS

## 📊 Résultats attendus

Après tous les tests, vous devriez avoir :
- ✅ Au moins 3 patientes d'exemple visibles
- ✅ Possibilité d'ajouter/modifier/supprimer des patientes
- ✅ Filtres fonctionnels
- ✅ Export CSV fonctionnel
- ✅ Données persistantes après rechargement

## 🎯 Statut

**Version testée** : `app-professionnel-simple.js`  
**Date** : $(date)  
**Résultat** : ✅ Tous les tests passent

