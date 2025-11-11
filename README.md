# MAMA+ – Système de suivi des consultations prénatales

[![Python](https://img.shields.io/badge/Python-3.10+-blue.svg)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-green.svg)](https://fastapi.tiangolo.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

## 📋 Description

**MAMA+** est un système numérique complet destiné aux équipes de santé en Afrique de l'Ouest pour améliorer le suivi des consultations prénatales (CPN). Il répond aux obstacles identifiés : rappels manquants, données dispersées et difficulté à suivre les patientes entre les niveaux de soins.

### 🎯 Objectifs

- **Améliorer l'observance** des consultations prénatales
- **Centraliser les données** médicales des patientes
- **Faciliter le suivi** par les professionnels de santé
- **Sensibiliser les patientes** via un chatbot éducatif
- **Prédire les risques** grâce à l'intelligence artificielle

## ✨ Fonctionnalités principales

### 👥 Interface Professionnelle
- **Gestion des patientes** : Enregistrement complet avec profil socio-démographique, antécédents, données d'accès aux soins
- **Tableau de bord** : Indicateurs de suivi en temps réel (risques, CPN, consultations)
- **Alertes prioritaires** : Détection automatique des cas nécessitant une attention urgente
- **Statistiques et Performance** : Analyses détaillées avec visualisations
- **Estimation de risques** : Prédiction basée sur un modèle XGBoost
- **Géovisualisation** : Carte interactive des patientes

### 👤 Interface Patiente
- **Dossier médical complet** : Historique des consultations, CPN et vaccinations
- **Rappels personnalisés** : Prochaines consultations, CPN et vaccinations
- **Conseils et sensibilisation** : Informations sur le suivi prénatal, nutrition, bien-être
- **Chatbot éducatif** : Réponses en français, bambara ou wolof

### 🤖 Intelligence Artificielle
- **Prédiction de risques** : Modèle XGBoost pour estimer les risques de complications
- **Chatbot intelligent** : Réponses contextuelles aux questions fréquentes

## 🏗️ Architecture

```
mama+
├── backend/              # API FastAPI
│   ├── app/
│   │   ├── api/         # Routes REST
│   │   ├── services/    # Services métier
│   │   ├── models.py    # Modèles SQLAlchemy
│   │   ├── schemas.py   # Schémas Pydantic
│   │   └── storage_csv.py # Stockage CSV (version simplifiée)
│   ├── main.py          # Point d'entrée (PostgreSQL)
│   ├── main_csv.py      # Point d'entrée (CSV)
│   └── requirements.txt
├── frontend/            # Interface web
│   ├── index.html       # Page d'accueil
│   ├── index-professionnel.html  # Tableau de bord professionnel
│   ├── index-patriente.html      # Interface patiente
│   ├── mes-patientes.html        # Liste des patientes
│   ├── estimation.html           # Prédiction de risques
│   ├── statistiques.html         # Statistiques et Performance
│   ├── alertes.html              # Alertes prioritaires
│   ├── app-professionnel-simple.js # Version simplifiée (localStorage)
│   ├── app-professionnel.js      # Version complète (API)
│   └── styles.css
└── README.md
```

## 🚀 Démarrage rapide

### Option 1 : Version simplifiée (sans serveur backend)

La version simplifiée fonctionne entièrement dans le navigateur avec `localStorage` :

1. Ouvrez `frontend/index.html` dans votre navigateur
2. C'est tout ! Aucune installation nécessaire

**Avantages** :
- ✅ Fonctionne immédiatement
- ✅ Aucune dépendance
- ✅ Parfait pour la démonstration
- ✅ Données stockées localement

### Option 2 : Version complète (avec serveur backend)

#### Prérequis

- Python 3.10 ou supérieur
- PostgreSQL 12+ (optionnel, peut utiliser SQLite ou CSV)

#### Installation

1. **Cloner le dépôt**
```bash
git clone https://github.com/votre-username/mama-plus.git
cd mama-plus
```

2. **Créer un environnement virtuel**
```bash
python -m venv venv
# Windows
venv\Scripts\activate
# Linux/Mac
source venv/bin/activate
```

3. **Installer les dépendances**
```bash
cd backend
pip install -r requirements.txt
```

4. **Configuration**

**Option A : Avec PostgreSQL**
```bash
# Créer un fichier .env dans backend/
DATABASE_URL=postgresql://user:password@localhost:5432/mamaplus
SECRET_KEY=votre-cle-secrete-jwt
```

**Option B : Avec CSV (plus simple)**
```bash
# Utiliser main_csv.py au lieu de main.py
uvicorn main_csv:app --reload
```

5. **Démarrer le serveur**

**Windows (méthode simple)**
```bash
# Double-cliquez sur DEMARRER_SERVEUR.bat
# Ou depuis le terminal :
cd backend
uvicorn main_csv:app --reload
```

**Linux/Mac**
```bash
cd backend
uvicorn main_csv:app --reload
```

6. **Ouvrir le frontend**

Ouvrez `frontend/index.html` dans votre navigateur ou servez-le :
```bash
cd frontend
python -m http.server 3000
# Puis rendez-vous sur http://localhost:3000
```

## 📚 Documentation

- [Guide de démarrage rapide](GUIDE_DEMARRAGE_CSV.md)
- [Version simplifiée](README_VERSION_SIMPLE.md)
- [Intégration du modèle ML](INTEGRATION_MODELE_ML.md)
- [Prédiction XGBoost](PREDICTION_XGBOOST.md)

## 🔧 Configuration

### Variables d'environnement

Créez un fichier `.env` dans `backend/` :

```env
# Base de données
DATABASE_URL=postgresql://user:password@localhost:5432/mamaplus

# JWT
SECRET_KEY=votre-cle-secrete-tres-longue-et-aleatoire

# Twilio (optionnel pour les SMS/WhatsApp)
TWILIO_ACCOUNT_SID=votre_sid
TWILIO_AUTH_TOKEN=votre_token
TWILIO_PHONE_NUMBER=+223XXXXXXXX
```

### API Documentation

Une fois le serveur démarré :

- **Swagger UI** : http://localhost:8000/docs
- **ReDoc** : http://localhost:8000/redoc

## 🧪 Tests

```bash
cd backend
pytest
```

## 📊 Fonctionnalités détaillées

### Gestion des patientes
- Enregistrement avec ID unique obligatoire
- Modification et suppression
- Filtres avancés (risque, localisation, âge, distance, dernière venue)
- Export CSV

### Prédiction de risques
- Modèle XGBoost entraîné
- Paramètres : âge, gestité, parité, distance, niveau d'instruction, etc.
- Score de risque et recommandations

### Statistiques
- Vue d'ensemble avec indicateurs clés
- Répartition par niveau de risque, âge, distance, ville
- Taux d'observance et d'alerte
- Performance et tendances

## 🤝 Contribution

Les contributions sont les bienvenues ! Pour contribuer :

1. Fork le projet
2. Créez une branche pour votre fonctionnalité (`git checkout -b feature/AmazingFeature`)
3. Committez vos changements (`git commit -m 'Add some AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrez une Pull Request

## 📝 Licence

Ce projet est sous licence MIT. Voir le fichier [LICENSE](LICENSE) pour plus de détails.

## 👥 Auteurs

- Équipe MAMA+ - Amélioration du suivi prénatal

## 🙏 Remerciements

- FastAPI pour le framework backend
- XGBoost pour le modèle de prédiction
- Tous les contributeurs qui ont aidé à améliorer ce projet

## 📞 Support

Pour toute question ou problème :
- Ouvrez une [issue](https://github.com/votre-username/mama-plus/issues)
- Consultez la [documentation](docs/)

## 🔮 Roadmap

- [ ] Intégration complète avec Twilio pour les SMS/WhatsApp
- [ ] Application mobile (React Native)
- [ ] Synchronisation cloud
- [ ] Multi-utilisateurs avec gestion des rôles
- [ ] Export PDF des rapports
- [ ] Graphiques avancés avec Chart.js
- [ ] Mode hors-ligne amélioré

---

**Note** : Ce projet est un prototype en développement actif. Les fonctionnalités peuvent évoluer.
