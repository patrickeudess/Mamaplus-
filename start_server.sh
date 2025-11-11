#!/bin/bash

echo "========================================"
echo "  MAMA+ - Démarrage du serveur backend"
echo "========================================"
echo ""

cd backend

echo "[1/3] Vérification de l'environnement..."
if ! command -v python3 &> /dev/null; then
    echo "ERREUR: Python3 n'est pas installé"
    exit 1
fi

python3 --version

echo ""
echo "[2/3] Installation des dépendances (si nécessaire)..."
pip3 install fastapi uvicorn pandas passlib[bcrypt] pydantic python-multipart -q

echo ""
echo "[3/3] Démarrage du serveur..."
echo ""
echo "Le serveur va démarrer sur http://localhost:8000"
echo "Appuyez sur Ctrl+C pour arrêter le serveur"
echo ""

# Choisir la version : CSV (plus simple) ou SQL (version complète)
# Pour utiliser CSV, décommenter la ligne suivante :
uvicorn main_csv:app --reload --host 0.0.0.0 --port 8000

# Pour utiliser SQL, décommenter la ligne suivante :
# uvicorn main:app --reload --host 0.0.0.0 --port 8000

