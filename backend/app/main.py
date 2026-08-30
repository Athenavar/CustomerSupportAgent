from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.routes import router
from app.database.connection import init_db

app = FastAPI(
    title="TechAssist AI Core",
    description="Universal Electronic Product Customer Support Agent Engine",
    version="1.0.0"
)

# Enable CORS for Next.js frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def startup_event():
    init_db()

# Root endpoint to prevent 404 on base URL
@app.get("/")
def root():
    return {
        "status": "online",
        "service": "TechAssist AI API",
        "docs_url": "/docs",
        "health_url": "/api/health"
    }

# Register all API endpoints under /api
app.include_router(router, prefix="/api")

@app.get("/api/health")
def health():
    return {
        "status": "healthy",
        "service": "TechAssist AI Engine"
    }
