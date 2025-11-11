# 🚀 Guide de démarrage du serveur backend MAMA+

## ⚡ Démarrage rapide

### Option 1 : Script automatique (Recommandé)

**Windows :**
```bash
start_server.bat
```

**Linux/Mac :**
```bash
chmod +x start_server.sh
./start_server.sh
```

### Option 2 : Commande manuelle

#### Version CSV (Plus simple - Recommandé pour débuter)
```bash
cd backend
uvicorn main_csv:app --reload
```

#### Version SQL (Version complète)
```bash
cd backend
uvicorn main:app --reload
```

## 📋 Prérequis

### 1. Python installé
Vérifiez que Python est installé :
```bash
python --version
# ou
python3 --version
```

### 2. Installer les dépendances
```bash
cd backend
pip install -r requirements.txt
```

Ou installation minimale pour CSV :
```bash
pip install fastapi uvicorn pandas passlib[bcrypt] pydantic python-multipart
```

## 🔍 Vérifier que le serveur fonctionne

Une fois démarré, vous devriez voir :
```
INFO:     Uvicorn running on http://127.0.0.1:8000 (Press CTRL+C to quit)
INFO:     Started reloader process
INFO:     Started server process
INFO:     Waiting for application startup.
INFO:     Application startup complete.
```

### Tester l'API

1. **Health check** : http://localhost:8000/health
2. **Documentation API** : http://localhost:8000/docs
3. **Racine** : http://localhost:8000/

## ⚠️ Problèmes courants

### "Module not found"
```bash
pip install -r requirements.txt
```

### "Port already in use"
Le port 8000 est déjà utilisé. Utilisez un autre port :
```bash
uvicorn main_csv:app --reload --port 8001
```

Puis modifiez `frontend/app-professionnel.js` :
```javascript
const API_BASE = "http://localhost:8001/api";
```

### "Permission denied" (Linux/Mac)
```bash
chmod +x start_server.sh
```

### "Python not found"
- Windows : Ajoutez Python au PATH
- Linux/Mac : Utilisez `python3` au lieu de `python`

## 🆚 Quelle version choisir ?

### Version CSV (`main_csv.py`)
✅ **Utilisez si** :
- Vous avez moins de 500 patientes
- C'est un prototype ou une démo
- Vous voulez quelque chose de simple
- Pas de base de données installée

**Avantages** :
- Pas besoin de base de données
- Les données sont dans des fichiers CSV (facile à voir dans Excel)
- Démarrage très rapide

### Version SQL (`main.py`)
✅ **Utilisez si** :
- Vous avez beaucoup de données
- Vous avez besoin de performances
- C'est une application de production
- Vous avez PostgreSQL/SQLite installé

**Avantages** :
- Meilleures performances
- Relations complexes entre données
- Transactions et intégrité des données

## 📝 Notes

- Le serveur se recharge automatiquement quand vous modifiez le code (`--reload`)
- Les données CSV sont créées automatiquement dans le dossier `data/`
- Pour arrêter le serveur, appuyez sur `Ctrl+C`

## 🔗 URLs importantes

- **API** : http://localhost:8000/api
- **Documentation** : http://localhost:8000/docs
- **Health check** : http://localhost:8000/health
