# 🚀 Guide de démarrage rapide - Version CSV

## Pourquoi utiliser CSV ?

✅ **Beaucoup plus simple** :
- Pas besoin d'installer PostgreSQL ou SQLite
- Pas de configuration de base de données
- Les données sont directement visibles dans Excel
- Facile à modifier manuellement si besoin

## 📦 Installation

```bash
# Installer les dépendances
pip install fastapi uvicorn pandas passlib[bcrypt] pydantic
```

## ▶️ Démarrer le serveur

```bash
# Depuis le dossier backend
cd backend
uvicorn main_csv:app --reload
```

Le serveur démarre sur **http://localhost:8000**

## 📁 Où sont les données ?

Les fichiers CSV sont créés automatiquement dans le dossier `data/` :
```
mama+/
  ├── backend/
  ├── frontend/
  └── data/              ← Ici !
      ├── patientes.csv
      ├── users.csv
      ├── cpn.csv
      ├── consultations.csv
      └── vaccinations.csv
```

## 🔍 Voir les données

Vous pouvez ouvrir les fichiers CSV directement dans :
- **Excel** : Double-cliquez sur le fichier
- **Google Sheets** : Importez le fichier
- **LibreOffice Calc** : Ouvrez le fichier

## 🆚 Comparaison

| Aspect | Version SQL | Version CSV |
|--------|-------------|-------------|
| Installation | ❌ Complexe (PostgreSQL) | ✅ Simple (juste Python) |
| Configuration | ❌ Base de données à configurer | ✅ Aucune configuration |
| Voir les données | ❌ Outil spécialisé | ✅ Excel/Google Sheets |
| Modifier les données | ❌ Requiert SQL | ✅ Excel directement |
| Performance (< 500 lignes) | ✅ Rapide | ✅ Rapide |
| Performance (> 1000 lignes) | ✅ Rapide | ⚠️ Peut être lent |

## 💡 Recommandation

**Utilisez CSV si** :
- Vous avez moins de 500 patientes
- C'est un prototype ou une démo
- Vous voulez quelque chose de simple
- Vous avez besoin de modifier les données facilement

**Utilisez SQL si** :
- Vous avez beaucoup de données
- Vous avez besoin de performances élevées
- C'est une application de production

## 🔄 Changer de version

Pour utiliser la version CSV au lieu de SQL :

1. **Arrêtez le serveur SQL** (si en cours d'exécution)

2. **Démarrez le serveur CSV** :
   ```bash
   uvicorn main_csv:app --reload
   ```

3. **C'est tout !** L'API fonctionne exactement de la même manière.

## 📝 Notes importantes

- Les fichiers CSV sont créés automatiquement au premier démarrage
- Les IDs sont générés automatiquement
- Les dates sont au format ISO (YYYY-MM-DD)
- Les valeurs nulles sont des cellules vides

## 🆘 Problèmes courants

**"Module not found"** :
```bash
pip install -r requirements.txt
```

**"Port already in use"** :
```bash
# Utilisez un autre port
uvicorn main_csv:app --reload --port 8001
```

**"Permission denied"** :
- Vérifiez que vous avez les droits d'écriture dans le dossier `data/`

