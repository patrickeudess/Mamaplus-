# 🎯 Version Simplifiée - Sans Serveur Backend

## ✨ Fonctionnalités

Cette version fonctionne **entièrement dans le navigateur** sans avoir besoin de démarrer un serveur backend !

### ✅ Ce qui fonctionne :
- ✅ **Affichage de la liste des patientes**
- ✅ **Ajout de nouvelles patientes**
- ✅ **Modification des patientes existantes**
- ✅ **Suppression de patientes**
- ✅ **Filtres** (Risque, Localité, Âge, Distance)
- ✅ **Export en CSV**
- ✅ **Appel téléphonique** (clic sur 📞)
- ✅ **Stockage persistant** (les données sont sauvegardées dans le navigateur)

### 📦 Stockage
Les données sont stockées dans le **localStorage** du navigateur, ce qui signifie :
- ✅ Les données persistent même après fermeture du navigateur
- ✅ Pas besoin de serveur
- ✅ Fonctionne hors ligne
- ⚠️ Les données sont spécifiques à chaque navigateur

## 🚀 Utilisation

### 1. Ouvrir la page
Ouvrez simplement `frontend/mes-patientes.html` dans votre navigateur.

**C'est tout !** Pas besoin de démarrer un serveur.

### 2. Ajouter une patiente
1. Cliquez sur le bouton **"+ Ajouter une patiente"**
2. Remplissez le formulaire
3. Cliquez sur **"Créer la patiente"**
4. La patiente apparaît immédiatement dans la liste !

### 3. Modifier une patiente
1. Cliquez sur le bouton **✏️ Modifier** dans la colonne Actions
2. Modifiez les informations
3. Cliquez sur **"Créer la patiente"** (le bouton change de texte)
4. Les modifications sont sauvegardées !

### 4. Supprimer une patiente
1. Cliquez sur le bouton **🗑️ Supprimer** dans la colonne Actions
2. Confirmez la suppression
3. La patiente disparaît de la liste

### 5. Filtrer
Utilisez les filtres en haut de la page pour filtrer les patientes par :
- Risque (Élevé, Modéré, Faible)
- Localité
- Âge
- Distance

### 6. Exporter
Cliquez sur le bouton **"📊 Exporter"** pour télécharger toutes les patientes en CSV.

## 🔄 Basculer entre les versions

### Version Simplifiée (actuelle)
```html
<script src="app-professionnel-simple.js" defer></script>
```

### Version avec Backend
```html
<script src="app-professionnel.js" defer></script>
```

Pour basculer, modifiez simplement la ligne dans `mes-patientes.html`.

## 📊 Données par défaut

La version simplifiée inclut 3 patientes d'exemple :
- Awa Koffi (28 ans, Bamako)
- Mariam Kouadio (19 ans, Bamako)
- Fatou Diallo (32 ans, Sikasso)

## 💾 Sauvegarde des données

Les données sont automatiquement sauvegardées dans le **localStorage** du navigateur.

### Pour sauvegarder vos données :
1. Ouvrez la console du navigateur (F12)
2. Tapez : `localStorage.getItem('mama_patientes_data')`
3. Copiez le résultat (c'est du JSON)
4. Sauvegardez-le dans un fichier texte

### Pour restaurer vos données :
1. Ouvrez la console du navigateur (F12)
2. Collez vos données JSON
3. Tapez : `localStorage.setItem('mama_patientes_data', 'VOS_DONNEES_JSON')`
4. Rechargez la page

## ⚠️ Limitations

- Les données sont stockées localement (spécifiques au navigateur)
- Pas de synchronisation entre plusieurs ordinateurs
- Pas de sauvegarde automatique dans le cloud
- Calcul du risque simplifié (basé sur l'âge, la distance, et le niveau d'instruction)

## 🎯 Quand utiliser cette version ?

✅ **Utilisez la version simplifiée si** :
- Vous voulez tester rapidement l'interface
- Vous n'avez pas besoin de serveur backend
- Vous travaillez seul ou en local
- Vous voulez une démo fonctionnelle

✅ **Utilisez la version avec backend si** :
- Vous avez besoin de plusieurs utilisateurs
- Vous voulez une sauvegarde centralisée
- Vous avez besoin de fonctionnalités avancées (prédictions ML, etc.)
- C'est une application de production

## 🔧 Personnalisation

Vous pouvez modifier les données par défaut dans `app-professionnel-simple.js` :
```javascript
const DEFAULT_PATIENTES = [
  // Ajoutez vos patientes ici
];
```

## 📝 Notes

- Cette version est parfaite pour les démos et les prototypes
- Toutes les fonctionnalités principales sont disponibles
- Les données persistent entre les sessions
- Fonctionne sur tous les navigateurs modernes

