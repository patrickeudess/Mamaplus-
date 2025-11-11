# 📊 Implémentation de la Prédiction XGBoost - Page Estimation

## 🎯 Objectif

Permettre au professionnel de santé de renseigner manuellement les paramètres d'une patiente pour obtenir une prédiction de risque de non-observance basée sur le modèle XGBoost.

## ✅ Implémentations

### 1. Backend - Nouvel Endpoint POST

**Fichier** : `backend/app/api/prediction.py`

**Nouveau endpoint** : `POST /api/prediction/predict`

**Fonctionnalités** :
- Accepte les paramètres suivants :
  - `age` (int, 1-60) : Âge de la patiente
  - `gestite` (int, ≥1) : Nombre de grossesses
  - `parite` (int, ≥0) : Nombre d'accouchements
  - `distance_centre` (float, ≥0) : Distance au centre de santé (km)
  - `niveau_instruction` (str) : aucun, primaire, secondaire, superieur
  - `moyen_transport` (str) : pieds, velo, moto, voiture, transport_public, autre
  - `cpn_completes` (int, ≥0, default=0) : Nombre de CPN complétées
  - `cpn_manquees` (int, ≥0, default=0) : Nombre de CPN manquées
  - `cpn_total` (int, optionnel) : Total CPN (calculé automatiquement si non fourni)

**Retour** : `PredictionRisk` avec :
- `risk_score` : Score de risque (0-1)
- `risk_level` : Niveau (faible, moyen, élevé)
- `confidence` : Confiance de la prédiction
- `recommendations` : Liste de recommandations
- `available` : Disponibilité du modèle
- `features_used` : Paramètres utilisés pour la prédiction

**Validation** :
- Validation des valeurs avec Pydantic
- Vérification des valeurs catégorielles (niveau_instruction, moyen_transport)
- Calcul automatique du total CPN si non fourni

### 2. Frontend - Formulaire de Prédiction

**Fichier** : `frontend/estimation.html`

**Formulaire organisé en 3 sections** :

#### Section 1 : Informations personnelles
- Âge (obligatoire)
- Gestité (obligatoire)
- Parité (obligatoire)

#### Section 2 : Localisation et accessibilité
- Distance au centre (obligatoire)
- Niveau d'instruction (obligatoire)
- Moyen de transport (obligatoire)

#### Section 3 : Historique des CPN
- CPN complétées (optionnel, default=0)
- CPN manquées (optionnel, default=0)
- Total CPN (optionnel, calculé automatiquement)

**Fonctionnalités** :
- Validation côté client avant envoi
- Indicateur de chargement pendant le calcul
- Messages d'erreur/succès
- Bouton de réinitialisation
- Affichage des résultats avec code couleur selon le niveau de risque

### 3. Affichage des Résultats

**Composants affichés** :
- **Niveau de risque** : Faible 🟢, Moyen 🟠, Élevé 🔴
- **Score de risque** : Pourcentage et valeur décimale
- **Confiance** : Pourcentage de confiance
- **Recommandations** : Liste personnalisée selon le niveau de risque
- **Paramètres utilisés** : JSON des features utilisées (pour debug/transparence)

**Styles** :
- Cartes colorées selon le niveau de risque
- Badge avec le score en pourcentage
- Liste des recommandations formatée
- Affichage des paramètres utilisés en format JSON

## 🔧 Utilisation

### Pour le Professionnel

1. Accéder à la page "Estimation" depuis le tableau de bord professionnel
2. Remplir le formulaire avec les paramètres de la patiente
3. Cliquer sur "📊 Calculer la prédiction"
4. Consulter les résultats :
   - Niveau de risque (faible/moyen/élevé)
   - Score de risque en pourcentage
   - Recommandations personnalisées
   - Paramètres utilisés pour la prédiction

### Exemple de Requête API

```json
POST /api/prediction/predict
{
  "age": 28,
  "gestite": 2,
  "parite": 1,
  "distance_centre": 5.5,
  "niveau_instruction": "secondaire",
  "moyen_transport": "moto",
  "cpn_completes": 3,
  "cpn_manquees": 1
}
```

### Exemple de Réponse

```json
{
  "risk_score": 0.456,
  "risk_level": "moyen",
  "confidence": 0.85,
  "recommendations": [
    "Risque moyen de non-observance",
    "Renforcer les rappels (SMS + WhatsApp)",
    "Vérifier l'accessibilité au centre de santé",
    "Sensibiliser sur l'importance des CPN"
  ],
  "available": true,
  "features_used": {
    "age": 28,
    "gestite": 2,
    "parite": 1,
    "distance_centre": 5.5,
    "niveau_instruction": 2,
    "moyen_transport": 2,
    "cpn_completes": 3,
    "cpn_manquees": 1,
    "cpn_total": 4,
    "taux_observance": 0.75
  }
}
```

## 📋 Paramètres du Modèle XGBoost

Le modèle utilise les features suivantes (définies dans `backend/app/services/prediction.py`) :

1. **age** : Âge de la patiente
2. **gestite** : Nombre de grossesses
3. **parite** : Nombre d'accouchements
4. **distance_centre** : Distance au centre de santé (km)
5. **niveau_instruction** : Encodé (0=aucun, 1=primaire, 2=secondaire, 3=supérieur)
6. **moyen_transport** : Encodé (0=pieds, 1=vélo, 2=moto, 3=voiture, 4=transport_public, 5=autre)
7. **cpn_completes** : Nombre de CPN complétées
8. **cpn_manquees** : Nombre de CPN manquées
9. **cpn_total** : Total de CPN
10. **taux_observance** : Calculé automatiquement (cpn_completes / cpn_total)

## 🎨 Interface Utilisateur

### Design
- Formulaire organisé en sections claires
- Champs obligatoires marqués avec `*`
- Validation en temps réel
- Indicateurs visuels (couleurs, emojis) pour les résultats
- Responsive design pour mobile

### Expérience Utilisateur
- Messages d'erreur clairs
- Indicateur de chargement pendant le calcul
- Scroll automatique vers les résultats
- Bouton de réinitialisation pour tester plusieurs scénarios

## 🔒 Sécurité

- Validation des données côté serveur
- Vérification des types et valeurs
- Gestion des erreurs avec messages explicites
- Authentification désactivée en mode développement (à réactiver en production)

## 📝 Notes Techniques

- Le modèle XGBoost doit être présent dans `MAMAplus_XGBoost_model.joblib`
- Le label encoder doit être présent dans `MAMAplus_labelEncoder.joblib`
- Si le modèle n'est pas disponible, une prédiction par défaut est retournée
- Les recommandations sont générées automatiquement selon le niveau de risque

## 🚀 Prochaines Étapes Possibles

1. **Sauvegarde des prédictions** : Enregistrer les prédictions dans la base de données
2. **Historique** : Afficher l'historique des prédictions effectuées
3. **Comparaison** : Comparer plusieurs scénarios côte à côte
4. **Export** : Exporter les résultats en PDF/Excel
5. **Graphiques** : Visualiser l'évolution du risque selon les paramètres

---

**Date** : $(date)
**Statut** : ✅ Implémentation complète et fonctionnelle

