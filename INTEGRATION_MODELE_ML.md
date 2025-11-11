# Intégration du Modèle de Prédiction XGBoost

## ✅ Modifications effectuées

### 1. Dépendances ajoutées (`backend/requirements.txt`)
- `joblib==1.3.2` : Pour charger les modèles sauvegardés
- `xgboost==2.0.3` : Framework de machine learning
- `pandas==2.1.4` : Manipulation de données
- `numpy==1.26.2` : Calculs numériques

### 2. Service de prédiction (`backend/app/services/prediction.py`)
- Chargement des modèles XGBoost et LabelEncoder depuis les fichiers `.joblib`
- Fonction `prepare_features()` : Prépare les données d'une patiente pour la prédiction
- Fonction `predict_risk()` : Effectue la prédiction et retourne :
  - Score de risque (0-1)
  - Niveau de risque (faible, moyen, élevé)
  - Recommandations personnalisées
  - Confiance de la prédiction

### 3. API Endpoints (`backend/app/api/prediction.py`)
- `GET /api/prediction/patientes/{patiente_id}/risk` : Prédiction pour une patiente spécifique
- `GET /api/prediction/patientes/risks` : Prédictions pour toutes les patientes (triées par risque)

### 4. Intégration dans les dossiers (`backend/app/api/patientes.py`)
- Le dossier patiente (`GET /api/patientes/{id}/dossier`) inclut maintenant la prédiction de risque

### 5. Schémas Pydantic (`backend/app/schemas.py`)
- `PredictionRisk` : Schéma pour les prédictions
- `DossierPatienteResponse` : Mis à jour pour inclure `prediction_risk`

### 6. Interface utilisateur (`frontend/`)
- Affichage visuel des prédictions dans le dossier patiente
- Codes couleur selon le niveau de risque (vert/jaune/rouge)
- Affichage des recommandations

## 📊 Fonctionnalités

### Prédiction de risque de non-observance
Le modèle utilise les features suivantes :
- **Données démographiques** : âge, gestité, parité
- **Accessibilité** : distance au centre, moyen de transport
- **Éducation** : niveau d'instruction
- **Historique** : nombre de CPN complétées, manquées, total

### Niveaux de risque
- **Faible** (< 33%) : Suivi standard, rappels normaux
- **Moyen** (33-66%) : Renforcement des rappels, sensibilisation
- **Élevé** (> 66%) : Rappels multiples, contact direct, évaluation des barrières

## 🚀 Utilisation

### Installation des dépendances
```bash
cd backend
pip install -r requirements.txt
```

### Vérification des fichiers modèles
Assurez-vous que les fichiers suivants sont présents à la racine du projet :
- `MAMAplus_XGBoost_model.joblib`
- `MAMAplus_labelEncoder.joblib`

### Test de l'API
```bash
# Démarrer le serveur
uvicorn main:app --reload

# Tester la prédiction pour une patiente
curl -X GET "http://localhost:8000/api/prediction/patientes/1/risk" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Obtenir toutes les prédictions
curl -X GET "http://localhost:8000/api/prediction/patientes/risks" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Interface web
1. Connectez-vous au tableau de bord
2. Cliquez sur une patiente dans le tableau
3. Le dossier s'affiche avec la prédiction de risque en bas

## 🔧 Personnalisation

### Ajuster les seuils de risque
Modifiez les seuils dans `backend/app/services/prediction.py` :
```python
if risk_score < 0.33:  # Seuil faible
    risk_level = "faible"
elif risk_score < 0.66:  # Seuil moyen
    risk_level = "moyen"
else:  # Seuil élevé
    risk_level = "élevé"
```

### Modifier les recommandations
Les recommandations sont définies dans la fonction `predict_risk()` selon le niveau de risque.

### Ajouter des features
Pour utiliser d'autres features du modèle :
1. Modifier `prepare_features()` dans `prediction.py`
2. Ajouter les colonnes correspondantes dans le DataFrame

## ⚠️ Notes importantes

1. **Modèle non disponible** : Si les fichiers `.joblib` ne sont pas trouvés, le système retourne une prédiction par défaut avec `available: false`

2. **Performance** : Les modèles sont chargés une seule fois au premier appel (cache en mémoire)

3. **Format des données** : Le modèle attend un format spécifique. Si le format change, il faudra adapter `prepare_features()`

4. **Logs** : Les erreurs de chargement et de prédiction sont loggées dans les logs de l'application

## 📝 Prochaines étapes possibles

- [ ] Ajouter un endpoint pour mettre à jour le modèle sans redémarrer
- [ ] Implémenter un système de cache pour les prédictions
- [ ] Ajouter des métriques de performance du modèle
- [ ] Créer un dashboard de monitoring des prédictions
- [ ] Intégrer les prédictions dans le système de rappels automatiques

