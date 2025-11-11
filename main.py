from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine, Base
from app import models

# Créer les tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="MAMA+ API",
    description="API pour le suivi des consultations prénatales en Afrique de l'Ouest",
    version="1.0.0"
)

# Configuration CORS - Autoriser toutes les origines en développement
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # En développement, autoriser toutes les origines
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Importer les routers
from app.api import auth, patientes, cpn, consultations, vaccinations, dashboard, chatbot, prediction

app.include_router(auth.router, prefix="/api/auth", tags=["Authentification"])
app.include_router(patientes.router, prefix="/api/patientes", tags=["Patientes"])
app.include_router(cpn.router, prefix="/api/cpn", tags=["CPN"])
app.include_router(consultations.router, prefix="/api/consultations", tags=["Consultations"])
app.include_router(vaccinations.router, prefix="/api/vaccinations", tags=["Vaccinations"])
app.include_router(dashboard.router, prefix="/api/dashboard", tags=["Tableau de bord"])
app.include_router(chatbot.router, prefix="/api/chatbot", tags=["Chatbot"])
app.include_router(prediction.router, prefix="/api/prediction", tags=["Prédictions"])


@app.get("/")
async def root():
    return {
        "message": "Bienvenue sur l'API MAMA+",
        "version": "1.0.0",
        "docs": "/docs"
    }


@app.get("/health")
async def health_check():
    return {"status": "healthy"}

