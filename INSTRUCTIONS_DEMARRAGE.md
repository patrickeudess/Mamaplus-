# 🚀 Instructions pour démarrer le serveur backend

## ⚡ Méthode la plus simple (Windows)

**Double-cliquez sur le fichier :**
```
DEMARRER_SERVEUR.bat
```

C'est tout ! Le serveur va démarrer automatiquement.

## 📝 Méthode manuelle

### 1. Ouvrir un terminal

**Windows :**
- Appuyez sur `Windows + R`
- Tapez `cmd` et appuyez sur Entrée
- Ou ouvrez PowerShell

### 2. Aller dans le dossier backend

```bash
cd "C:\Users\DELL LATITUDE\Desktop\Projet perso\mama+\backend"
```

### 3. Installer les dépendances (première fois seulement)

```bash
pip install fastapi uvicorn pandas passlib[bcrypt] pydantic python-multipart
```

### 4. Démarrer le serveur

**Version CSV (Recommandée - Plus simple) :**
```bash
uvicorn main_csv:app --reload
```

**Version SQL (Si vous avez une base de données) :**
```bash
uvicorn main:app --reload
```

## ✅ Vérifier que ça fonctionne

Une fois le serveur démarré, vous devriez voir :
```
INFO:     Uvicorn running on http://127.0.0.1:8000
INFO:     Application startup complete.
```

### Tester dans le navigateur :

1. Ouvrez : http://localhost:8000/health
   - Vous devriez voir : `{"status":"healthy","storage":"CSV"}`

2. Ouvrez : http://localhost:8000/docs
   - Vous devriez voir la documentation de l'API

## 🔧 Problèmes courants

### "Python n'est pas reconnu"
- Installez Python depuis https://www.python.org/
- Cochez "Add Python to PATH" lors de l'installation

### "Module not found"
```bash
pip install fastapi uvicorn pandas passlib[bcrypt] pydantic python-multipart
```

### "Port 8000 already in use"
Un autre programme utilise le port 8000. Utilisez un autre port :
```bash
uvicorn main_csv:app --reload --port 8001
```

Puis modifiez `frontend/app-professionnel.js` ligne 1 :
```javascript
const API_BASE = "http://localhost:8001/api";
```

### Le serveur démarre mais l'application ne se connecte pas
1. Vérifiez que le serveur tourne sur http://localhost:8000
2. Ouvrez la console du navigateur (F12) et regardez les erreurs
3. Vérifiez que l'URL dans `app-professionnel.js` est correcte

## 📊 Quelle version utiliser ?

### Version CSV (`main_csv.py`) - ✅ RECOMMANDÉE
- ✅ Pas besoin de base de données
- ✅ Plus simple à démarrer
- ✅ Les données sont dans des fichiers CSV (facile à voir)
- ✅ Parfait pour commencer

### Version SQL (`main.py`)
- Nécessite PostgreSQL ou SQLite
- Plus complexe à configurer
- Meilleures performances pour beaucoup de données

## 🎯 Prochaines étapes

Une fois le serveur démarré :

1. **Ouvrez l'application** : Ouvrez `frontend/index.html` dans votre navigateur
2. **Testez l'API** : Allez sur http://localhost:8000/docs
3. **Ajoutez une patiente** : Utilisez l'interface web

## 💡 Astuce

Gardez le terminal ouvert pendant que vous utilisez l'application. Si vous fermez le terminal, le serveur s'arrête.

Pour arrêter le serveur : Appuyez sur `Ctrl+C` dans le terminal.

