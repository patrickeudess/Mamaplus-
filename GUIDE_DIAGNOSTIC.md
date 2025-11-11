# Guide de diagnostic - Problème de chargement

## 🔍 Problème observé
Les interfaces tournent en chargement mais rien ne s'affiche.

## ✅ Solutions appliquées

J'ai amélioré la gestion des erreurs dans les fichiers frontend pour qu'ils affichent maintenant des messages d'erreur clairs au lieu de rester en chargement indéfiniment.

## 🔧 Étapes de diagnostic

### 1. Vérifier que le serveur backend est démarré

**Ouvrez un terminal PowerShell** et exécutez :

```powershell
.\start-server.ps1
```

Vous devriez voir :
```
Démarrage du serveur MAMA+...
Activation de l'environnement virtuel...
Démarrage du serveur sur http://localhost:8000
```

### 2. Vérifier que le serveur répond

Ouvrez votre navigateur et allez sur :
- http://localhost:8000/health

Vous devriez voir : `{"status":"healthy"}`

### 3. Vérifier la console du navigateur

1. Ouvrez les outils de développement (F12)
2. Allez dans l'onglet **Console**
3. Rechargez la page
4. Regardez les messages d'erreur

Les erreurs possibles :
- `Failed to fetch` → Le serveur backend n'est pas accessible
- `404 Not Found` → Une route API n'existe pas
- `500 Internal Server Error` → Erreur côté serveur
- `CORS error` → Problème de configuration CORS

### 4. Vérifier les appels API

Dans l'onglet **Network** (Réseau) des outils de développement :
1. Rechargez la page
2. Filtrez par "XHR" ou "Fetch"
3. Regardez les requêtes vers `localhost:8000`
4. Vérifiez le statut de chaque requête :
   - ✅ 200 = Succès
   - ❌ 404 = Route non trouvée
   - ❌ 500 = Erreur serveur
   - ❌ (failed) = Serveur non accessible

## 🐛 Problèmes courants et solutions

### Problème 1 : "Le serveur backend n'est pas accessible"

**Solution :**
1. Vérifiez que le serveur est démarré (étape 1)
2. Vérifiez que le port 8000 n'est pas utilisé par un autre programme
3. Vérifiez votre pare-feu Windows

### Problème 2 : Erreur 404 sur `/api/dashboard/stats`

**Solution :**
- Vérifiez que le fichier `backend/main.py` inclut bien le router dashboard
- Vérifiez que le serveur a bien redémarré après les modifications

### Problème 3 : Erreur 500 (Internal Server Error)

**Solution :**
1. Regardez les logs du serveur dans le terminal
2. Vérifiez que la base de données est accessible
3. Vérifiez que les modèles ML sont présents à la racine du projet

### Problème 4 : Erreur CORS

**Solution :**
- Le fichier `backend/main.py` devrait avoir `allow_origins=["*"]` en mode développement
- Vérifiez que vous ouvrez le fichier HTML via `http://localhost` et non `file://`

## 📝 Messages d'erreur améliorés

Maintenant, au lieu de rester en chargement, les interfaces affichent :
- ⚠️ Messages d'erreur clairs avec le détail du problème
- ℹ️ Messages informatifs quand il n'y a pas de données
- ✅ Indicateurs de chargement uniquement pendant le chargement réel

## 🔄 Test rapide

1. **Démarrez le serveur** : `.\start-server.ps1`
2. **Ouvrez** : `frontend/index.html` dans votre navigateur
3. **Ouvrez la console** (F12) pour voir les messages
4. **Rechargez** la page

Si vous voyez des messages d'erreur dans la console, partagez-les et je pourrai vous aider à les résoudre.

## 💡 Astuce

Si le problème persiste, essayez :
1. Arrêter le serveur (Ctrl+C)
2. Redémarrer le serveur
3. Vider le cache du navigateur (Ctrl+Shift+Delete)
4. Recharger la page (Ctrl+F5)

