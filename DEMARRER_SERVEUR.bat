@echo off
chcp 65001 >nul
echo ========================================
echo   MAMA+ - Démarrage du serveur backend
echo ========================================
echo.

cd backend

echo [1/3] Vérification de Python...
python --version
if errorlevel 1 (
    echo.
    echo ERREUR: Python n'est pas installé ou pas dans le PATH
    echo Veuillez installer Python depuis https://www.python.org/
    pause
    exit /b 1
)

echo.
echo [2/3] Installation des dépendances...
pip install fastapi uvicorn pandas passlib[bcrypt] pydantic python-multipart -q

echo.
echo [3/3] Démarrage du serveur CSV (version simplifiée)...
echo.
echo ========================================
echo   Le serveur va démarrer sur:
echo   http://localhost:8000
echo.
echo   Documentation API: http://localhost:8000/docs
echo   Health check: http://localhost:8000/health
echo.
echo   Appuyez sur Ctrl+C pour arrêter le serveur
echo ========================================
echo.

uvicorn main_csv:app --reload --host 0.0.0.0 --port 8000

pause

