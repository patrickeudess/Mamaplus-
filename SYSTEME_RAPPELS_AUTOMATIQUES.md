# 🔔 Système de Rappels Automatiques MAMA+

## 📋 Vue d'ensemble

Le système de rappels automatiques MAMA+ utilise **APScheduler** pour envoyer automatiquement des rappels aux patientes concernant leurs consultations prénatales (CPN). Le système fonctionne en arrière-plan et envoie des rappels à différents moments pour maximiser l'observance des consultations.

## ✨ Fonctionnalités

### Types de rappels automatiques

1. **Rappels 48h avant** 📅
   - Envoi : SMS
   - Fréquence : Toutes les heures
   - Message : "Votre rendez-vous CPN est prévu dans 2 jours..."

2. **Rappels 24h avant** ⏰
   - Envoi : SMS ou WhatsApp (selon ce qui a déjà été envoyé)
   - Fréquence : Toutes les heures
   - Message : "Votre rendez-vous CPN est prévu demain..."

3. **Rappels du jour** 🎯
   - Envoi : WhatsApp
   - Fréquence : Toutes les 2 heures entre 8h et 20h
   - Message : "Votre rendez-vous CPN est prévu aujourd'hui à..."

4. **Rappels CPN manquées** ⚠️
   - Envoi : SMS
   - Fréquence : Une fois par jour à 9h
   - Message : "Vous avez manqué votre rendez-vous CPN. Merci de nous contacter pour reprogrammer..."

## 🏗️ Architecture

### Composants

1. **Service Scheduler** (`backend/app/services/scheduler.py`)
   - Gestion du scheduler APScheduler
   - Fonctions de vérification et envoi de rappels
   - Configuration des tâches planifiées

2. **Service Notifications** (`backend/app/services/notifications.py`)
   - Envoi des messages via Twilio
   - Construction des messages personnalisés
   - Gestion des différents canaux (SMS, WhatsApp, USSD)

3. **API Scheduler** (`backend/app/api/scheduler.py`)
   - Endpoints pour gérer le scheduler
   - Exécution manuelle des tâches
   - Statut du scheduler

### Intégration

Le scheduler est automatiquement démarré au démarrage de l'application FastAPI via les événements `startup` et `shutdown` :

```python
@app.on_event("startup")
async def startup_event():
    setup_scheduled_jobs()

@app.on_event("shutdown")
async def shutdown_event():
    stop_scheduler()
```

## 📅 Planification des tâches

### Configuration actuelle

| Tâche | Fréquence | Heure | Description |
|-------|-----------|-------|-------------|
| Rappels 48h | Toutes les heures | :00 | Vérifie les CPN dans 48h |
| Rappels 24h | Toutes les heures | :00 | Vérifie les CPN dans 24h |
| Rappels du jour | Toutes les 2h | 8h-20h | Vérifie les CPN du jour |
| CPN manquées | Quotidien | 9h00 | Vérifie les CPN manquées |

### Personnalisation

Pour modifier la planification, éditez la fonction `setup_scheduled_jobs()` dans `backend/app/services/scheduler.py` :

```python
# Exemple : Rappels 48h toutes les 2 heures
sched.add_job(
    check_and_send_reminders_48h,
    trigger=CronTrigger(minute=0, hour="*/2"),  # Toutes les 2 heures
    id="reminders_48h",
    name="Rappels CPN 48h avant",
    replace_existing=True,
)
```

## 🔧 Configuration

### Dépendances

Le système nécessite `APScheduler` qui est déjà inclus dans `requirements.txt` :

```txt
apscheduler==3.10.4
```

### Variables d'environnement

Pour que les rappels soient réellement envoyés (et non en mode mock), configurez Twilio :

```env
TWILIO_ACCOUNT_SID=votre_sid
TWILIO_AUTH_TOKEN=votre_token
TWILIO_PHONE_NUMBER=+223XXXXXXXX
```

Sans ces variables, le système fonctionnera en mode mock (les messages seront loggés mais pas envoyés).

## 📡 API Endpoints

### Obtenir le statut du scheduler

```http
GET /api/scheduler/status
Authorization: Bearer <token>
```

**Réponse :**
```json
{
  "success": true,
  "scheduler": {
    "running": true,
    "jobs": [
      {
        "id": "reminders_48h",
        "name": "Rappels CPN 48h avant",
        "next_run_time": "2024-12-15T10:00:00Z",
        "trigger": "cron[hour='*', minute='0']"
      },
      ...
    ]
  }
}
```

### Redémarrer le scheduler (Admin uniquement)

```http
POST /api/scheduler/restart
Authorization: Bearer <token_admin>
```

### Exécuter manuellement une tâche

```http
POST /api/scheduler/jobs/48h/run
POST /api/scheduler/jobs/24h/run
POST /api/scheduler/jobs/today/run
POST /api/scheduler/jobs/missed/run
Authorization: Bearer <token>
```

## 🔍 Logs

Le système génère des logs détaillés pour le suivi :

