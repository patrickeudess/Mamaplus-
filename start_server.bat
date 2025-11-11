@echo off
echo ========================================
echo   MAMA+ - Demarrage du serveur backend
echo ========================================
echo.

cd backend

echo [1/3] Verification de l'environnement...
python --version
if errorlevel 1 (
    echo ERREUR: Python n'est pas installe ou pas dans le PATH
    pause
    exit /b 1
)

echo.
echo [2/3] Installation des dependances (si necessaire)...
pip install fastapi uvicorn pandas passlib[bcrypt] pydantic python-multipart -q

echo.
echo [3/3] Demarrage du serveur...
echo.
echo Le serveur va demarrer sur http://localhost:8000
echo Appuyez sur Ctrl+C pour arreter le serveur
echo.

REM Choisir la version : CSV (plus simple) ou SQL (version complete)
REM Pour utiliser CSV, decommenter la ligne suivante :
uvicorn main_csv:app --reload --host 0.0.0.0 --port 8000

REM Pour utiliser SQL, decommenter la ligne suivante :
REM uvicorn main:app --reload --host 0.0.0.0 --port 8000

pause

