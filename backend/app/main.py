import sys
import os

# Ensure both app directory and backend directory are in sys.path
app_dir = os.path.abspath(os.path.dirname(__file__))
backend_dir = os.path.abspath(os.path.join(app_dir, '..'))
if app_dir not in sys.path:
    sys.path.insert(0, app_dir)
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import projects, intelligence, national_data, auth, notifications, mp, contractor
from config import config

app = FastAPI(
    title=config.PROJECT_NAME,
    version=config.VERSION,
    description="Pratyaksh — AI-Powered MPLADS Monitoring Intelligence Layer ON TOP of eSAKSHI",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Configure Production CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=config.CORS_ORIGINS if config.CORS_ORIGINS != ["*"] else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Attach Security Response Headers Middleware
@app.middleware("http")
async def add_security_headers(request, call_next):
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    if config.ENVIRONMENT == "production":
        response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
    return response

app.include_router(auth.router, prefix="/api/v1")
app.include_router(auth.router) # Also expose directly at /auth for standard OAuth/REST consumers
app.include_router(notifications.router, prefix="/api/v1")
app.include_router(intelligence.router, prefix="/api/v1")
app.include_router(projects.router, prefix="/api/v1")
app.include_router(mp.router, prefix="/api/v1")
app.include_router(contractor.router, prefix="/api/v1")
app.include_router(national_data.router) # Exposes /api/national-data, /api/states, etc.

@app.get("/")
def root():
    return {
        "status": "ONLINE",
        "system": "Pratyaksh AI-Powered MPLADS Monitoring",
        "positioning": "Intelligence + Independent Verification Layer ON TOP of eSAKSHI",
        "version": config.VERSION,
        "docs": "/docs"
    }

@app.get("/health")
@app.get("/api/v1/ping")
def health_ping():
    """Health check ping endpoint preventing Render free-tier cold starts."""
    return {"status": "HEALTHY", "ping": "PONG", "environment": config.ENVIRONMENT}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