```
INFO: Vérification rappels 48h: 3 CPN trouvées
INFO: Rappel 48h envoyé pour CPN 123 (patiente 45)
ERROR: Erreur lors de l'envoi du rappel 48h pour CPN 124: ...
```

Les logs sont accessibles via le logger Python standard :

```python
import logging
logger = logging.getLogger("mamaplus.scheduler")
```

## 🛡️ Gestion des erreurs

### Protection contre les doublons

- **Fenêtre de temps** : Les vérifications utilisent une fenêtre de ±30 minutes pour éviter les doublons
- **Flags de rappel** : Chaque CPN a des flags (`rappel_sms_envoye`, `rappel_whatsapp_envoye`) pour éviter les envois multiples
- **Vérification des dates** : Les rappels ne sont envoyés que si les conditions sont remplies

### Gestion des échecs

- Les erreurs sont loggées mais n'interrompent pas le scheduler
- Chaque tâche gère ses propres erreurs avec try/except
- Les transactions de base de données sont rollbackées en cas d'erreur

## 📊 Base de données

### Modèle CPN

Les champs suivants sont utilisés pour le suivi des rappels :

```python
rappel_sms_envoye: bool
rappel_whatsapp_envoye: bool
rappel_ussd_envoye: bool
date_rappel_sms: DateTime
date_rappel_whatsapp: DateTime
date_rappel_ussd: DateTime
```

### Modèle Rappel

Chaque rappel envoyé est enregistré dans la table `rappels` :

```python
cpn_id: int
type_rappel: TypeRappel (SMS, WHATSAPP, USSD)
date_envoi: DateTime
statut: str (envoye, echec, en_attente)
message: Text
numero_destinataire: str
```

## 🚀 Démarrage

### Démarrage automatique

Le scheduler démarre automatiquement avec l'application :

```bash
cd backend
uvicorn main:app --reload
```

Vous devriez voir :
```
✅ Scheduler de rappels automatiques démarré
```

### Vérification

Pour vérifier que le scheduler fonctionne :

1. Accédez à `/api/scheduler/status` via l'API
2. Vérifiez les logs de l'application
3. Créez une CPN avec une date dans 48h et attendez l'heure de vérification

## 🧪 Tests

### Test manuel

1. Créer une CPN avec une date dans 48h :
```python
# Via l'API
POST /api/cpn
{
  "patiente_id": 1,
  "numero_cpn": 1,
  "date_rdv": "2024-12-17T10:00:00Z"
}
```

2. Exécuter manuellement la tâche :
```python
POST /api/scheduler/jobs/48h/run
```

3. Vérifier les logs et la base de données

### Test automatique

Pour tester le système automatiquement, vous pouvez :

1. Modifier temporairement les triggers pour des intervalles plus courts
2. Utiliser des dates de test dans le futur proche
3. Vérifier les enregistrements dans la table `rappels`

## ⚙️ Personnalisation

### Modifier les messages

Les messages sont définis dans `backend/app/services/notifications.py` :

```python
def _build_message(patiente: Patiente, cpn: CPN, reminder_type: Optional[str] = None) -> str:
    if reminder_type == "48h":
        return "Votre message personnalisé..."
```

### Ajouter de nouveaux types de rappels

1. Créer une nouvelle fonction dans `scheduler.py` :
```python
def check_and_send_reminders_custom():
    # Votre logique
    pass
```

2. L'ajouter au scheduler :
```python
sched.add_job(
    check_and_send_reminders_custom,
    trigger=CronTrigger(...),
    id="reminders_custom",
    name="Rappels personnalisés",
)
```

### Modifier les canaux de communication

Par défaut :
- 48h : SMS
- 24h : SMS ou WhatsApp
- Aujourd'hui : WhatsApp
- Manquées : SMS

Pour modifier, éditez les fonctions correspondantes dans `scheduler.py`.

## 📝 Notes importantes

1. **Fuseau horaire** : Le système utilise UTC. Assurez-vous que les dates sont correctement converties.

2. **Performance** : Le scheduler s'exécute en arrière-plan et n'affecte pas les performances de l'API.

3. **Scalabilité** : Pour une utilisation en production avec plusieurs instances, considérez l'utilisation d'un scheduler distribué (Celery avec Redis).

4. **Mode mock** : Sans configuration Twilio, le système fonctionne en mode mock (logs uniquement).

## 🔮 Améliorations futures

- [ ] Support de plusieurs fuseaux horaires
- [ ] Rappels personnalisables par patiente
- [ ] Statistiques d'envoi de rappels
- [ ] Interface d'administration pour gérer les rappels
- [ ] Support de rappels pour les vaccinations
- [ ] Intégration avec un système de queue distribué (Celery)

## 📚 Ressources

- [Documentation APScheduler](https://apscheduler.readthedocs.io/)
- [Documentation Twilio](https://www.twilio.com/docs)
- [Documentation FastAPI Events](https://fastapi.tiangolo.com/advanced/events/)

---

**Version** : 1.0.0  
**Date** : Décembre 2024  
**Auteur** : Équipe MAMA+

