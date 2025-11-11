# Script pour démarrer le serveur backend MAMA+
Write-Host "Démarrage du serveur MAMA+..." -ForegroundColor Green

# Activer l'environnement virtuel
if (Test-Path ".venv\Scripts\Activate.ps1") {
    Write-Host "Activation de l'environnement virtuel..." -ForegroundColor Yellow
    .\.venv\Scripts\Activate.ps1
} elseif (Test-Path "venv\Scripts\Activate.ps1") {
    Write-Host "Activation de l'environnement virtuel..." -ForegroundColor Yellow
    .\venv\Scripts\Activate.ps1
} else {
    Write-Host "Environnement virtuel non trouvé!" -ForegroundColor Red
    Write-Host "Creez un environnement virtuel avec: python -m venv venv" -ForegroundColor Yellow
    exit 1
}

# Aller dans le dossier backend
Set-Location backend

# Démarrer le serveur
Write-Host "Démarrage du serveur sur http://localhost:8000" -ForegroundColor Green
Write-Host "Documentation: http://localhost:8000/docs" -ForegroundColor Cyan
Write-Host "Health check: http://localhost:8000/health" -ForegroundColor Cyan
Write-Host ""
Write-Host "Appuyez sur Ctrl+C pour arrêter le serveur" -ForegroundColor Yellow
Write-Host ""

python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
