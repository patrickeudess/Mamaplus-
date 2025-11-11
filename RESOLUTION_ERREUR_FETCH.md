# Résolution de l'erreur "Failed to fetch"

## 🔍 Diagnostic

L'erreur "Failed to fetch" indique que le navigateur ne peut pas contacter le serveur backend. Voici comment résoudre le problème :

## ✅ Vérifications à faire

### 1. Vérifier que le serveur backend est démarré

Ouvrez un terminal et exécutez :

```bash
cd backend
uvicorn main:app --reload
```

Vous devriez voir :
```
INFO:     Uvicorn running on http://127.0.0.1:8000 (Press CTRL+C to quit)
INFO:     Started reloader process
INFO:     Started server process
INFO:     Waiting for application startup.
INFO:     Application startup complete.
```

### 2. Tester l'API directement

Ouvrez votre navigateur et allez sur :
- **http://localhost:8000/health** → Devrait retourner `{"status": "healthy"}`
- **http://localhost:8000/docs** → Devrait afficher la documentation Swagger

### 3. Vérifier la console du navigateur

1. Ouvrez la page d'inscription
2. Appuyez sur **F12** pour ouvrir les outils de développement
3. Allez dans l'onglet **Console**
4. Essayez de créer un compte
5. Regardez les messages dans la console :
   - ✅ "Serveur backend accessible" = Le serveur fonctionne
   - ❌ "Serveur backend non accessible" = Le serveur n'est pas démarré

### 4. Vérifier l'onglet Network

1. Dans les outils de développement (F12)
2. Allez dans l'onglet **Network** (Réseau)
3. Essayez de créer un compte
4. Regardez la requête vers `/api/auth/register` :
   - Si elle est en **rouge** = Erreur de connexion
   - Si elle est en **rouge avec CORS** = Problème CORS
   - Si elle est en **jaune/rouge avec 404** = URL incorrecte

## 🔧 Solutions

### Solution 1 : Le serveur n'est pas démarré

**Symptôme** : Message "Failed to fetch" immédiatement

**Solution** :
```bash
cd backend
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### Solution 2 : Problème de port

**Symptôme** : Le serveur tourne sur un autre port

**Solution** : Vérifiez dans `frontend/app-home.js` que `API_BASE` pointe vers le bon port :
```javascript
const API_BASE = "http://localhost:8000/api";
```

### Solution 3 : Problème CORS

**Symptôme** : Erreur CORS dans la console

**Solution** : J'ai déjà modifié `backend/main.py` pour autoriser toutes les origines. Redémarrez le serveur après cette modification.

### Solution 4 : Ouvrir le fichier HTML via un serveur local

**Symptôme** : Vous ouvrez `index.html` directement (file://)

**Solution** : Utilisez un serveur HTTP local :

```bash
# Option 1 : Python
cd frontend
python -m http.server 3000

# Option 2 : Node.js (si installé)
npx http-server frontend -p 3000
```

Puis ouvrez : **http://localhost:3000/index.html**

## 📝 Checklist de vérification

- [ ] Le serveur backend est démarré (`uvicorn main:app --reload`)
- [ ] L'URL http://localhost:8000/health fonctionne
- [ ] La console du navigateur ne montre pas d'erreur CORS
- [ ] Le fichier HTML est ouvert via un serveur HTTP (pas file://)
- [ ] Le port 8000 n'est pas utilisé par un autre programme

## 🆘 Si le problème persiste

1. **Vérifiez les logs du serveur** : Regardez le terminal où tourne uvicorn
2. **Vérifiez les logs du navigateur** : Console (F12) → onglet Console
3. **Testez l'API directement** : http://localhost:8000/docs → Testez `/api/auth/register`
4. **Vérifiez le firewall** : Assurez-vous que le port 8000 n'est pas bloqué

## 💡 Test rapide

Dans la console du navigateur (F12), exécutez :

```javascript
fetch('http://localhost:8000/health')
  .then(r => r.json())
  .then(data => console.log('✅ Serveur OK:', data))
  .catch(err => console.error('❌ Erreur:', err));
```

Si cela fonctionne, le problème vient du code d'inscription.
Si cela ne fonctionne pas, le serveur n'est pas accessible.

