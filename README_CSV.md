# MAMA+ - Version CSV (Stockage simplifié)

## 🎯 Pourquoi utiliser CSV/Excel ?

### ✅ Avantages
- **Pas de base de données** : Pas besoin d'installer PostgreSQL ou SQLite
- **Facile à lire/modifier** : Vous pouvez ouvrir les fichiers CSV dans Excel
- **Pas de migrations** : Pas besoin de gérer les schémas de base de données
- **Simple à déployer** : Juste copier les fichiers CSV
- **Export facile** : Les données sont déjà dans un format exportable
- **Idéal pour prototype** : Parfait pour tester rapidement

### ⚠️ Inconvénients
- **Performance limitée** : Avec beaucoup de données (>1000 lignes), peut être lent
- **Pas de relations complexes** : Les relations entre tables sont gérées manuellement
- **Pas de transactions** : Pas de garantie d'intégrité en cas d'erreur
- **Pas de validation automatique** : La validation doit être faite dans le code

## 🚀 Démarrage rapide

### 1. Installer les dépendances
```bash
pip install -r requirements.txt
```

### 2. Démarrer le serveur CSV
```bash
uvicorn main_csv:app --reload
```

Le serveur démarrera sur `http://localhost:8000`

### 3. Accéder à l'API
- **API Docs** : http://localhost:8000/docs
- **Health Check** : http://localhost:8000/health

## 📁 Structure des fichiers CSV

Les données sont stockées dans le dossier `data/` :
- `data/patientes.csv` - Liste des patientes
- `data/users.csv` - Utilisateurs (professionnels et patientes)
- `data/cpn.csv` - Consultations prénatales (CPN)
- `data/consultations.csv` - Consultations médicales
- `data/vaccinations.csv` - Vaccinations

## 🔄 Migration depuis la version SQL

Si vous avez déjà des données dans une base de données SQL, vous pouvez les exporter en CSV et les placer dans le dossier `data/`.

## 📊 Visualiser les données

Vous pouvez ouvrir les fichiers CSV directement dans :
- **Excel** : Ouvrir le fichier CSV
- **Google Sheets** : Importer le fichier CSV
- **LibreOffice Calc** : Ouvrir le fichier CSV

## 🆚 Comparaison : CSV vs Base de données

| Fonctionnalité | CSV | Base de données |
|----------------|-----|------------------|
| Installation | ✅ Aucune | ❌ PostgreSQL/SQLite |
| Lecture manuelle | ✅ Excel | ❌ Outil spécialisé |
| Performance (petit volume) | ✅ Rapide | ✅ Rapide |
| Performance (grand volume) | ⚠️ Lent | ✅ Rapide |
| Relations complexes | ⚠️ Manuelles | ✅ Automatiques |
| Transactions | ❌ Non | ✅ Oui |
| Validation | ⚠️ Code | ✅ Schéma |
| Export | ✅ Natif | ⚠️ Requis |

## 💡 Recommandation

- **Utilisez CSV si** :
  - Vous avez moins de 500 patientes
  - C'est un prototype ou une démo
  - Vous voulez une solution simple
  - Vous avez besoin de modifier les données manuellement

- **Utilisez une base de données si** :
  - Vous avez beaucoup de données (>1000 patientes)
  - Vous avez besoin de performances élevées
  - Vous avez besoin de relations complexes
  - C'est une application de production

## 🔧 Configuration

Par défaut, les fichiers CSV sont créés dans le dossier `data/` à la racine du projet.

Pour changer l'emplacement, modifiez `STORAGE_DIR` dans `backend/app/storage_csv.py`.

## 📝 Notes

- Les fichiers CSV sont créés automatiquement au premier démarrage
- Les IDs sont générés automatiquement (incrémentation)
- Les dates sont stockées au format ISO (YYYY-MM-DD)
- Les valeurs nulles sont représentées par des cellules vides

